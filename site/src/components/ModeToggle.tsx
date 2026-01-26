import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const [systemThemeListener, setSystemThemeListener] = React.useState<
    (() => void) | null
  >(null);
  const [theme, setThemeState] = React.useState<
    "theme-light" | "dark" | "system"
  >("theme-light");

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setThemeState(isDarkMode ? "dark" : "theme-light");
  }, []);

  React.useEffect(() => {
    if (theme === "system") {
      const listener = (event: MediaQueryListEvent) => {
        if (event.matches) {
          document.documentElement.classList["add"]("dark");
        } else {
          document.documentElement.classList["remove"]("dark");
        }
      };

      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", listener);

      setSystemThemeListener(() => {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", listener);
      });

      return () => {
        if (systemThemeListener) systemThemeListener();
      };
    }

    if (systemThemeListener) {
      systemThemeListener();
      setSystemThemeListener(null);
    }

    if (theme === "theme-light") {
      document.documentElement.classList["remove"]("dark");
      return;
    }

    if (theme === "dark") {
      document.documentElement.classList["add"]("dark");
      return;
    }
  }, [theme, systemThemeListener]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState("theme-light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
