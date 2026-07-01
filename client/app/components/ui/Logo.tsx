export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: 28, icon: 16, text: "text-sm" },
    md: { box: 36, icon: 20, text: "text-base" },
    lg: { box: 44, icon: 26, text: "text-xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon box */}
      <div
        style={{ width: s.box, height: s.box }}
        className="rounded-lg bg-linear-to-br from-indigo-500 to-indigo-400 
                   flex items-center justify-center shrink-0"
      >
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="1.5"
            fill="white"
            opacity="0.9"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="1.5"
            fill="white"
            opacity="0.5"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            fill="white"
            opacity="0.5"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </div>
      {/* Text */}
      <span className={`${s.text} font-bold text-slate-200 tracking-tight`}>
        Asset<span className="text-indigo-400">Flow</span>
      </span>
    </div>
  );
}
