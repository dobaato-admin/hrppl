import { Link } from "@tanstack/react-router";

export function BlogNav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-lg">hrppl</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/blog" className="text-foreground hover:text-primary">Blog</Link>
          <Link to="/developers" className="text-muted-foreground hover:text-foreground">Developers</Link>
          <Link to="/auth" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link to="/signup" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">Start free</Link>
        </nav>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer className="border-t border-border py-10 mt-12">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} hrppl. Global HRMS, payroll & practice management.</p>
        <div className="flex gap-4">
          <Link to="/blog">Blog</Link>
          <Link to="/developers">API</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
    </footer>
  );
}
