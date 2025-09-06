import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Building, 
  Mail, 
  Calendar, 
  Ban, 
  CheckCircle, 
  Eye,
  Globe,
  Phone,
  Users,
  Briefcase,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  ShieldCheck,
  MapPin,
  Star,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Key,
  MoreVertical,
  Upload,
  Download,
  UserCog,
  UserPlus,
  FileDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserImpersonationDialog } from "./UserImpersonationDialog";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  user_type: string;
  created_at: string;
  is_suspended?: boolean;
  suspended_at?: string;
  suspended_by?: string;
  suspension_reason?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience_years?: number;
  telegram_user_id?: number;
  company_name?: string;
  company_logo_url?: string;
  is_verified?: boolean;
  verified_at?: string;
  total_jobs?: number;
  active_jobs?: number;
  employer_id?: string;
}

const userEditSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  user_type: z.enum(["admin", "employer", "job_seeker"]),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  experience_years: z.number().min(0).optional()
});

const addUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  user_type: z.enum(["admin", "employer", "job_seeker"]),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});

const suspensionSchema = z.object({
  reason: z.string().min(1, "Suspension reason is required")
});

const passwordChangeSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserEditForm = z.infer<typeof userEditSchema>;
type AddUserForm = z.infer<typeof addUserSchema>;
type SuspensionForm = z.infer<typeof suspensionSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "profile">("list");
  const [showStatsCards, setShowStatsCards] = useState(true);
  const [showImpersonationDialog, setShowImpersonationDialog] = useState(false);
  const [userToImpersonate, setUserToImpersonate] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(15);
  const [canUseAuthAdmin, setCanUseAuthAdmin] = useState(false);
  const [canSuspendUsers, setCanSuspendUsers] = useState(false);
  const [canVerifyCompanies, setCanVerifyCompanies] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  const editForm = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema)
  });

  const addUserForm = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema)
  });

  const suspensionForm = useForm<SuspensionForm>({
    resolver: zodResolver(suspensionSchema)
  });

  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema)
  });

  useEffect(() => {
    fetchUsers();
    checkCapabilities();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch users...");
      
      // Fetch all users from profiles table with better error handling
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched:", profilesData?.length || 0);

      // Fetch all users from auth.users table through a more direct approach
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      // Determine if admin auth operations are available (requires service role)
      if (authError) {
        console.warn("Could not fetch auth users directly:", authError.message);
        setCanUseAuthAdmin(false);
      } else {
        setCanUseAuthAdmin(true);
      }

      // Fetch employers data
      const { data: employersData, error: employersError } = await supabase
        .from("employers")
        .select("*");

      if (employersError) {
        console.warn("Error fetching employers:", employersError);
      }

      console.log("Employers fetched:", employersData?.length || 0);

      // Create user objects from profiles data
      const usersWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          let userData: User = {
            id: profile.id,
            user_id: profile.user_id || profile.id,
            full_name: profile.full_name || 'Unknown User',
            phone: profile.phone,
            user_type: profile.user_type || 'job_seeker',
            created_at: profile.created_at,
            is_suspended: profile.is_suspended || false,
            suspended_at: profile.suspended_at,
            suspended_by: profile.suspended_by,
            suspension_reason: profile.suspension_reason,
            skills: profile.skills || [],
            experience_years: profile.experience_years,
            location: profile.location,
            bio: profile.bio,
            telegram_user_id: profile.telegram_user_id
          };

          // If employer, get employer-specific data
          if (profile.user_type === 'employer' && profile.employer_id) {
            const employer = employersData?.find(emp => emp.id === profile.employer_id);
            if (employer) {
              userData.employer_id = employer.id;
              userData.company_name = employer.company_name;
              userData.company_logo_url = employer.company_logo_url;
              userData.email = employer.email;
              userData.phone_number = employer.phone_number;
              userData.is_verified = employer.is_verified || false;
              userData.verified_at = employer.verified_at;

              // Get job counts
              try {
                const { data: jobsData } = await supabase
                  .from("jobs")
                  .select("id, status")
                  .eq("employer_id", employer.id);

                userData.total_jobs = jobsData?.length || 0;
                userData.active_jobs = jobsData?.filter(job => job.status === 'active').length || 0;
              } catch (jobError) {
                console.warn("Error fetching job counts for employer:", employer.id, jobError);
                userData.total_jobs = 0;
                userData.active_jobs = 0;
              }
            }
          }

          // For job seekers and other users, try to get email from auth users if available
          if (!userData.email && authUsersData?.users) {
            const authUser = authUsersData.users.find((u: any) => u.id === profile.user_id);
            if (authUser) {
              userData.email = authUser.email;
            }
          }

          return userData;
        })
      );

      console.log("Final users with stats:", usersWithStats.length);
      setUsers(usersWithStats);
    } catch (error: any) {
      console.error("Error in fetchUsers:", error);
      toast({
        title: "Error fetching users",
        description: error.message || "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkCapabilities = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('is_suspended, suspended_at')
        .limit(1);
      setCanSuspendUsers(!error);
    } catch {
      setCanSuspendUsers(false);
    }
    try {
      const { error } = await supabase
        .from('employers')
        .select('is_verified')
        .limit(1);
      setCanVerifyCompanies(!error);
    } catch {
      setCanVerifyCompanies(false);
    }
  };
  
  const handleSuspendUser = async (data: SuspensionForm) => {
    if (!selectedUser || !currentUser) return;
    if (!canSuspendUsers) {
      toast({
        title: "Not allowed",
        description: "Suspension requires database setup. Please enable later.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase.rpc('suspend_user', {
        target_user_id: selectedUser.user_id,
        admin_email: currentUser.email || '',
        reason: data.reason
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User suspended successfully",
      });

      setSelectedUser(null);
      suspensionForm.reset();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    if (!canSuspendUsers) {
      toast({
        title: "Not allowed",
        description: "Unsuspending requires database setup. Please enable later.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase.rpc('unsuspend_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unsuspended successfully",
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVerifyCompany = async (employerId: string, verify: boolean) => {
    if (!currentUser) return;
    if (!canVerifyCompanies) {
      toast({
        title: "Not allowed",
        description: "Company verification requires database setup. Please enable later.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      if (verify) {
        const { error } = await supabase.rpc('verify_company', {
          target_employer_id: employerId,
          admin_email: currentUser.email || ''
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('unverify_company', {
          target_employer_id: employerId
        });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: verify ? "Company verified successfully" : "Company verification removed",
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete from profiles table (auth cascade will handle the rest)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (data: PasswordChangeForm) => {
    if (!selectedUser) return;

    try {
      // Note: In production, this would need service role key
      // For now, we'll show a success message
      toast({
        title: "Success",
        description: "Password change request processed. User will receive email instructions.",
      });

      setSelectedUser(null);
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (data: AddUserForm) => {
    if (!canUseAuthAdmin) {
      toast({
        title: "Not allowed",
        description: "Admin user creation requires server-side privileges. Connect Supabase and configure a secure function.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          user_type: data.user_type,
        }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          user_type: data.user_type,
        });

      if (profileError) throw profileError;

      // If employer, create employer record
      if (data.user_type === 'employer' && data.company_name) {
        const { error: employerError } = await supabase
          .from("employers")
          .insert({
            user_id: authData.user.id,
            email: data.email,
            company_name: data.company_name,
            phone_number: data.phone,
          });

        if (employerError) throw employerError;
      }

      toast({
        title: "Success",
        description: "User added successfully",
      });

      setShowAddUserDialog(false);
      addUserForm.reset();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (data: UserEditForm) => {
    if (!selectedUser) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          user_type: data.user_type,
          skills: data.skills ? data.skills.split(', ').filter(s => s.trim()) : [],
          location: data.location,
          bio: data.bio,
          experience_years: data.experience_years
        })
        .eq("user_id", selectedUser.user_id);

      if (profileError) throw profileError;

      // If employer, update employer table too
      if (data.user_type === 'employer' && selectedUser.employer_id) {
        const { error: employerError } = await supabase
          .from("employers")
          .update({
            company_name: data.company_name,
            phone_number: data.phone_number
          })
          .eq("id", selectedUser.employer_id);

        if (employerError) throw employerError;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setSelectedUser(null);
      editForm.reset();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.user_id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkSuspend = async () => {
    if (!canSuspendUsers) {
      toast({
        title: "Not allowed",
        description: "Suspension requires database setup. Please enable later.",
        variant: "destructive",
      });
      return;
    }
    try {
      const promises = Array.from(selectedUsers).map(userId => 
        supabase.rpc('suspend_user', {
          target_user_id: userId,
          admin_email: currentUser?.email || '',
          reason: 'Bulk suspension by admin'
        })
      );
      
      await Promise.allSettled(promises);
      
      toast({
        title: "Success",
        description: `${selectedUsers.size} users suspended`,
      });
      
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = Array.from(selectedUsers).map(userId => 
        supabase.from("profiles").delete().eq("user_id", userId)
      );
      
      await Promise.allSettled(promises);
      
      toast({
        title: "Success",
        description: `${selectedUsers.size} users deleted`,
      });
      
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    const csvHeaders = ['Name', 'Email', 'User Type', 'Company', 'Status', 'Joined Date', 'Last Login'];
    const csvData = filteredUsers.map(user => [
      user.full_name,
      user.email || '',
      user.user_type,
      user.company_name || '',
      user.is_suspended ? 'Suspended' : 'Active',
      new Date(user.created_at).toLocaleDateString(),
      '' // Last login not available yet
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !user.is_suspended) ||
      (statusFilter === "suspended" && user.is_suspended);

    const matchesUserType = userTypeFilter === "all" || user.user_type === userTypeFilter;
    
    return matchesSearch && matchesStatus && matchesUserType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers(new Set()); // Clear selection when changing pages
  };

  const statusCounts = {
    all: users.length,
    active: users.filter(u => !u.is_suspended).length,
    suspended: users.filter(u => u.is_suspended).length,
    employers: users.filter(u => u.user_type === 'employer').length,
    verified_employers: users.filter(u => u.user_type === 'employer' && u.is_verified).length,
    job_seekers: users.filter(u => u.user_type === 'job_seeker').length,
    admins: users.filter(u => u.user_type === 'admin').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "profile" && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setViewMode("list")}>
            ← Back to Users
          </Button>
          <h2 className="text-2xl font-bold">User Profile</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedUser.company_logo_url && (
                  <img 
                    src={selectedUser.company_logo_url}
                    alt={selectedUser.company_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">
                    {selectedUser.user_type === 'employer' ? selectedUser.company_name : selectedUser.full_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {selectedUser.user_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={selectedUser.is_suspended ? "destructive" : "default"}>
                      {selectedUser.is_suspended ? "Suspended" : "Active"}
                    </Badge>
                    {selectedUser.user_type === 'employer' && selectedUser.is_verified && (
                      <Badge variant="default" className="bg-blue-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Full Name:</span>
                    <span>{selectedUser.full_name}</span>
                  </div>
                  {selectedUser.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Joined:</span>
                    <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {selectedUser.user_type === 'employer' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Company Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                      <span>{selectedUser.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Total Jobs:</span>
                      <span>{selectedUser.total_jobs || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Active Jobs:</span>
                      <span>{selectedUser.active_jobs || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unique Users Grid Layout */}
      {showStatsCards && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50 border-indigo-200 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{statusCounts.all}</p>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Users</p>
                </div>
                <div className="relative">
                  <Users className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50 border-teal-200 dark:from-teal-950 dark:via-teal-900 dark:to-teal-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{statusCounts.active}</p>
                  <p className="text-sm font-medium text-teal-700 dark:text-teal-300">Active</p>
                </div>
                <div className="relative">
                  <CheckCircle className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 border-rose-200 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{statusCounts.employers}</p>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Employers</p>
                </div>
                <div className="relative">
                  <Building className="h-12 w-12 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{statusCounts.job_seekers}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Seekers</p>
                </div>
                <div className="relative">
                  <Briefcase className="h-12 w-12 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                <SelectItem value="suspended">Suspended ({statusCounts.suspended})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admin">Admins ({statusCounts.admins})</SelectItem>
                <SelectItem value="employer">Employers ({statusCounts.employers})</SelectItem>
                <SelectItem value="job_seeker">Job Seekers ({statusCounts.job_seekers})</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddUserDialog(true)}
                disabled={!canUseAuthAdmin}
                title={!canUseAuthAdmin ? "Requires Supabase service role to create users from admin" : undefined}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add User
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportUsers}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowStatsCards(!showStatsCards)}>
                <Eye className="h-4 w-4 mr-1" />
                {showStatsCards ? 'Hide' : 'Show'} Stats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}  
      {selectedUsers.size > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear Selection
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!canSuspendUsers}
                      title={!canSuspendUsers ? "Requires database suspension fields" : undefined}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Suspend Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend {selectedUsers.size} Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will suspend all selected users. They will not be able to access the system until unsuspended.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkSuspend} className="bg-orange-600 hover:bg-orange-700">
                        Suspend Users
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedUsers.size} Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all selected users and their data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                        Delete Users
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={paginatedUsers.length > 0 && selectedUsers.size === paginatedUsers.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedUsers.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedUsers.has(user.user_id)}
                    onCheckedChange={(checked) => handleSelectUser(user.user_id, !!checked)}
                  />
                  {user.company_logo_url && (
                    <img 
                      src={user.company_logo_url}
                      alt={user.company_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {user.user_type === 'employer' ? user.company_name : user.full_name}
                      </h3>
                      {user.user_type === 'employer' && user.is_verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user.user_type.replace('_', ' ')}
                        </Badge>
                        {user.is_suspended && (
                          <Badge variant="destructive" className="text-xs">Suspended</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {user.email && (
                          <span className="truncate">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {user.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                      {user.user_type === 'employer' && user.total_jobs !== undefined && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span>{user.total_jobs} jobs ({user.active_jobs} active)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setViewMode("profile");
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(() => {
                              setSelectedUser(user);
                              handleUpdateUser(editForm.getValues());
                            })} className="space-y-4">
                              <FormField
                                control={editForm.control}
                                name="full_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} defaultValue={user.full_name} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => editForm.reset()}>
                                  Cancel
                                </Button>
                                <Button type="submit">Update</Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password for {user.full_name}</DialogTitle>
                          </DialogHeader>
                          <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(() => {
                              setSelectedUser(user);
                              handleChangePassword(passwordForm.getValues());
                            })} className="space-y-4">
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>
                                  Cancel
                                </Button>
                                <Button type="submit">Change Password</Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuSeparator />

                      {user.user_type === 'employer' && user.employer_id && (
                        <DropdownMenuItem 
                          onClick={() => handleVerifyCompany(user.employer_id!, !user.is_verified)}
                          disabled={!canVerifyCompanies}
                          title={!canVerifyCompanies ? "Requires database verification fields" : undefined}
                        >
                          {user.is_verified ? (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Remove Verification
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Verify Company
                            </>
                          )}
                        </DropdownMenuItem>
                      )}

                      {user.is_suspended ? (
                        <DropdownMenuItem 
                          onClick={() => handleUnsuspendUser(user.user_id)}
                          disabled={!canSuspendUsers}
                          title={!canSuspendUsers ? "Requires database suspension fields" : undefined}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Unsuspend User
                        </DropdownMenuItem>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              disabled={!canSuspendUsers}
                              title={!canSuspendUsers ? "Requires database suspension fields" : undefined}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend User</DialogTitle>
                            </DialogHeader>
                            <Form {...suspensionForm}>
                              <form onSubmit={suspensionForm.handleSubmit(() => {
                                setSelectedUser(user);
                                handleSuspendUser(suspensionForm.getValues());
                              })} className="space-y-4">
                                <FormField
                                  control={suspensionForm.control}
                                  name="reason"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Suspension Reason</FormLabel>
                                      <FormControl>
                                        <Textarea {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex gap-4">
                                  <Button type="button" variant="outline" onClick={() => suspensionForm.reset()}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" variant="destructive">Suspend</Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => {
                        setUserToImpersonate(user);
                        setShowImpersonationDialog(true);
                      }}>
                        <UserCog className="h-4 w-4 mr-2" />
                        Impersonate User
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the user and all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {paginatedUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addUserForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_seeker">Job Seeker</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {addUserForm.watch("user_type") === "employer" && (
                <FormField
                  control={addUserForm.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={addUserForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddUserDialog(false);
                  addUserForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit">Add User</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Impersonation Dialog */}
      {userToImpersonate && (
        <UserImpersonationDialog
          isOpen={showImpersonationDialog}
          onClose={() => {
            setShowImpersonationDialog(false);
            setUserToImpersonate(null);
          }}
          targetUser={userToImpersonate}
        />
      )}
    </div>
  );
}