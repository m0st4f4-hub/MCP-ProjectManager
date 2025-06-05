import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const repoRoot = path.resolve(__dirname, "../../../..");
const script = path.join(repoRoot, "frontend", "validate-testing-framework.js");

describe("validate-testing-framework.js", () => {
  it("should fail in an empty workspace", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-test-"));
    const result = spawnSync("node", [script], {
      cwd: tmpDir,
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("TESTING FRAMEWORK VALIDATION SUMMARY");
    expect(result.stdout).toContain("Validation error");
  });
});
