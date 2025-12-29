import React, { createContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  themeVersion: number; // Force re-render when theme changes
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  themeVersion: 0,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get theme from localStorage or default to light mode
  const detectInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Always default to light mode (ignore system preference)
    return "light";
  };

  const [theme, setThemeState] = useState<Theme>(detectInitialTheme());
  const [themeVersion, setThemeVersion] = useState(0);

  // Apply theme class to document element when theme changes (including initial mount)
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first to ensure clean state
    root.classList.remove("dark", "light");
    
    if (theme === "dark") {
      root.classList.add("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Force re-render by updating themeVersion
    setThemeVersion(prev => prev + 1);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      return prevTheme === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        themeVersion, // This will change when theme changes, forcing re-renders
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
