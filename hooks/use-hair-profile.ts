import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface HairProfile {
  id: string;
  userId: string;
  hairType: string;
  porosity: string;
  density: string;
  length: string;
  currentIssues: string[];
  desiredOutcomes: string[];
}

export function useHairProfile() {
  const { user } = useAuth();
  const [hairProfile, setHairProfile] = useState<HairProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHairProfile = async () => {
      if (!user) {
        setHairProfile(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/hair-profiles/${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          setHairProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching hair profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHairProfile();
  }, [user]);

  return { hairProfile, loading };
}
