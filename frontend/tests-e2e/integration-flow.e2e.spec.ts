import { test, expect } from "@playwright/test";
import { spawn } from "child_process";
import path from "path";
import { TaskStatus } from "../src/types/task";

async function waitFor(url: string, timeout = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (e) {
      // ignore errors while waiting
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

test.describe("Integration Flow via start_system.py", () => {
  let proc: ReturnType<typeof spawn> | undefined;

  test.beforeAll(async () => {
    const root = path.resolve(__dirname, "../..");
    proc = spawn("python", ["start_system.py"], { cwd: root, shell: true });
    await waitFor("http://localhost:8000/docs");
    await waitFor("http://localhost:3000");
  });

  test.afterAll(() => {
    if (proc) {
      proc.kill();
    }
  });

  test("performs CRUD operations through real API", async ({ request }) => {
    const api = "http://localhost:8000";

    // create project
    const createProj = await request.post(`${api}/api/v1/projects`, {
      data: { name: "Integration Project", description: "Created by e2e" },
    });
    expect(createProj.status()).toBe(201);
    const projData = await createProj.json();
    const projectId = projData.data?.id || projData.id;

    // read project
    const readProj = await request.get(`${api}/api/v1/projects/${projectId}`);
    expect(readProj.ok()).toBeTruthy();

    // update project
    const updateProj = await request.patch(
      `${api}/api/v1/projects/${projectId}`,
      {
        data: { name: "Updated Integration Project" },
      },
    );
    expect(updateProj.ok()).toBeTruthy();

    // create task
    const createTask = await request.post(
      `${api}/api/v1/projects/${projectId}/tasks`,
      {
        data: {
          title: "Integration Task",
          description: "e2e",
          status: TaskStatus.TO_DO,
        },
      },
    );
    expect(createTask.status()).toBe(201);
    const taskData = await createTask.json();
    const taskNum = taskData.data?.task_number || taskData.task_number;

    // read task
    const readTask = await request.get(
      `${api}/api/v1/projects/${projectId}/tasks/${taskNum}`,
    );
    expect(readTask.ok()).toBeTruthy();

    // update task
    const updateTask = await request.patch(
      `${api}/api/v1/projects/${projectId}/tasks/${taskNum}`,
      {
        data: { title: "Updated Task", status: "IN_PROGRESS" },
      },
    );
    expect(updateTask.ok()).toBeTruthy();

    // delete task
    const deleteTask = await request.delete(
      `${api}/api/v1/projects/${projectId}/tasks/${taskNum}`,
    );
    expect(deleteTask.status()).toBe(204);

    // delete project
    const deleteProj = await request.delete(
      `${api}/api/v1/projects/${projectId}`,
    );
    expect(deleteProj.status()).toBe(204);
  });
});
