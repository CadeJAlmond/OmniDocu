/**
 * @file Folder Routes
 * @description CRUD endpoints for folders with document assignment
 */

import { Router, Request, Response } from 'express';
import { query, transaction } from '../config/database.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { CreateFolderRequest, UpdateFolderRequest } from '../types/index.js';

const router = Router();

/**
 * @route GET /api/v1/folders
 * @description Get all folders for the authenticated user
 * @access Private
 * @queryParam {number} page - Page number (default: 1)
 * @queryParam {number} limit - Folders per page (default: 20)
 * @queryParam {string} search - Search term for folder title
 * @returns {Object} Paginated list of folders with documents
 */
router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const totalCountRes = await query(
      search
        ? 'SELECT COUNT(*) FROM folders WHERE owner_id = $1 AND title ILIKE $2'
        : 'SELECT COUNT(*) FROM folders WHERE owner_id = $1',
      search ? [userId, `%${search}%`] : [userId]
    );
    const total = parseInt(totalCountRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const foldersRes = await query(
      search
        ? `SELECT f.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', d.id,
                      'title', d.title,
                      'last_edited', d.last_edited
                    )
                  ) FILTER (WHERE d.id IS NOT NULL), '[]'
                ) AS documents
             FROM folders f
             LEFT JOIN document_folders df ON f.id = df.folder_id
             LEFT JOIN documents d ON df.document_id = d.id
             WHERE f.owner_id = $1 AND f.title ILIKE $2
             GROUP BY f.id
             ORDER BY f.last_modified DESC
             LIMIT $3 OFFSET $4`
        : `SELECT f.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', d.id,
                      'title', d.title,
                      'last_edited', d.last_edited
                    )
                  ) FILTER (WHERE d.id IS NOT NULL), '[]'
                ) AS documents
             FROM folders f
             LEFT JOIN document_folders df ON f.id = df.folder_id
             LEFT JOIN documents d ON df.document_id = d.id
             WHERE f.owner_id = $1
             GROUP BY f.id
             ORDER BY f.last_modified DESC
             LIMIT $2 OFFSET $3`,
      search ? [userId, `%${search}%`, limit, offset] : [userId, limit, offset]
    );

    const folders = foldersRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      color: row.color,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastModified: row.last_modified,
      documents: row.documents || [],
    }));

    res.json({
      success: true,
      data: {
        folders,
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
 * @route POST /api/v1/folders
 * @description Create a new folder
 * @access Private
 * @bodyParam {string} title - Folder title (required)
 * @bodyParam {string} [color] - Folder color hex code (default: #3b82f6)
 * @bodyParam {string[]} [documentIds] - Documents to assign to this folder
 * @returns {Object} Created folder
 */
router.post(
  '/',
  catchAsync(async (req: Request<unknown, unknown, CreateFolderRequest>, res: Response) => {
    const userId = (req as any).user.id;
    const { title, color = '#3b82f6', documentIds } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Folder title is required.',
      });
    }

    const result = await transaction(async (client) => {
      // Validate color format (simple hex validation)
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(color)) {
        throw Object.assign(new Error('Invalid color format. Use hex color (e.g., #3b82f6)'), {
          statusCode: 400,
        });
      }

      // Create folder
      const folderRes = await client.query(
        `INSERT INTO folders (title, color, owner_id, created_at, updated_at, last_modified)
         VALUES ($1, $2, $3, NOW(), NOW(), NOW())
         RETURNING id, title, color, owner_id, created_at, updated_at, last_modified`,
        [title, color, userId]
      );

      const folder = folderRes.rows[0];

      // Assign documents to folder if provided
      if (documentIds && documentIds.length > 0) {
        // Verify all documents belong to user
        const documentsRes = await client.query(
          'SELECT id FROM documents WHERE id = ANY($1) AND owner_id = $2',
          [documentIds, userId]
        );

        const validDocumentIds = documentsRes.rows.map((d) => d.id);

        // Create folder assignments
        for (const documentId of validDocumentIds) {
          await client.query(
            'INSERT INTO document_folders (document_id, folder_id, created_at) VALUES ($1, $2, NOW())',
            [documentId, folder.id]
          );
        }
      }

      // Fetch folder with documents
      const completeRes = await client.query(
        `SELECT f.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', d.id,
                      'title', d.title,
                      'last_edited', d.last_edited
                    )
                  ) FILTER (WHERE d.id IS NOT NULL), '[]'
                ) AS documents
         FROM folders f
         LEFT JOIN document_folders df ON f.id = df.folder_id
         LEFT JOIN documents d ON df.document_id = d.id
         WHERE f.id = $1
         GROUP BY f.id`,
        [folder.id]
      );

      return completeRes.rows[0];
    });

    logger.info('Folder created', { folderId: result.id, userId });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully.',
      data: {
        folder: result,
      },
    });
  })
);

