import { describe, expect, it } from "vitest";

import {
  huntItemDeleteWarning,
  prizeDeleteWarning,
} from "@/lib/delete-warnings";

describe("delete warnings", () => {
  it("explains hunt item delete impact", () => {
    expect(huntItemDeleteWarning).toContain("획득 기록");
  });

  it("explains prize delete impact", () => {
    expect(prizeDeleteWarning).toContain("당첨 기록");
  });
});
