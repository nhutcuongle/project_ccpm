const variants = {
  admin: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  user: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  disabled: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
};

export default function Badge({ children, variant = "info", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
