export default function Card({ children, className = "", hover = true, glow = false }) {
  return (
    <div
      className={`
        glass rounded-2xl p-6
        ${hover ? "hover-glow transition-all duration-300" : ""}
        ${glow ? "animate-pulse-glow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
