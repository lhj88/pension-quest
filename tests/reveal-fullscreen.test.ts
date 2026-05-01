import { describe, expect, it } from "vitest";

import { requestRevealLayerFullscreen } from "@/app/results/reveal-fullscreen";

describe("requestRevealLayerFullscreen", () => {
  it("requests fullscreen on the reveal layer element", async () => {
    let requested = false;

    const didRequest = await requestRevealLayerFullscreen(
      {
        requestFullscreen: () => {
          requested = true;
        },
      },
      { fullscreenElement: null },
    );

    expect(didRequest).toBe(true);
    expect(requested).toBe(true);
  });

  it("does not request fullscreen again when another element is already fullscreen", async () => {
    let requested = false;

    const didRequest = await requestRevealLayerFullscreen(
      {
        requestFullscreen: () => {
          requested = true;
        },
      },
      { fullscreenElement: {} },
    );

    expect(didRequest).toBe(false);
    expect(requested).toBe(false);
  });

  it("does not block reveal start if fullscreen is unsupported or denied", async () => {
    await expect(
      requestRevealLayerFullscreen(null, { fullscreenElement: null }),
    ).resolves.toBe(false);
    await expect(
      requestRevealLayerFullscreen(
        {
          requestFullscreen: () => Promise.reject(new Error("denied")),
        },
        { fullscreenElement: null },
      ),
    ).resolves.toBe(false);
  });
});
