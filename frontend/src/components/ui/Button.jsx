import { forwardRef } from "react";

const variants = {
  primary: "gradient-primary text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]",
  secondary: "bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600/50",
  danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  success: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20",
  ghost: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
  outline: "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  loading = false,
  icon,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2 
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
