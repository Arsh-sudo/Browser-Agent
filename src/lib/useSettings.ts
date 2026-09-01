import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type AgentSettings } from "./settings";

export function useSettings() {
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    void getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((patch: Partial<AgentSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next).then(() => setSavedAt(Date.now()));
      return next;
    });
  }, []);

  const updateCategory = useCallback((key: keyof AgentSettings["redactionCategories"], value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, redactionCategories: { ...prev.redactionCategories, [key]: value } };
      void saveSettings(next).then(() => setSavedAt(Date.now()));
      return next;
    });
  }, []);

  return { settings, loaded, savedAt, update, updateCategory };
}
