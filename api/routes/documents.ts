/**
 * @file Document Routes
 * @description CRUD endpoints for documents with S3 content storage
 */

import { Router, Request, Response } from 'express';
import { query, transaction } from '../config/database.js';
import { storeDocumentContent, getDocumentContent, deleteDocumentContent } from '../config/s3.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { CreateDocumentRequest, UpdateDocumentRequest } from '../types/index.js';

const router = Router();

/**
 * @route GET /api/v1/documents
 * @description Get all documents for the authenticated user
 * @access Private
 * @queryParam {number} page - Page number (default: 1)
 * @queryParam {number} limit - Documents per page (default: 20)
 * @queryParam {string} search - Search term for document title
 * @returns {Object} Paginated list of documents
 */
router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page   = parseInt(req.query.page as string) || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const totalCountRes = await query(
      search
        ? 'SELECT COUNT(*) FROM documents WHERE owner_id = $1 AND title ILIKE $2'
        : 'SELECT COUNT(*) FROM documents WHERE owner_id = $1',
      search ? [userId, `%${search}%`] : [userId]
    );
    const total = parseInt(totalCountRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const documentsRes = await query(
      search
        ? `SELECT d.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', f.id,
                      'title', f.title,
                      'color', f.color
                    )
                  ) FILTER (WHERE f.id IS NOT NULL), '[]'
                ) AS folders
             FROM documents d
             LEFT JOIN document_folders df ON d.id = df.document_id
             LEFT JOIN folders f ON df.folder_id = f.id
             WHERE d.owner_id = $1 AND d.title ILIKE $2
             GROUP BY d.id
             ORDER BY d.last_edited DESC
             LIMIT $3 OFFSET $4`
        : `SELECT d.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', f.id,
                      'title', f.title,
                      'color', f.color
                    )
                  ) FILTER (WHERE f.id IS NOT NULL), '[]'
                ) AS folders
             FROM documents d
             LEFT JOIN document_folders df ON d.id = df.document_id
             LEFT JOIN folders f ON df.folder_id = f.id
             WHERE d.owner_id = $1
             GROUP BY d.id
             ORDER BY d.last_edited DESC
             LIMIT $2 OFFSET $3`,
      search ? [userId, `%${search}%`, limit, offset] : [userId, limit, offset]
    );

    const documents = documentsRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      contentKey: row.content_key,
      contentEtag: row.content_etag,
      contentVersion: row.content_version,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastEdited: row.last_edited,
      folders: row.folders || [],
    }));

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  })
);

/**
 * @route POST /api/v1/documents
 * @description Create a new document with content stored in S3
 * @access Private
 * @bodyParam {string} title - Document title (required)
 * @bodyParam {string} content - Document content (required)
 * @bodyParam {string[]} [folderIds] - Array of folder IDs to assign
 * @returns {Object} Created document
 */
