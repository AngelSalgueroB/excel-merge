"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <Switch
        id="theme-switch"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
      />
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <Label htmlFor="theme-switch" className="sr-only">Toggle theme</Label>
    </div>
  );
}