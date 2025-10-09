export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar + Main Content layout */}
      {children}
    </div>
  );
}
