import { describe, it, expect } from "vitest";
import { request, ApiError } from "@/services/api/request";
import { getTasks } from "@/services/api/tasks";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

const API_URL =
  "http://localhost:8000/api/projects/project-1/tasks?skip=0&limit=100";

describe("ApiError handling", () => {
  it("request throws ApiError for non-ok response", async () => {
    server.use(
      http.get(API_URL, () =>
        HttpResponse.json({ detail: "Not found" }, { status: 404 }),
      ),
    );

    await expect(request(API_URL)).rejects.toMatchObject({
      message: "Not found",
      status: 404,
      url: API_URL,
    });
  });

  it("request wraps network errors in ApiError", async () => {
    server.use(
      http.get(API_URL, () => {
        throw new Error("Network fail");
      }),
    );

    await expect(request(API_URL)).rejects.toBeInstanceOf(ApiError);
  });

  it("service functions propagate ApiError", async () => {
    server.use(
      http.get(API_URL, () =>
        HttpResponse.json({ detail: "Server boom" }, { status: 500 }),
      ),
    );

    await expect(getTasks("project-1", undefined, undefined, 0, 100)).rejects.toBeInstanceOf(ApiError);
  });
});