router.post(
  '/',
  catchAsync(async (req: Request<unknown, unknown, CreateDocumentRequest>, res: Response) => {
    const userId = (req as any).user.id;
    const { title, content, folderIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    const result = await transaction(async (client) => {
      // Create document metadata
      const docRes = await client.query(
        `INSERT INTO documents (title, owner_id, created_at, updated_at, last_edited)
         VALUES ($1, $2, NOW(), NOW(), NOW())
         RETURNING id, title, content_key, content_etag, content_version, owner_id, created_at, updated_at, last_edited`,
        [title, userId]
      );

      const document = docRes.rows[0];

      // Store content in S3
      const contentKey = `${document.id}`;
      const { etag, version } = await storeDocumentContent(contentKey, content, 'text/plain');

      // Update document with S3 info
      await client.query(
        'UPDATE documents SET content_key = $1, content_etag = $2, content_version = $3 WHERE id = $4',
        [contentKey, etag, version, document.id]
      );

      document.content_key = contentKey;
      document.content_etag = etag;
      document.content_version = version;

      // Assign to folders if provided
      if (folderIds && folderIds.length > 0) {
        // Verify all folders belong to user
        const foldersRes = await client.query(
          'SELECT id FROM folders WHERE id = ANY($1) AND owner_id = $2',
          [folderIds, userId]
        );

        const validFolderIds = foldersRes.rows.map((f) => f.id);

        // Create folder assignments
        for (const folderId of validFolderIds) {
          await client.query(
            'INSERT INTO document_folders (document_id, folder_id, created_at) VALUES ($1, $2, NOW())',
            [document.id, folderId]
          );
        }
      }

      return document;
    });

    // Fetch document with folders
    const docWithFolders = await query(
      `SELECT d.*, 
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', f.id,
                    'title', f.title,
                    'color', f.color
                  )
                ) FILTER (WHERE f.id IS NOT NULL), '[]'
              ) AS folders
       FROM documents d
       LEFT JOIN document_folders df ON d.id = df.document_id
       LEFT JOIN folders f ON df.folder_id = f.id
       WHERE d.id = $1
       GROUP BY d.id`,
      [result.id]
    );

    logger.info('Document created', { documentId: result.id, userId });

    res.status(201).json({
      success: true,
      message: 'Document created successfully.',
      data: {
        document: {
          ...docWithFolders.rows[0],
          folders: docWithFolders.rows[0].folders || [],
        },
      },
    });
  })
);

/**
 * @route GET /api/v1/documents/:id
 * @description Get a specific document by ID (with content)
 * @access Private
 * @returns {Object} Document with content
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Get document metadata
    const docRes = await query(
      `SELECT d.*, 
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', f.id,
                    'title', f.title,
                    'color', f.color
                  )
                ) FILTER (WHERE f.id IS NOT NULL), '[]'
              ) AS folders
       FROM documents d
       LEFT JOIN document_folders df ON d.id = df.document_id
       LEFT JOIN folders f ON df.folder_id = f.id
       WHERE d.id = $1 AND d.owner_id = $2
       GROUP BY d.id`,
      [id, userId]
    );

    if (docRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    const document = docRes.rows[0];

    // Get content from S3
    let content: string | null = null;
    if (document.content_key) {
      try {
        content = await getDocumentContent(document.content_key);
      } catch (error) {
        logger.error('Failed to retrieve content from S3', { error, documentId: document.id });
        // Continue without content
      }
    }

    res.json({
      success: true,
      data: {
        document: {
          ...document,
          content,
          folders: document.folders || [],
        },
      },
    });
  })
);

/**
 * @route PUT /api/v1/documents/:id
 * @description Update a document
 * @access Private
 * @bodyParam {string} [title] - New title
 * @bodyParam {string} [content] - New content
 * @bodyParam {string[]} [folderIds] - Folders to assign (replaces existing)
 * @returns {Object} Updated document
 */
router.put(
  '/:id',
  catchAsync(async (req: Request<unknown, unknown, UpdateDocumentRequest>, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, content, folderIds } = req.body;

    const result = await transaction(async (client) => {
      // First check if document exists and belongs to user
      const checkRes = await client.query(
        'SELECT * FROM documents WHERE id = $1 AND owner_id = $2',
        [id, userId]
      );

      if (checkRes.rowCount === 0) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
      }

      const document = checkRes.rows[0];

      // Update fields if provided
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (title) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }

      // Handle content update if provided
      if (content !== undefined) {
        const contentKey = `${document.id}`;
        const { etag, version } = await storeDocumentContent(contentKey, content, 'text/plain');
        updates.push(`content_key = $${paramCount++}`);
        values.push(contentKey);
        updates.push(`content_etag = $${paramCount++}`);
        values.push(etag);
        updates.push(`content_version = $${paramCount++}`);
        values.push(version);
        updates.push(`last_edited = NOW()`);
      }

      if (updates.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE documents SET ${updates.join(', ')} WHERE id = $${paramCount} AND owner_id = $${paramCount + 1}`,
          [...values, userId]
        );
      }

      // Handle folder assignments
      if (folderIds !== undefined) {
        // Remove existing folder assignments
        await client.query('DELETE FROM document_folders WHERE document_id = $1', [id]);

        // Add new assignments (validate ownership)
        if (folderIds.length > 0) {
          const foldersRes = await client.query(
            'SELECT id FROM folders WHERE id = ANY($1) AND owner_id = $2',
            [folderIds, userId]
          );

          const validFolderIds = foldersRes.rows.map((f) => f.id);

          for (const folderId of validFolderIds) {
            await client.query(
              'INSERT INTO document_folders (document_id, folder_id, created_at) VALUES ($1, $2, NOW())',
              [id, folderId]
            );
          }
        }
      }

      // Fetch updated document with folders
      const updatedRes = await client.query(
        `SELECT d.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', f.id,
                      'title', f.title,
                      'color', f.color
                    )
                  ) FILTER (WHERE f.id IS NOT NULL), '[]'
                ) AS folders
         FROM documents d
         LEFT JOIN document_folders df ON d.id = df.document_id
         LEFT JOIN folders f ON df.folder_id = f.id
         WHERE d.id = $1 AND d.owner_id = $2
         GROUP BY d.id`,
        [id, userId]
      );

      return updatedRes.rows[0];
    });

    logger.info('Document updated', { documentId: id, userId });

    res.json({
      success: true,
      message: 'Document updated successfully.',
      data: {
        document: result,
      },
    });
  })
);

/**
 * @route DELETE /api/v1/documents/:id
 * @description Delete a document (and content from S3)
 * @access Private
 */
router.delete(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await transaction(async (client) => {
      // Get document to delete content from S3
      const docRes = await client.query(
        'SELECT content_key FROM documents WHERE id = $1 AND owner_id = $2',
        [id, userId]
      );

      if (docRes.rowCount === 0) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
      }

      const document = docRes.rows[0];

      // Delete content from S3
      if (document.content_key) {
        try {
          await deleteDocumentContent(document.content_key);
        } catch (error) {
          logger.error('Failed to delete content from S3', { error, documentId: id });
          // Continue with DB deletion
        }
      }

      // Delete document (folder assignments are deleted via CASCADE)
      const deleteRes = await client.query(
        'DELETE FROM documents WHERE id = $1 AND owner_id = $2 RETURNING id',
        [id, userId]
      );

      return deleteRes.rows[0];
    });

    logger.info('Document deleted', { documentId: id, userId });

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  })
);

export default router;