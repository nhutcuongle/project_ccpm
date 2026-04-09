export default function Avatar({ src, name = "", size = "md", className = "", online = false }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative inline-flex ${online ? "status-online" : ""}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-indigo-500/20 ${className}`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full gradient-primary flex items-center justify-center font-bold text-white ring-2 ring-indigo-500/20 ${className}`}
        >
          {initials || "?"}
        </div>
      )}
    </div>
  );
}
