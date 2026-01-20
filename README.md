# 🏗️ Landing Zone Orchestrator UI

A React TypeScript application for managing cloud infrastructure with an integrated notes system for documentation and collaboration.

## Features

- **Cloud Infrastructure Management**: Interactive UI for creating and managing landing zones
- **Notes System**: Full-featured notes with rich text editing, search, and user-specific storage
- **Authentication**: JWT-based authentication with token refresh
- **Modern UI**: Material-UI components with dark/light theme support

## Notes System

### Frontend Features

- Rich text editor using TipTap with formatting options
- Fuzzy search using Fuse.js for intelligent text matching
- Real-time search as you type
- Responsive Masonry layout for note cards
- Loading states and error handling
- User-specific note management

### API Integration

The notes system expects these backend endpoints:

```typescript
// GET /api/notes - Get all user notes (paginated)
Response: {
  notes: Note[],
  total: number,
  page: number,
  size: number,
  totalPages: number
}

// POST /api/notes - Create new note
Body: { content: string, plainText?: string }

// PUT /api/notes/:id - Update note
Body: { content: string, plainText?: string }

// DELETE /api/notes/:id - Delete note
```

### Note Interface

```typescript
interface Note {
  id: string;
  content: string; // HTML from TipTap editor
  plainText?: string; // For search functionality
  createdAt: Date;
  updatedAt: Date;
}
```

## Purpose

The **Orchestrator** is a platform that simplifies cloud landing zone creation.
Instead of writing Terraform manually, users fill out a **form/UI** → the system generates validated Terraform templates → pushes them to Git and/or runs deployments.

---

## 2. High-Level Flow

**Step 1 – Input**

- Users log in via the **UI** (React frontend).
- Fill in forms (e.g. VPC, Subnets, IAM, Networking) or upload configuration.

**Step 2 – Orchestration**

- Input sent to **FastAPI backend**.
- Backend stores request in **MongoDB** (config, user metadata).
- Orchestrator generates Terraform code based on schema + templates.

**Step 3 – Validation**

- Code is validated (lint, policy checks, schema validation).
- Feedback/errors are surfaced to the user in the UI.

**Step 4 – Deployment (Future)**

- Validated code is committed to Git.
- CI/CD (e.g. GitHub Actions, Azure DevOps, GitLab CI) applies Terraform to provision resources.
- Monitoring and status updates sent back to UI.

---

## 3. Architecture Diagram (simplified)

```
+------------------+         +-----------------+         +------------------+
|   React Frontend | <-----> | FastAPI Backend | <-----> |   MongoDB Atlas  |
+------------------+         +-----------------+         +------------------+
        |                            |                            |
        v                            v                            v
   User Input                  Template Engine             Config Storage
 (Forms / Editor)            (Terraform Generator)        (Users, Projects)
        |
        v
   Validation & Feedback
        |
        v
 Future: Git / CI/CD / Cloud
```

---

## 4. Components

### **Frontend (React)**

- Multi-step forms for resources (VPC, Subnets, IAM, etc.).
- Schema-based editor (JSON + visual).
- Validation per step.
- Auth screens (login, registration).

### **Backend (FastAPI)**

- REST APIs for resources, wrappers, and templates.
- Authentication (JWT).
- Code generation module:
  - Converts user schema → Terraform HCL.
  - Manages versioning.

### **Database (MongoDB Atlas)**

- Stores projects, templates, and user configs.
- Provides history/audit trail.

### **Terraform Engine**

- Current: Generate TF code for user to download.
- Future: Auto-commit to Git, trigger pipelines.

---

## 5. Current Features

- User authentication & role-based access.
- Schema-driven form builder.
- Terraform template generation.
- Error feedback in UI.
- Project storage in MongoDB.

---

## 6. Roadmap 🚀

**Near Term (3–6 months):**

- ✅ Export Terraform as `.zip`.
- ✅ Support multiple providers (AWS, Azure, GCP).
- 🔄 Add reusable building blocks (modules library).
- 🔄 Improve validation (policy as code, e.g. OPA/Conftest).

**Mid Term (6–12 months):**

- 🚀 GitOps integration: commit Terraform to Git automatically.
- 🚀 CI/CD integration (GitHub Actions, GitLab, Azure DevOps).
- 🚀 Automated apply/destroy workflows.
- 📊 Add monitoring dashboards for deployments.

**Long Term (12+ months):**

- 🌐 Multi-cloud orchestration.
- 🤖 Self-healing infra (auto-fix drift, auto-scale).
- 🧩 Marketplace of templates/modules.
- 🔐 Compliance & governance enforcement.

---

## 7. Step-by-Step Explanation (for presentations)

1. **User logs in** → sees dashboard.
2. **Fills form** (e.g., VPC with 2 public & 2 private subnets).
3. **Frontend sends config** → Backend via API.
4. **Backend generates Terraform code** → stores config in MongoDB.
5. **User reviews/edits code** in UI editor.
6. **Validation runs** → errors shown in UI.
7. **Future:** User clicks “Deploy” → Code pushed to Git → CI/CD runs `terraform apply`.
8. **Cloud infra is provisioned** → status sent back to UI.
