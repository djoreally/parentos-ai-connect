
import { supabase } from '@/integrations/supabase/client';

export interface AppRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
}

export interface AppFeature {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface RoleFeaturePermission {
  id: string;
  role_id: string;
  feature_id: string;
  can_access: boolean;
  app_roles: AppRole;
  app_features: AppFeature;
}

export interface PermissionMatrix {
  roles: AppRole[];
  features: AppFeature[];
  permissions: Map<string, boolean>; // key format: "roleId-featureId"
}

// Get all roles
export const getRoles = async (): Promise<AppRole[]> => {
  const { data, error } = await supabase
    .from('app_roles')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }

  return data;
};

// Get all features
export const getFeatures = async (): Promise<AppFeature[]> => {
  const { data, error } = await supabase
    .from('app_features')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching features:', error);
    throw error;
  }

  return data;
};

// Get all permissions with role and feature details
export const getPermissionMatrix = async (): Promise<PermissionMatrix> => {
  const [rolesResult, featuresResult, permissionsResult] = await Promise.all([
    getRoles(),
    getFeatures(),
    supabase
      .from('role_feature_permissions')
      .select(`
        *,
        app_roles(*),
        app_features(*)
      `)
  ]);

  if (permissionsResult.error) {
    console.error('Error fetching permissions:', permissionsResult.error);
    throw permissionsResult.error;
  }

  const permissions = new Map<string, boolean>();
  permissionsResult.data.forEach((perm: any) => {
    const key = `${perm.role_id}-${perm.feature_id}`;
    permissions.set(key, perm.can_access);
  });

  return {
    roles: rolesResult,
    features: featuresResult,
    permissions
  };
};

// Update a specific role-feature permission
export const updatePermission = async (
  roleId: string,
  featureId: string,
  canAccess: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('role_feature_permissions')
    .upsert({
      role_id: roleId,
      feature_id: featureId,
      can_access: canAccess
    });

  if (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
};

// Check if a user with a specific role can access a feature
export const canAccessFeature = async (
  userRole: string,
  featureName: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('role_feature_permissions')
    .select(`
      can_access,
      app_roles!inner(name),
      app_features!inner(name)
    `)
    .eq('app_roles.name', userRole)
    .eq('app_features.name', featureName)
    .maybeSingle();

  if (error) {
    console.error('Error checking feature access:', error);
    return false;
  }

  return data?.can_access || false;
};
