import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

function writePreference(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences remain usable when storage is unavailable
  }
}

interface Preferences {
  dark: boolean;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    writePreference('tensum.theme', dark ? 'dark' : 'light');
  }, [dark]);

  const value = useMemo<Preferences>(
    () => ({
      dark,
      toggleTheme() {
        setDark((current) => !current);
      },
    }),
    [dark],
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}

export function usePreferences(): Preferences {
  const preferences = useContext(PreferencesContext);

  if (!preferences) {
    throw new Error('PreferencesProvider is required.');
  }

  return preferences;
}
