import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Droplet, Moon, Sun } from "lucide-react";

export default function PublicHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = localStorage.theme === "dark" || (!("theme" in localStorage) && prefersDark);
    document.documentElement.classList.toggle("dark", darkMode);
    setIsDark(darkMode);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.theme = nextIsDark ? "dark" : "light";
    setIsDark(nextIsDark);
  };

  return (
    <header className="public-header">
      <Link to="/" className="public-brand" aria-label="BloodBank Plus home">
        <Droplet className="public-brand-icon" size={25} aria-hidden="true" />
        <span>BloodBank Plus</span>
      </Link>
      <nav className="public-header-actions" aria-label="Main navigation">
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </button>
        <Link to="/auth" className="public-header-link">Login</Link>
        <Link to="/auth?mode=signup" className="ui-btn ui-btn-primary public-header-signup">Sign up</Link>
      </nav>
    </header>
  );
}
