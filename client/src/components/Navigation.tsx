import { Link } from "wouter";
import { Moon } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
      <Link href="/" className="pointer-events-auto flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
          <Moon size={16} className="fill-current" />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-primary">Lunar Cards</span>
      </Link>
      
      <div className="pointer-events-auto flex items-center gap-4">
        {/* Auth status could go here */}
      </div>
    </nav>
  );
}
