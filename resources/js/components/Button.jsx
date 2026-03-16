export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  ...props 
}) {
  
  const baseClasses = "inline-flex items-center justify-center font-bold transition-all duration-300 transform active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm";
  
  const variants = {
    primary: "bg-[#38C1A3] text-white hover:bg-[#32ac91] focus:ring-[#38C1A3] hover:shadow-lg hover:shadow-[#38C1A3]/30 border border-transparent",
    secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-slate-500",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 hover:shadow-lg hover:shadow-rose-500/30 border border-transparent",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none border border-transparent focus:ring-slate-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <i className={icon}></i>}
      {children && <span>{children}</span>}
    </button>
  );
}
