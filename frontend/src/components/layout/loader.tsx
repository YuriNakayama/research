type LoaderProps = {
  /** Uppercase mono label shown beside the indicator. */
  label?: string;
  /** Fill the viewport height and center (page-level loading). */
  fullscreen?: boolean;
  /** Compact inline variant (e.g. inside a diagram/card placeholder). */
  inline?: boolean;
};

/**
 * Unified loading indicator for the whole app.
 *
 * Brutalist by design: a mono uppercase label plus a functional "scanning" bar
 * (no soft spinner / no blur). The animation is CSS-driven and disabled under
 * `prefers-reduced-motion` (see `.loader-bar` in globals.css), so it degrades to
 * a static bar rather than motion.
 */
export function Loader({
  label = "読み込み中",
  fullscreen = false,
  inline = false,
}: LoaderProps) {
  const indicator = (
    <div
      className={inline ? "loader inline-flex items-center gap-3" : "loader flex items-center gap-3"}
      role="status"
      aria-live="polite"
    >
      <span className="loader-bar" aria-hidden="true">
        <span className="loader-bar-fill" />
      </span>
      <span className="brutal-label text-[var(--text-tertiary)]">{label}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {indicator}
      </div>
    );
  }

  return indicator;
}
