import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface NotificationBellProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export const NotificationBell = ({ size = "sm", variant = "outline" }: NotificationBellProps) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={() => navigate("/notifications")}
      className="relative"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs" 
          variant="destructive"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
};