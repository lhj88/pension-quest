const revealKeys = new Set(["Enter", " ", "Spacebar"]);
const navigationKeyIntent = {
  ArrowLeft: "previous",
  ArrowRight: "next",
} as const;

export type RevealNavigationIntent =
  (typeof navigationKeyIntent)[keyof typeof navigationKeyIntent];

export function shouldRevealSecondPartForKey(key: string): boolean {
  return revealKeys.has(key);
}

export function getRevealNavigationIntent(
  key: string,
): RevealNavigationIntent | null {
  if (key in navigationKeyIntent) {
    return navigationKeyIntent[key as keyof typeof navigationKeyIntent];
  }

  return null;
}
