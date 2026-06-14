import { ReactNode } from "react";

type Variant = "filled" | "outline" | "ghost";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "filled",
  fullWidth = false,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2 px-4 py-2.5 
    rounded-md text-sm font-semibold transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

  const variants = {
    filled: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20",
    outline: "border border-white/10 text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/5",
    ghost: "text-indigo-400 hover:bg-indigo-500/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]}`}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-white/30 border-t-white 
                     rounded-full animate-spin"
        />
      ) : (
        children
      )}
    </button>
  );
}