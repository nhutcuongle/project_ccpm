export default function Avatar({ src, name = "", size = "md", className = "", online = false }) {
  const sizes = {
    sm: "w-8 h-8 min-w-[32px] min-h-[32px] text-xs",
    md: "w-10 h-10 min-w-[40px] min-h-[40px] text-sm",
    lg: "w-14 h-14 min-w-[56px] min-h-[56px] text-lg",
    xl: "w-20 h-20 min-w-[80px] min-h-[80px] text-2xl",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${online ? "status-online" : ""}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-indigo-500/20 ${className}`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full gradient-primary flex flex-shrink-0 items-center justify-center font-bold text-white ring-2 ring-indigo-500/20 ${className}`}
        >
          {initials || "?"}
        </div>
      )}
    </div>
  );
}
