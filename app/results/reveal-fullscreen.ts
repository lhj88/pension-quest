type RevealFullscreenTarget = {
  requestFullscreen?: () => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type RevealFullscreenDocument = {
  fullscreenElement?: unknown;
};

export async function requestRevealLayerFullscreen(
  target: RevealFullscreenTarget | null,
  doc: RevealFullscreenDocument = document,
): Promise<boolean> {
  if (doc.fullscreenElement || !target) {
    return false;
  }

  const requestFullscreen =
    target.requestFullscreen ?? target.webkitRequestFullscreen;

  if (!requestFullscreen) {
    return false;
  }

  try {
    await requestFullscreen.call(target);
    return true;
  } catch {
    return false;
  }
}
