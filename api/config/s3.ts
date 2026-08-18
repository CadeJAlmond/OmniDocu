/**
 * @file AWS S3 Configuration
 * @description S3 client configuration and storage utilities for document content
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AWS S3 client instance configured with credentials from environment
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Bucket name for storing document content
 */
export const DOCUMENTS_BUCKET = process.env.S3_BUCKET_NAME || '';

/**
 * Store document content in S3
 * @param {string} key - S3 object key (document ID)
 * @param {string | Buffer} body - Content to store
 * @param {string} contentType - MIME type of content
 * @returns {Promise<{ etag: string, version: string }>} S3 ETag and version
 */
export const storeDocumentContent = async (
  key: string,
  body: string | Buffer,
  contentType: string = 'application/json'
): Promise<{ etag: string; version: string }> => {
  const command = new PutObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
      appName: 'omnidocu',
    },
  });

  const response = await s3Client.send(command);
  
  return {
    etag: response.ETag || '',
    version: response.VersionId || '1',
  };
};

/**
 * Retrieve document content from S3
 * @param {string} key - S3 object key
 * @returns {Promise<string>} Document content as string
 */
export const getDocumentContent = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('No content found for this document');
  }

  return await response.Body.transformToString();
};

/**
 * Delete document content from S3
 * @param {string} key - S3 object key
 */
export const deleteDocumentContent = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Generate a presigned URL for direct upload to S3 (for large files)
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Presigned upload URL
 */
export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string
): Promise<string> => {
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  
  const command = new PutObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};

export default s3Client;