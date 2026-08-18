/**
 * @file Combined Routes
 * @description Endpoints that combine folders and documents in optimized queries
 */

import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { getDocumentContent } from '../config/s3.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @route GET /api/v1/combined/all
 * @description Get all folders and documents sorted by most recently edited/modified
 * @access Private
 * @queryParam {number} page - Page number (default: 1)
 * @queryParam {number} limit - Items per page (default: 20)
 * @queryParam {boolean} includeContent - Include document content from S3 (default: false)
 * @returns {Object} Combined list of folders and documents sorted by last activity
 */
router.get(
  '/all',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeContent = req.query.includeContent === 'true';
    const offset = (page - 1) * limit;

    // Single query that unions folders and documents, orders by last activity
    const combinedRes = await query(
      `
      WITH recent_activity AS (
        -- Documents with their latest activity
        SELECT 
          id,
          title,
          'document' as type,
          last_edited as "lastActivity",
          color as accent_color,
          NULL::text as content_key,
          NULL::text as content_etag,
          content_version
        FROM documents 
        WHERE owner_id = $1
        
        UNION ALL
        
        -- Folders with their latest activity
        SELECT 
          id,
          title,
          'folder' as type,
          last_modified as "lastActivity",
          color,
          NULL::text as content_key,
          NULL::text as content_etag,
          NULL::integer as content_version
        FROM folders 
        WHERE owner_id = $1
      )
      SELECT 
        ra.id,
        ra.title,
        ra.type,
        ra."lastActivity",
        ra.accent_color as color,
        ra.content_key,
        ra.content_etag,
        ra.content_version,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', assoc.id,
              'title', assoc.title,
              'color', assoc.color,
              CASE 
                WHEN ra.type = 'document' THEN assoc.last_edited
                ELSE assoc.last_modified
              END as "lastActivity"
            )
          ) FILTER (WHERE assoc.id IS NOT NULL), 
          '[]'
        ) AS related
      FROM recent_activity ra
      LEFT JOIN (
        -- Related items for documents (folders)
        SELECT 
          f.id, 
          f.title, 
          f.color, 
          f.last_modified,
          f.last_edited,
          df.document_id
        FROM folders f
        LEFT JOIN document_folders df ON f.id = df.folder_id
        WHERE f.owner_id = $1
        
        UNION ALL
        
        -- Related items for folders (documents)
        SELECT 
          d.id,
          d.title,
          d.color,
          d.last_modified,
          d.last_edited,
          df.folder_id as document_id
        FROM documents d
        LEFT JOIN document_folders df ON d.id = df.document_id
        WHERE d.owner_id = $1
      ) assoc ON (
        (ra.type = 'document' AND assoc.document_id = ra.id) OR
        (ra.type = 'folder' AND assoc.id IN (
          SELECT d.id 
          FROM document_folders df 
          JOIN documents d ON df.document_id = d.id 
          WHERE df.folder_id = ra.id
        ))
      )
      GROUP BY ra.id, ra.title, ra.type, ra."lastActivity", ra.accent_color, ra.content_key, ra.content_etag, ra.content_version
      ORDER BY ra."lastActivity" DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    // Enrich with related items using a more optimized approach
    const combinedResOptimized = await query(
      `
      WITH all_items AS (
        SELECT 
          id,
          title,
          'document' as type,
          last_edited as "lastActivity",
          color as accent_color,
          content_key,
          content_etag,
          content_version
        FROM documents 
        WHERE owner_id = $1
        
        UNION ALL
        
        SELECT 
          id,
          title,
          'folder' as type,
          last_modified as "lastActivity",
          color,
          NULL::text as content_key,
          NULL::text as content_etag,
          NULL::integer as content_version
        FROM folders 
        WHERE owner_id = $1
      )
      SELECT 
        id,
        title,
        type,
        "lastActivity",
        accent_color as color,
        content_key,
        content_etag,
        content_version
      FROM all_items
      ORDER BY "lastActivity" DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    const items = combinedResOptimized.rows;

    // For each item, fetch related items (folders for documents, documents for folders)
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const baseItem = {
          id: item.id,
          title: item.title,
          type: item.type,
          lastActivity: item.lastActivity,
          color: item.color,
        };

        if (item.type === 'document') {
          // Fetch folders for this document
          const foldersRes = await query(
            `SELECT f.id, f.title, f.color 
             FROM folders f
             JOIN document_folders df ON f.id = df.folder_id
             WHERE df.document_id = $1 AND f.owner_id = $2`,
            [item.id, userId]
          );

          const enriched: any = { ...baseItem };
          
          if (item.content_key && includeContent) {
            try {
              const content = await getDocumentContent(item.content_key);
              enriched.content = content;
            } catch (error) {
              logger.error('Failed to retrieve content from S3', { 
                error, 
                documentId: item.id 
              });
            }
          }

          enriched.folders = foldersRes.rows || [];
          enriched.contentKey = item.content_key;
          enriched.contentEtag = item.content_etag;
          enriched.contentVersion = item.content_version;

          return enriched;
        } else {
          // Fetch documents for this folder
          const documentsRes = await query(
            `SELECT d.id, d.title, d.last_edited
             FROM documents d
             JOIN document_folders df ON d.id = df.document_id
             WHERE df.folder_id = $1 AND d.owner_id = $2
             ORDER BY d.last_edited DESC`,
            [item.id, userId]
          );

          return {
            ...baseItem,
            documents: documentsRes.rows || [],
          };
        }
      })
    );

    // Get total counts for pagination
    const countRes = await query(
      `SELECT 
         (SELECT COUNT(*) FROM documents WHERE owner_id = $1) +
         (SELECT COUNT(*) FROM folders WHERE owner_id = $1) as total`,
      [userId]
    );
    const total = parseInt(countRes.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Separate into folders and documents for structured response
    const documents = enrichedItems.filter((item) => item.type === 'document');
    const folders = enrichedItems.filter((item) => item.type === 'folder');

    logger.info('Combined items fetched', { userId, documentCount: documents.length, folderCount: folders.length });

    res.json({
      success: true,
      data: {
        documents,
        folders,
        combined: enrichedItems, // All items interleaved and sorted
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

export default router;