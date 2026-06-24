const COLORS = {
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#ea580c",
  purple: "#7c3aed",
  gray: "#94a3b8",
};

const COLOR_KEYS = ["blue", "green", "orange", "purple", "gray"];

export default function EventCard({
  event,
  memo,
  color,
  countdown,
  soon,
  onMemoChange,
  onColorChange,
  onBlur,
}) {
  const accent = COLORS[color] || COLORS.gray;

  return (
    <article
      className="rounded-xl bg-white p-4 shadow-sm"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-blue-600">
          {event.timeLabel}
        </span>
        {countdown && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              soon
                ? "bg-amber-100 text-amber-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {countdown}
          </span>
        )}
      </div>
      <h3 className="mb-2.5 text-base font-semibold">{event.title}</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          onBlur={onBlur}
          placeholder="やることをメモ…"
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[13px] text-slate-700 outline-none focus:border-blue-300"
        />
        <div className="flex gap-1">
          {COLOR_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={`色: ${key}`}
              onClick={() => onColorChange(key)}
              className="h-5 w-5 rounded-full border-2"
              style={{
                backgroundColor: COLORS[key],
                borderColor: color === key ? "#1a2332" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
