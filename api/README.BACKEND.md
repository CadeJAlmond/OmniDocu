# OmniDocu Backend API

A modern, production-ready Node.js/Express backend for the OmniDocu note-taking application. Built with TypeScript, PostgreSQL, and AWS S3 for scalable document storage.

## Features

- **User Authentication** - Secure signup/signin with JWT tokens and bcrypt password hashing
- **Document Management** - Full CRUD operations for notes with content stored in S3
- **Folder Organization** - Create folders with custom colors and organize documents
- **Many-to-Many Relationships** - Assign documents to multiple folders and vice versa
- **Optimized Queries** - Combined endpoint returning sorted folders and documents
- **S3 Integration** - Document content stored in AWS S3 with versioning and ETags
- **Security** - Helmet, CORS, rate limiting, and secure JWT handling
- **Database Transactions** - ACID-compliant operations using PostgreSQL transactions
- **Comprehensive Logging** - Structured logging for debugging and monitoring

## Tech Stack

- **Node.js 20+** with TypeScript
- **Express.js 4.x** - Fast, unopinionated web framework
- **PostgreSQL** - Relational database for metadata (AWS RDS)
- **AWS S3** - Object storage for document content
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Request rate limiting

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- PostgreSQL database (AWS RDS or local)
- AWS S3 bucket
- AWS credentials with S3 access

## Installation

```bash
# Install backend dependencies
npm install --package-package.backend.json

# Or if you've merged into main package.json
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Then apply the schema to your database
psql -f schema.sql
```

## Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# PostgreSQL Database (AWS RDS)
DB_HOST=your-db-instance.region.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=omnidocu
DB_SSL=true

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=omnidocu-documents

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Authentication

#### Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "fullName": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### Signin
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <jwt-token>
```

### Documents

#### List Documents
```http
GET /api/v1/documents?page=1&limit=20&search=term
Authorization: Bearer <jwt-token>
```

#### Create Document
```http
POST /api/v1/documents
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My Document",
  "content": "Document content here",
  "folderIds": ["folder-uuid-1", "folder-uuid-2"]
}
```

#### Get Document
```http
GET /api/v1/documents/:id
Authorization: Bearer <jwt-token>
```

#### Update Document
```http
PUT /api/v1/documents/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "folderIds": ["folder-uuid"]
}
```

#### Delete Document
```http
DELETE /api/v1/documents/:id
Authorization: Bearer <jwt-token>
```

### Folders

#### List Folders
```http
GET /api/v1/folders?page=1&limit=20&search=term
Authorization: Bearer <jwt-token>
```

#### Create Folder
```http
POST /api/v1/folders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Project Notes",
  "color": "#3b82f6",
  "documentIds": ["doc-uuid-1", "doc-uuid-2"]
}
```

#### Get Folder
```http
GET /api/v1/folders/:id
Authorization: Bearer <jwt-token>
```

#### Update Folder
```http
PUT /api/v1/folders/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Folder",
  "color": "#ef4444",
  "documentIds": ["doc-uuid"]
}
```

#### Delete Folder
```http
DELETE /api/v1/folders/:id
Authorization: Bearer <jwt-token>
```

### Combined View

#### Get All Items (Folders + Documents)
```http
GET /api/v1/combined/all?page=1&limit=20&includeContent=false
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "documents": [ ... ],
    "folders": [ ... ],
    "combined": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files (database, S3)
│   ├── middleware/       # Express middleware (auth, error handling)
│   ├── routes/           # API route handlers
│   ├── utils/            # Utility functions (password, JWT, logging)
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Server entry point
├── schema.sql            # PostgreSQL database schema
├── .env.example          # Environment variable template
├── tsconfig.json         # TypeScript configuration
├── package.json          # Backend dependencies
└── README.BACKEND.md     # This file
```

## Database Schema

The application uses PostgreSQL with the following tables:

- **users** - User accounts with hashed passwords
- **documents** - Document metadata with S3 reference keys
- **folders** - Folder metadata with color settings
- **document_folders** - Junction table for many-to-many relationship

View the complete schema in [`schema.sql`](schema.sql).

## Security

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire (configurable, default: 7 days)
- Rate limiting prevents brute force attacks
- Helmet.js sets secure HTTP headers
- CORS is configured to restrict origins
- Input validation prevents injection attacks
- Database queries use parameterized statements

## S3 Integration

Document content is stored in AWS S3 with:

- Each document's content stored as an object keyed by document UUID
- ETag tracking for version control
- Version numbering for optimistic concurrency
- Support for presigned URLs for direct uploads

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For issues or questions, please open an issue on the repository.