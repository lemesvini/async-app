import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HomePage() {
  const [isDark, setIsDark] = useState(false);

  // Theme detection logic
  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
      setIsDark(shouldBeDark);
    };

    checkTheme();

    // Listen for storage changes (theme changes from other components)
    window.addEventListener("storage", checkTheme);

    // Also check if the dark class is present on document element
    const observer = new MutationObserver(() => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(hasDarkClass);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("storage", checkTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 md:p-10">
      {/* Hero Section */}
      <div className="flex flex-col items-center space-y-8 text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img
            src={
              isDark
                ? "/async-text-logo-white.svg"
                : "/async-text-logo-dark.svg"
            }
            alt="Async Logo"
            className="w-64 h-auto md:w-80 object-contain"
          />
        </div>

        {/* Headline */}
        <div className="space-y-4">
          {/* <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to Async
          </h1> */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
            Welcome to our all-in-one learning app.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