/**
 * @route GET /api/v1/folders/:id
 * @description Get a specific folder by ID (with documents)
 * @access Private
 * @returns {Object} Folder with assigned documents
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const folderRes = await query(
      `SELECT f.*, 
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', d.id,
                    'title', d.title,
                    'last_edited', d.last_edited
                  )
                ) FILTER (WHERE d.id IS NOT NULL), '[]'
              ) AS documents
       FROM folders f
       LEFT JOIN document_folders df ON f.id = df.folder_id
       LEFT JOIN documents d ON df.document_id = d.id
       WHERE f.id = $1 AND f.owner_id = $2
       GROUP BY f.id`,
      [id, userId]
    );

    if (folderRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found.',
      });
    }

    const folder = folderRes.rows[0];

    res.json({
      success: true,
      data: {
        folder: {
          ...folder,
          documents: folder.documents || [],
        },
      },
    });
  })
);

/**
 * @route PUT /api/v1/folders/:id
 * @description Update a folder
 * @access Private
 * @bodyParam {string} [title] - New title
 * @bodyParam {string} [color] - New color
 * @bodyParam {string[]} [documentIds] - Documents to assign (replaces existing)
 * @returns {Object} Updated folder
 */
router.put(
  '/:id',
  catchAsync(async (req: Request<unknown, unknown, UpdateFolderRequest>, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, color, documentIds } = req.body;

    const result = await transaction(async (client) => {
      // First check if folder exists and belongs to user
      const checkRes = await client.query(
        'SELECT * FROM folders WHERE id = $1 AND owner_id = $2',
        [id, userId]
      );

      if (checkRes.rowCount === 0) {
        throw Object.assign(new Error('Folder not found'), { statusCode: 404 });
      }

      const folder = checkRes.rows[0];

      // Update fields if provided
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (title) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }

      if (color) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexColorRegex.test(color)) {
          throw Object.assign(new Error('Invalid color format. Use hex color (e.g., #3b82f6)'), {
            statusCode: 400,
          });
        }
        updates.push(`color = $${paramCount++}`);
        values.push(color);
      }

      if (updates.length > 0) {
        values.push(id);
        values.push(userId);
        await client.query(
          `UPDATE folders SET ${updates.join(', ')}, last_modified = NOW() WHERE id = $${paramCount} AND owner_id = $${paramCount + 1}`,
          values
        );
      }

      // Handle document assignments
      if (documentIds !== undefined) {
        // Remove existing document assignments
        await client.query('DELETE FROM document_folders WHERE folder_id = $1', [id]);

        // Add new assignments (validate ownership)
        if (documentIds.length > 0) {
          const documentsRes = await client.query(
            'SELECT id FROM documents WHERE id = ANY($1) AND owner_id = $2',
            [documentIds, userId]
          );

          const validDocumentIds = documentsRes.rows.map((d) => d.id);

          for (const documentId of validDocumentIds) {
            await client.query(
              'INSERT INTO document_folders (document_id, folder_id, created_at) VALUES ($1, $2, NOW())',
              [documentId, id]
            );
          }
        }
      }

      // Fetch updated folder with documents
      const updatedRes = await client.query(
        `SELECT f.*, 
                COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', d.id,
                      'title', d.title,
                      'last_edited', d.last_edited
                    )
                  ) FILTER (WHERE d.id IS NOT NULL), '[]'
                ) AS documents
         FROM folders f
         LEFT JOIN document_folders df ON f.id = df.folder_id
         LEFT JOIN documents d ON df.document_id = d.id
         WHERE f.id = $1 AND f.owner_id = $2
         GROUP BY f.id`,
        [id, userId]
      );

      return updatedRes.rows[0];
    });

    logger.info('Folder updated', { folderId: id, userId });

    res.json({
      success: true,
      message: 'Folder updated successfully.',
      data: {
        folder: result,
      },
    });
  })
);

/**
 * @route DELETE /api/v1/folders/:id
 * @description Delete a folder (removes assignments only, not documents)
 * @access Private
 */
router.delete(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await transaction(async (client) => {
      // Check if folder exists
      const folderRes = await client.query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
        [id, userId]
      );

      if (folderRes.rowCount === 0) {
        throw Object.assign(new Error('Folder not found'), { statusCode: 404 });
      }

      // Delete folder (document assignments are deleted via CASCADE)
      const deleteRes = await client.query(
        'DELETE FROM folders WHERE id = $1 AND owner_id = $2 RETURNING id',
        [id, userId]
      );

      return deleteRes.rows[0];
    });

    logger.info('Folder deleted', { folderId: id, userId });

    res.json({
      success: true,
      message: 'Folder deleted successfully.',
    });
  })
);

export default router;