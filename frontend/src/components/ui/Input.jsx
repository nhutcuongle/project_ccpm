import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(({ 
  label, 
  icon, 
  error, 
  className = "", 
  type = "text",
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={isPassword && showPassword ? "text" : type}
          className={`
            w-full px-4 py-3 
            ${icon ? "pl-11" : ""} 
            ${isPassword ? "pr-11" : ""}
            bg-slate-800/50 
            border border-slate-700/50 
            rounded-xl text-slate-200 
            placeholder:text-slate-500
            focus:outline-none focus:border-indigo-500/50 
            input-glow
            transition-all duration-300
            hover:border-slate-600/50
            ${error ? "border-red-500/50 focus:border-red-500/50" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 ml-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
