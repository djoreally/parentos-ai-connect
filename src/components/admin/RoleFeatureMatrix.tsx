
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPermissionMatrix,
  updatePermission,
  type PermissionMatrix,
  type AppRole,
  type AppFeature
} from "@/api/roleFeatures";
import { useAuth } from "@/contexts/AuthContext";

export default function RoleFeatureMatrix() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [localPermissions, setLocalPermissions] = useState<Map<string, boolean>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: matrix, isLoading, error } = useQuery({
    queryKey: ['permission-matrix'],
    queryFn: getPermissionMatrix,
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ roleId, featureId, canAccess }: {
      roleId: string;
      featureId: string;
      canAccess: boolean;
    }) => updatePermission(roleId, featureId, canAccess),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-matrix'] });
      setHasChanges(false);
      setLocalPermissions(new Map());
      toast.success('Permissions updated successfully');
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    },
  });

  useEffect(() => {
    if (matrix) {
      setLocalPermissions(new Map(matrix.permissions));
    }
  }, [matrix]);

  if (!profile || profile.role !== 'Admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading permission matrix...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !matrix) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error loading permission matrix</p>
        </CardContent>
      </Card>
    );
  }

  const handlePermissionToggle = (roleId: string, featureId: string, newValue: boolean) => {
    const key = `${roleId}-${featureId}`;
    const newPermissions = new Map(localPermissions);
    newPermissions.set(key, newValue);
    setLocalPermissions(newPermissions);
    setHasChanges(true);
  };

  const getPermissionValue = (roleId: string, featureId: string): boolean => {
    const key = `${roleId}-${featureId}`;
    return localPermissions.get(key) || false;
  };

  const saveChanges = async () => {
    const promises: Promise<void>[] = [];
    
    for (const [key, value] of localPermissions.entries()) {
      const [roleId, featureId] = key.split('-');
      const originalValue = matrix.permissions.get(key) || false;
      
      if (value !== originalValue) {
        promises.push(
          updatePermissionMutation.mutateAsync({ roleId, featureId, canAccess: value })
        );
      }
    }
    
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    }
  };

  const exportMatrix = () => {
    const exportData = {
      roles: matrix.roles,
      features: matrix.features,
      permissions: Array.from(localPermissions.entries()).map(([key, value]) => {
        const [roleId, featureId] = key.split('-');
        const role = matrix.roles.find(r => r.id === roleId);
        const feature = matrix.features.find(f => f.id === featureId);
        return {
          role: role?.name,
          feature: feature?.name,
          canAccess: value
        };
      }),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-feature-matrix-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Matrix exported successfully');
  };

  // Group features by category
  const featuresByCategory = matrix.features.reduce((acc, feature) => {
    const category = feature.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, AppFeature[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Role-Based Feature Matrix</CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                onClick={saveChanges}
                disabled={updatePermissionMutation.isPending}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
            <Button onClick={exportMatrix} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="matrix" className="w-full">
          <TabsList>
            <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matrix">
            <ScrollArea className="max-h-[70vh] border rounded-lg p-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b sticky left-0 bg-background z-10">
                      Feature
                    </th>
                    {matrix.roles.map((role) => (
                      <th key={role.id} className="text-left p-2 border-b text-sm min-w-[120px]">
                        {role.name}
                        {role.is_system_role && (
                          <Badge variant="secondary" className="ml-1 text-xs">System</Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.features.map((feature) => (
                    <tr key={feature.id} className="odd:bg-muted/50">
                      <td className="p-2 font-medium border-b text-sm sticky left-0 bg-background">
                        <div>
                          {feature.name}
                          {feature.category && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {feature.category}
                            </Badge>
                          )}
                        </div>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        )}
                      </td>
                      {matrix.roles.map((role) => (
                        <td key={role.id} className="p-2 border-b text-center">
                          <Switch
                            checked={getPermissionValue(role.id, feature.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(role.id, feature.id, checked)
                            }
                            disabled={updatePermissionMutation.isPending}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="by-category">
            <ScrollArea className="max-h-[70vh]">
              {Object.entries(featuresByCategory).map(([category, features]) => (
                <Card key={category} className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div key={feature.id} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">{feature.name}</h4>
                          {feature.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {feature.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {matrix.roles.map((role) => (
                              <div key={role.id} className="flex items-center justify-between">
                                <span className="text-sm">{role.name}</span>
                                <Switch
                                  checked={getPermissionValue(role.id, feature.id)}
                                  onCheckedChange={(checked) => 
                                    handlePermissionToggle(role.id, feature.id, checked)
                                  }
                                  disabled={updatePermissionMutation.isPending}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
