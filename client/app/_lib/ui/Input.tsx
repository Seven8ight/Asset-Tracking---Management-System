import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
        {props.required && <span className="text-indigo-400 ml-0.5">*</span>}
      </label>

      <input
        id={id}
        {...props}
        className={`
          w-full px-3.5 py-2.5 rounded-md text-sm text-slate-100
          bg-[var(--bg-input)] placeholder:text-slate-600
          border transition-all duration-150 outline-none
          focus:ring-2 focus:ring-indigo-500/30
          ${error
            ? "border-red-500/40 focus:border-red-400"
            : "border-white/7 focus:border-indigo-500/50"
          }
          ${props.className ?? ""}
        `}
      />

      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      {hint && !error && (
        <span className="text-xs text-slate-500">{hint}</span>
      )}
    </div>
  );
}