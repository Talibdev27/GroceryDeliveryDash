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
      console.log("ThemeContext: Using saved theme:", savedTheme);
      return savedTheme;
    }
    
    // Always default to light mode (ignore system preference)
    console.log("ThemeContext: Using default theme: light");
    return "light";
  };

  const [theme, setThemeState] = useState<Theme>(detectInitialTheme());
  const [themeVersion, setThemeVersion] = useState(0);

  // Apply theme class to document element when theme changes (including initial mount)
  useEffect(() => {
    const root = document.documentElement;
    
    console.log("ThemeContext: Applying theme:", theme);
    
    // Remove both classes first to ensure clean state
    root.classList.remove("dark", "light");
    
    if (theme === "dark") {
      root.classList.add("dark");
      console.log("ThemeContext: Added 'dark' class to document");
    } else {
      console.log("ThemeContext: Light mode - no dark class");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    console.log("ThemeContext: Theme saved to localStorage:", theme);
    
    // Verify the class was applied
    console.log("ThemeContext: Document classes:", root.classList.toString());
    
    // Force re-render by updating themeVersion
    setThemeVersion(prev => prev + 1);
    console.log("ThemeContext: Theme version updated, forcing component re-render");
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    console.log("ThemeContext: setTheme called with:", newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    console.log("ThemeContext: toggleTheme called, current theme:", theme);
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log("ThemeContext: Toggling from", prevTheme, "to", newTheme);
      return newTheme;
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
