import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('documind-theme');

    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system'
    ) {
      return saved;
    }

    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<
    'light' | 'dark'
  >(
    'light'
  );

  useEffect(() => {
    const applyTheme = () => {
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      const resolved =
        theme === 'system'
          ? systemDark
            ? 'dark'
            : 'light'
          : theme;

      setResolvedTheme(resolved);

      document.documentElement.setAttribute(
        'data-theme',
        resolved
      );
    };

    applyTheme();

    if (theme === 'system') {
      const media = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

      media.addEventListener('change', applyTheme);

      return () => {
        media.removeEventListener('change', applyTheme);
      };
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('documind-theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }

  return context;
};