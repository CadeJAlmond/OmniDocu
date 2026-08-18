-- OmniDocu Database Schema
-- PostgreSQL compatible
-- Created for note-taking application with folder/document organization

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores user account information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,

    -- Indexes for performance
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);

-- Documents table - stores document metadata
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content_key VARCHAR(512), -- S3 key for document content
    content_etag VARCHAR(128), -- ETag for version control
    content_version INTEGER DEFAULT 1,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes for performance
    INDEX idx_documents_owner (owner_id),
    INDEX idx_documents_created_at (created_at),
    INDEX idx_documents_updated_at (updated_at),
    INDEX idx_documents_last_edited (last_edited)
);

-- Folders table - stores folder metadata
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Default blue color
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_folders_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes for performance
    INDEX idx_folders_owner (owner_id),
    INDEX idx_folders_created_at (created_at),
    INDEX idx_folders_updated_at (updated_at),
    INDEX idx_folders_last_modified (last_modified)
);

-- Junction table for many-to-many relationship between documents and folders
-- Allows documents to belong to multiple folders and folders to contain multiple documents
CREATE TABLE IF NOT EXISTS document_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    folder_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint to prevent duplicate assignments
    CONSTRAINT unique_document_folder UNIQUE (document_id, folder_id),

    -- Foreign key constraints
    CONSTRAINT fk_document_folders_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_folders_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,

    -- Indexes for performance
    INDEX idx_document_folders_document (document_id),
    INDEX idx_document_folders_folder (folder_id)
);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
UPDATE documents SET last_edited = CURRENT_TIMESTAMP WHERE id = NEW.id;

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for optimized querying of documents with their folders
CREATE OR REPLACE VIEW document_with_folders AS
SELECT 
    d.id,
    d.title,
    d.content_key,
    d.content_etag,
    d.content_version,
    d.owner_id,
    d.created_at,
    d.updated_at,
    d.last_edited,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', f.id,
                'title', f.title,
                'color', f.color
            )
        ) FILTER (WHERE f.id IS NOT NULL),
        '[]'
    ) AS folders
FROM documents d
LEFT JOIN document_folders df ON d.id = df.document_id
LEFT JOIN folders f ON df.folder_id = f.id
GROUP BY d.id;

-- Create a view for optimized querying of folders with their documents
CREATE OR REPLACE VIEW folder_with_documents AS
SELECT 
    f.id,
    f.title,
    f.color,
    f.owner_id,
    f.created_at,
    f.updated_at,
    f.last_modified,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', d.id,
                'title', d.title,
                'last_edited', d.last_edited
            )
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'
    ) AS documents
FROM folders f
LEFT JOIN document_folders df ON f.id = df.folder_id
LEFT JOIN documents d ON df.document_id = d.id
GROUP BY f.id;