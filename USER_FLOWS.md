# Core User Flows

This document outlines common workflows for the MCP Project Manager API.
It demonstrates how clients interact with the system for project creation,
 task management, and file uploads.

## 1. Project Creation
1. **POST `/api/v1/projects/`** with `name` and `description` to create a new project.
2. The response includes the generated `id` used for further actions.

## 2. Task Management
1. **POST `/api/v1/tasks/`** with `title` and `project_id` to create a task.
2. **PUT `/api/v1/tasks/{task_id}`** to update task fields such as `title` or `status`.
3. **GET `/api/v1/tasks/?project_id={project_id}`** lists tasks for a project.
4. **DELETE `/api/v1/tasks/{task_id}`** removes a task.

## 3. File Uploads
1. Upload a file to the memory service using **POST `/api/v1/memory/ingest/file`**
   with the local `file_path`. The response contains the new memory entity `id`.
2. Associate the uploaded file with a project via
   **POST `/api/v1/projects/{project_id}/files`** using `file_id` from step 1.
3. Optionally associate the file with a specific task using
   **POST `/api/v1/tasks/{project_id}/{task_number}/files/`**.
4. Retrieve associated files with
   **GET `/api/v1/projects/{project_id}/files`** or
   **GET `/api/v1/tasks/{project_id}/{task_number}/files/`**.
