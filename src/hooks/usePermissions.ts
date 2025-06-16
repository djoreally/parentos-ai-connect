
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkFeatureAccess, permissionManager } from '@/utils/permissions';

export const usePermissions = () => {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Check if current user can access a specific feature
   */
  const canAccess = async (featureName: string): Promise<boolean> => {
    if (!profile?.role) return false;
    
    // Check cache first
    const cached = permissions.get(featureName);
    if (cached !== undefined) return cached;
    
    setLoading(true);
    try {
      const hasAccess = await checkFeatureAccess(profile.role, featureName);
      setPermissions(prev => new Map(prev).set(featureName, hasAccess));
      return hasAccess;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk check permissions for multiple features
   */
  const checkMultiple = async (featureNames: string[]): Promise<Map<string, boolean>> => {
    if (!profile?.role) return new Map();
    
    setLoading(true);
    const results = new Map<string, boolean>();
    
    try {
      const promises = featureNames.map(async (feature) => {
        const hasAccess = await checkFeatureAccess(profile.role!, feature);
        results.set(feature, hasAccess);
        return { feature, hasAccess };
      });
      
      await Promise.all(promises);
      setPermissions(prev => new Map([...prev, ...results]));
      return results;
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      return new Map();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Synchronously check cached permission
   */
  const canAccessSync = (featureName: string): boolean | null => {
    return permissions.get(featureName) ?? null;
  };

  /**
   * Clear permission cache
   */
  const clearCache = () => {
    setPermissions(new Map());
    permissionManager.clearCache();
  };

  // Clear cache when user role changes
  useEffect(() => {
    clearCache();
  }, [profile?.role]);

  return {
    canAccess,
    canAccessSync,
    checkMultiple,
    clearCache,
    loading,
    userRole: profile?.role || null
  };
};

// Hook for checking a single permission with automatic loading
export const useFeatureAccess = (featureName: string) => {
  const { canAccess, canAccessSync, loading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      // First check cache
      const cached = canAccessSync(featureName);
      if (cached !== null) {
        setHasAccess(cached);
        return;
      }

      // If not cached, fetch from API
      setIsChecking(true);
      try {
        const access = await canAccess(featureName);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (featureName) {
      checkPermission();
    }
  }, [featureName, canAccess, canAccessSync]);

  return {
    hasAccess,
    loading: loading || isChecking,
    isChecking
  };
};
