import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Profile } from "@shared/schema";

interface ProfileContextType {
  profile: Profile | null;
  isGuest: boolean;
  setProfile: (profile: Profile | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = "typing-quest-profile";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfileState(parsed);
      } catch (e) {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  }, []);

  const setProfile = useCallback((newProfile: Profile | null) => {
    setProfileState(newProfile);
    if (newProfile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      setIsGuest(false);
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const setGuestMode = useCallback((guest: boolean) => {
    setIsGuest(guest);
    if (guest) {
      setProfileState(null);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    setIsGuest(false);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, isGuest, setProfile, setGuestMode, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
