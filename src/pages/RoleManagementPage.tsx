
import Header from "@/components/Header";
import RoleFeatureMatrix from "@/components/admin/RoleFeatureMatrix";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleManagementPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-7xl gap-2">
          <h1 className="text-3xl font-semibold">Role & Feature Management</h1>
          <p className="text-muted-foreground">
            Manage role-based access control and feature permissions for your application.
          </p>
        </div>
        
        <div className="mx-auto grid w-full max-w-7xl items-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Overview</CardTitle>
              <CardDescription>
                Configure which features each role can access. Changes are saved automatically 
                and take effect immediately across the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">System Roles</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Parent / Guardian - Full child data access</li>
                      <li>• Teacher - Classroom insights and observations</li>
                      <li>• Therapist - Clinical notes and progress tracking</li>
                      <li>• School Counselor - Educational support data</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Permission Categories</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Profile Management - Child profile control</li>
                      <li>• Data Access - Timeline and history viewing</li>
                      <li>• Communication - Messaging and comments</li>
                      <li>• Administration - Team and privacy management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <RoleFeatureMatrix />
        </div>
      </main>
    </div>
  );
}
