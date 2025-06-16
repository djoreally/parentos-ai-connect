
import { canAccessFeature } from '@/api/roleFeatures';

// Cache for permissions to avoid repeated API calls
const permissionCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Centralized permission checking utility
 */
export class PermissionManager {
  private static instance: PermissionManager;
  
  static getInstance(): PermissionManager {
    if (!this.instance) {
      this.instance = new PermissionManager();
    }
    return this.instance;
  }

  /**
   * Check if a user role can access a specific feature
   */
  async canUserAccessFeature(userRole: string, featureName: string): Promise<boolean> {
    const cacheKey = `${userRole}-${featureName}`;
    const cached = permissionCache.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.value;
    }

    try {
      const hasAccess = await canAccessFeature(userRole, featureName);
      
      // Cache the result
      permissionCache.set(cacheKey, {
        value: hasAccess,
        timestamp: Date.now()
      });
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking permission:', error);
      // Fail safely - deny access on error
      return false;
    }
  }

  /**
   * Clear permission cache (useful after role changes)
   */
  clearCache(): void {
    permissionCache.clear();
  }

  /**
   * Pre-load permissions for a user role
   */
  async preloadPermissions(userRole: string, features: string[]): Promise<void> {
    const promises = features.map(feature => 
      this.canUserAccessFeature(userRole, feature)
    );
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error preloading permissions:', error);
    }
  }
}

// Export singleton instance
export const permissionManager = PermissionManager.getInstance();

// Convenience function for quick access checks
export const checkFeatureAccess = (userRole: string, featureName: string): Promise<boolean> => {
  return permissionManager.canUserAccessFeature(userRole, featureName);
};

// Common feature names (type-safe constants)
export const FEATURES = {
  ADD_EDIT_CHILD_PROFILE: 'Add/Edit Child Profile',
  VIEW_UNIFIED_TIMELINE: 'View Unified Timeline',
  ADD_OBSERVATIONS_NOTES: 'Add Observations / Notes',
  ATTACH_PHOTOS_FILES: 'Attach Photos / Files',
  AI_POWERED_SUMMARIES: 'AI-Powered Summaries & Trends',
  CREATE_ASSIGN_TAGS: 'Create & Assign Tags',
  SEND_RECEIVE_MESSAGES: 'Send/Receive Messages',
  COMMENT_ON_UPDATES: 'Comment on Updates',
  EXPORT_TIMELINE_REPORTS: 'Export Timeline for Reports',
  CARE_TEAM_INVITES: 'Care Team Invites & Role Management',
  PRIVACY_ACCESS_CONTROLS: 'Privacy & Access Controls',
  VIEW_MILESTONE_TRACKER: 'View Milestone Tracker',
  SET_REMINDERS_DAILY_LOGS: 'Set Reminders / Daily Logs',
  PREPARE_DOCTOR_VISIT_SUMMARY: 'Prepare Doctor Visit Summary',
} as const;

// Role names (type-safe constants)
export const ROLES = {
  PARENT_GUARDIAN: 'Parent / Guardian',
  TEACHER: 'Teacher',
  THERAPIST: 'Therapist',
  SCHOOL_COUNSELOR: 'School Counselor',
  NANNY_BABYSITTER: 'Nanny / Babysitter',
  COACH_INSTRUCTOR: 'Coach / Instructor',
  EXTENDED_FAMILY: 'Extended Family',
  CASE_WORKER: 'Case Worker',
} as const;
