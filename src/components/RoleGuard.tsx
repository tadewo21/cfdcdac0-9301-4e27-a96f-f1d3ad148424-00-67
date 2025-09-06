import { ReactNode } from "react";
import { useRoles, UserRole } from "@/hooks/useRoles";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  allowedRoles, 
  requiredPermissions, 
  children, 
  fallback,
  redirectTo = "/"
}: RoleGuardProps) {
  const { userRole, hasPermission, loading } = useRoles();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role-based access - Allow admin users specifically
  if (allowedRoles && userRole) {
    const hasAccess = allowedRoles.includes(userRole) || userRole === 'admin';
    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">{t("role.accessDenied")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t("role.insufficientPermissions")}
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  <strong>{t("role.currentRole")}:</strong> {userRole ? t(`role.${userRole}` as any) : 'N/A'}
                </p>
                <p className="text-sm">
                  <strong>Required:</strong> {allowedRoles.map(role => t(`role.${role}` as any)).join(', ')}
                </p>
              </div>
              <Button onClick={() => navigate(redirectTo)} className="w-full">
                {t("navigation.home")}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission as any)
    );
    
    if (!hasAllPermissions) {
      if (fallback) return <>{fallback}</>;
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">{t("role.insufficientPermissions")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have the required permissions to access this page.
              </p>
              <Button onClick={() => navigate(redirectTo)} className="w-full">
                {t("navigation.home")}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}