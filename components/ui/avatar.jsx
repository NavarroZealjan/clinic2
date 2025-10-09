export function Avatar({ children, className = "" }) {
  return (
    <div className={`rounded-full flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export function AvatarFallback({ children, className = "" }) {
  return <span className={`text-sm font-medium ${className}`}>{children}</span>;
}
