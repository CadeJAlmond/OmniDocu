/**
 * @file Shared TypeScript Interfaces
 * @description Central type definitions for the application
 */

import { Request } from 'express';

/**
 * User entity representing an application user
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
}

/**
 * Document entity representing a note/document
 */
export interface Document {
  id: string;
  title: string;
  contentKey: string | null;
  contentEtag: string | null;
  contentVersion: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastEdited: Date;
  folders: FolderSummary[];
}

/**
 * Folder entity representing an organizational container
 */
export interface Folder {
  id: string;
  title: string;
  color: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastModified: Date;
  documents: DocumentSummary[];
}

/**
 * Folder summary (without nested documents, for document responses)
 */
export interface FolderSummary {
  id: string;
  title: string;
  color: string;
}

/**
 * Document summary (without nested folders, for folder responses)
 */
export interface DocumentSummary {
  id: string;
  title: string;
  lastEdited: Date;
}

/**
 * Document content stored in S3
 */
export interface DocumentContent {
  title: string;
  content: string;
  format: 'markdown' | 'plaintext' | 'html';
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  pagination?: Pagination;
}

/**
 * Authenticated request with user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Signup request body
 */
export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Signin request body
 */
export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * Create document request body
 */
export interface CreateDocumentRequest {
  title: string;
  content: string;
  folderIds?: string[];
}

/**
 * Update document request body
 */
export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  folderIds?: string[];
}

/**
 * Create folder request body
 */
export interface CreateFolderRequest {
  title: string;
  color?: string;
  documentIds?: string[];
}

/**
 * Update folder request body
 */
export interface UpdateFolderRequest {
  title?: string;
  color?: string;
  documentIds?: string[];
}