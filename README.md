# File Upload, Download, and User Authentication

A React and Express application for personal file galleries. Users register, sign in, upload files, and manage only their own uploads. Each uploaded file can be shared with its download page and a separate access code.

## Features

- Account registration with bcrypt password hashing
- One-day JWT access tokens for authenticated API requests
- Per-user upload, listing, and deletion
- JPEG, PNG, and PDF uploads up to 5 MB
- Random stored filenames and local disk storage
- Share downloads protected by a per-file 48-character access code
- MongoDB metadata with legacy file ownership migration on first dashboard load

## Setup

Requires Node.js, npm, and a running MongoDB instance.

### Backend

```sh
cd backend
npm install
```

Copy `.env.example` to `.env` (`cp .env.example .env`). Generate a signing secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in `JWT_SECRET_KEY` in `backend/.env`. Set `MONGODB_URI` if MongoDB is not running locally, then start the API:

```sh
npm run dev
```

The API listens on `http://localhost:1198` by default.

### Frontend

In another terminal:

```sh
cd frontend
npm install
npm start
```

The React development server runs on `http://localhost:3000` and proxies API requests to the backend.

## Using the gallery

1. Create an account and log in.
2. Upload a JPEG, PNG, or PDF file up to 5 MB.
3. In the dashboard, copy the file's download page and access code.
4. Send both values to the recipient. The access code grants access to that file only.

File records created by older versions are matched to the signed-in account by username when the dashboard loads. The app then stores the account ID and replaces the old short access code with a new random code.

## API

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/register` | Public |
| `POST` | `/api/login` | Public |
| `GET` | `/api/user` | Bearer token |
| `POST` | `/api/file/upload` | Bearer token, multipart field `file` |
| `GET` | `/api/file/files` | Bearer token; returns the signed-in user's files |
| `DELETE` | `/api/file/files/:id` | Bearer token; owner only |
| `POST` | `/api/file/url-download/:id` | Per-file access code in the JSON body |

Authenticated requests use `Authorization: Bearer <token>`. Tokens expire after one day.

## Storage and file checks

Uploads are stored in `backend/api/uploads`; MongoDB stores their metadata. The server checks the declared MIME type, filename extension, and basic JPEG, PNG, or PDF file signature. It does not scan for malware. The access code is a share credential, so share it only with the intended recipient.

## Project layout

```text
backend/   Express API, MongoDB models, auth and upload middleware
frontend/  React gallery, registration, login, and share download pages
```
