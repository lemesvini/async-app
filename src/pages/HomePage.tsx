import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CometCard } from "@/components/ui/comet-card";
import { User, HelpCircle } from "lucide-react";
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
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Left side - Current content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-10">
        <div className="flex flex-col items-center space-y-6 md:space-y-8 text-center max-w-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <img
              src={
                isDark
                  ? "/async-text-logo-white.svg"
                  : "/async-text-logo-dark.svg"
              }
              alt="Async Logo"
              className="w-48 h-auto sm:w-64 md:w-80 object-contain"
            />
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-xl px-4">
              Welcome to our all-in-one learning app.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login card */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-10">
        <CometCard>
          <div
            className="flex w-full max-w-sm sm:w-80 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card p-6 shadow-2xl scale-130"
            style={{
              transformStyle: "preserve-3d",
              transform: "none",
              opacity: 1,
            }}
          >
            {/* ID Card Header */}
            <div className="flex items-center justify-between mb-4 text-card-foreground">
              <div className="text-sm font-mono opacity-70">ACCESS CARD</div>
              <div className="text-xs text-muted-foreground opacity-50">
                #ASYNC
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center space-y-4 py-4 sm:py-6">
              {/* User Avatar with Question Mark */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center border-2 border-card">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-foreground" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center space-y-1">
                <div className="text-card-foreground font-semibold text-lg">
                  No User
                </div>
                <div className="text-muted-foreground text-sm">
                  Ready to join?
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="mt-4">
              <Button
                asChild
                size="lg"
                className="w-full text-base sm:text-lg py-3"
              >
                <Link to="/login">Click to Login</Link>
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <div className="text-xs text-muted-foreground opacity-60">
                Authentication needed!
              </div>
            </div>
          </div>
        </CometCard>
      </div>
    </div>
  );
}
