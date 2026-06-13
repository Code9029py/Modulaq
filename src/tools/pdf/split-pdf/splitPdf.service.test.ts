import { describe, expect, it } from "vitest";
import { ToolError } from "../../../shared/errors/ToolError";
import { buildOutputFileName } from "./splitPdf.service";

describe("splitPdf.service", () => {
  it("throws ToolError codes for invalid output names", () => {
    try {
      buildOutputFileName(".", "pdf");
      throw new Error("Expected buildOutputFileName to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ToolError);
      expect((error as ToolError).code).toBe("tools.errors.outputNameInvalid");
    }
  });
});
