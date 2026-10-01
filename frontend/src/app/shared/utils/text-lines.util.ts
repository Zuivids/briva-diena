/**
 * Splits multi-line text into an array of lines for *ngFor rendering, one
 * <p> per line, instead of a single text node with white-space: pre-line/
 * pre-wrap. iOS Safari has a known text-layout bug where long pre-line/
 * pre-wrap blocks get visually duplicated/spliced on repaint — rendering
 * each line as its own element avoids that code path entirely.
 */
export function splitLines(text: string | null | undefined): string[] {
  return text ? text.split('\n') : [];
}

export function trackByIndex(index: number): number {
  return index;
}
