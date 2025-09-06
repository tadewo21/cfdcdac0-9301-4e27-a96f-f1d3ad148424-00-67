import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    telegram: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: "Ethiopian Job Board",
  siteDescription: "የኢትዮጵያ ዋና የስራ ማስፈላጊያ ድረ-ገጽ",
  contactEmail: "info@ethiojobs.com",
  contactPhone: "+251-11-123-4567",
  address: "አዲስ አበባ፣ ኢትዮጵያ",
  logoUrl: "",
  socialMedia: {
    facebook: "",
    twitter: "",
    linkedin: "",
    telegram: ""
  }
};

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("siteSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: SiteSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem("siteSettings", JSON.stringify(newSettings));
      console.log("Settings updated successfully:", newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}