// ThemeContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type CloudProvider = 'aws' | 'azure' | 'google';

interface ThemeContextType {
  theme: Theme;
  cloudProvider: CloudProvider;
  toggleTheme: () => void;
  setCloudProvider: (provider: CloudProvider) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('aws');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCloudProviderChange = (provider: CloudProvider) => {
    setCloudProvider(provider);
  };

  return (
    <ThemeContext.Provider value={{ theme, cloudProvider, toggleTheme, setCloudProvider: handleCloudProviderChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
