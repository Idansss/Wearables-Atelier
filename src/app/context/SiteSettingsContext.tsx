import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSiteSettings, type SiteSettings } from "../lib/db";
import {
  DEFAULT_COLLECTIONS,
  DEFAULT_STOREFRONT_SETTINGS,
  getDefaultSimplePages,
} from "../lib/siteSettings";

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementMessages: [],
  collections: DEFAULT_COLLECTIONS,
  storefront: DEFAULT_STOREFRONT_SETTINGS,
  simplePages: getDefaultSimplePages(DEFAULT_STOREFRONT_SETTINGS.contactEmail),
};

type SiteSettingsContextValue = {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: true,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const next = await getSiteSettings();
    setSettings(next);
  }

  useEffect(() => {
    refresh()
      .catch(() => {
        setSettings(DEFAULT_SITE_SETTINGS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
