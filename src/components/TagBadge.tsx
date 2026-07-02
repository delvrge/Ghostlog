/**
 * Color-coded entry tag badge. Palette rule: red = bug (the attention
 * color), solid gray = update, outlined = feature. No other hues.
 */
const styles: Record<string, string> = {
  bugfix: "bg-accent/15 text-accent border border-accent/40",
  update: "bg-panel-raised text-fg-muted border border-edge-strong",
  feature: "bg-transparent text-fg border border-fg-muted",
};

export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wide ${
        styles[tag] ?? styles.update
      }`}
    >
      {tag}
    </span>
  );
}
