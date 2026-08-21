"use client";

import { useEffect } from "react";
import { useTheme } from "@teispace/next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_HOVER_ICON } from "@/components/layout/navbar/nav-hover";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // "light-explicit" only applies the light-green background when the
  // person deliberately picked Light — if they picked System and it
  // happens to resolve to light, we leave the plainer default alone,
  // since that wasn't a specific request for the green look.
  useEffect(() => {
    document.documentElement.classList.toggle("light-explicit", theme === "light");
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Toggle theme" className={NAV_HOVER_ICON} />
        }
      >
        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
