// ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Theme, theme } from "./themeConfig";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: Theme["light"] | Theme["dark"];
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  currentTheme: theme.light,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
