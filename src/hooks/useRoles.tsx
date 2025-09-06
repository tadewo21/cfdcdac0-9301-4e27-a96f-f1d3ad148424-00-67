
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "employer" | "job_seeker";

export interface RolePermissions {
  canPostJobs: boolean;
  canManageJobs: boolean;
  canAccessAdmin: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canModerateContent: boolean;
  canViewAllJobs: boolean;
  canApplyToJobs: boolean;
}

interface RoleContextType {
  userRole: UserRole | null;
  permissions: RolePermissions;
  loading: boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isRole: (role: UserRole) => boolean;
  refreshRole: () => Promise<void>;
}

const defaultPermissions: RolePermissions = {
  canPostJobs: false,
  canManageJobs: false,
  canAccessAdmin: false,
  canViewAnalytics: false,
  canManageUsers: false,
  canModerateContent: false,
  canViewAllJobs: true,
  canApplyToJobs: false,
};

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canPostJobs: true,
    canManageJobs: true,
    canAccessAdmin: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canModerateContent: true,
    canViewAllJobs: true,
    canApplyToJobs: false,
  },
  employer: {
    canPostJobs: true,
    canManageJobs: true,
    canAccessAdmin: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canModerateContent: false,
    canViewAllJobs: true,
    canApplyToJobs: false,
  },
  job_seeker: {
    canPostJobs: false,
    canManageJobs: false,
    canAccessAdmin: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canModerateContent: false,
    canViewAllJobs: true,
    canApplyToJobs: true,
  },
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin (hardcoded admin emails for now)
      const adminEmails = ['admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com'];
      if (user?.email && adminEmails.includes(user.email)) {
        setUserRole('admin');
        
        // Ensure admin has proper profile setup
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (!adminProfile) {
          // Create admin profile if it doesn't exist
          await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              user_type: "admin",
              full_name: user.user_metadata?.full_name || "Admin",
              email: user.email,
            })
            .single();
        } else if (adminProfile.user_type !== "admin") {
          // Update profile to admin if needed
          await supabase
            .from("profiles")
            .update({ user_type: "admin" })
            .eq("user_id", user.id);
        }
        
        setLoading(false);
        return;
      }

      // Fetch user profile to get role
      const { data, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user role:", error);
        setUserRole('job_seeker'); // Default role
      } else if (data) {
        setUserRole(data.user_type as UserRole || 'job_seeker');
      } else {
        // Create default profile if none exists
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user!.id,
            user_type: "job_seeker",
            full_name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'User',
            email: user!.email!,
          });
          
        if (createError) {
          console.error("Error creating user profile:", createError);
        }
        
        setUserRole('job_seeker'); // Default role
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole('job_seeker'); // Default role
    } finally {
      setLoading(false);
    }
  };

  const permissions = userRole ? rolePermissions[userRole] : defaultPermissions;

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const isRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const value = {
    userRole,
    permissions,
    loading,
    hasPermission,
    isRole,
    refreshRole: fetchUserRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoles() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
}
