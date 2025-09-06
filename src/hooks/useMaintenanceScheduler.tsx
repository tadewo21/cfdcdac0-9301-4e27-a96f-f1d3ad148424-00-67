import { useState, useEffect, useCallback } from 'react';
import { useMaintenanceMode } from '@/contexts/MaintenanceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduledMaintenance {
  id: string;
  scheduled_for: string;
  message: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export const useMaintenanceScheduler = () => {
  const [scheduledMaintenances, setScheduledMaintenances] = useState<ScheduledMaintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const { setMaintenanceMode, setMaintenanceMessage } = useMaintenanceMode();
  const { toast } = useToast();

  const loadScheduledMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      // Load from localStorage for now (until database tables are created)
      const stored = localStorage.getItem('scheduledMaintenances');
      if (stored) {
        const parsed = JSON.parse(stored);
        const active = parsed.filter((m: ScheduledMaintenance) => m.is_active);
        setScheduledMaintenances(active);
      }
    } catch (error: any) {
      console.error('Error loading scheduled maintenances:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleMaintenanceWindow = async (
    scheduledFor: Date,
    message: string,
    duration?: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newScheduled: ScheduledMaintenance = {
        id: Date.now().toString(),
        scheduled_for: scheduledFor.toISOString(),
        message,
        is_active: true,
        created_by: user.id,
        created_at: new Date().toISOString()
      };

      const stored = localStorage.getItem('scheduledMaintenances');
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, newScheduled];
      
      localStorage.setItem('scheduledMaintenances', JSON.stringify(updated));

      toast({
        title: 'Maintenance Scheduled',
        description: `Maintenance window scheduled for ${scheduledFor.toLocaleString()}`,
      });

      loadScheduledMaintenances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const cancelScheduledMaintenance = async (id: string) => {
    try {
      const stored = localStorage.getItem('scheduledMaintenances');
      if (stored) {
        const existing = JSON.parse(stored);
        const updated = existing.map((m: ScheduledMaintenance) => 
          m.id === id ? { ...m, is_active: false } : m
        );
        localStorage.setItem('scheduledMaintenances', JSON.stringify(updated));
      }

      toast({
        title: 'Maintenance Cancelled',
        description: 'Scheduled maintenance has been cancelled',
      });

      loadScheduledMaintenances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const checkAndExecuteScheduledMaintenance = useCallback(async () => {
    const now = new Date();
    
    for (const scheduled of scheduledMaintenances) {
      const scheduledTime = new Date(scheduled.scheduled_for);
      
      // Check if maintenance should start (within 1 minute window)
      if (scheduledTime <= now && (now.getTime() - scheduledTime.getTime()) < 60000) {
        try {
          // Enable maintenance mode
          setMaintenanceMode(true);
          setMaintenanceMessage(scheduled.message);
          
          // Log the execution in localStorage
          const logs = localStorage.getItem('maintenanceLogs');
          const existingLogs = logs ? JSON.parse(logs) : [];
          const newLog = {
            id: Date.now().toString(),
            action: 'scheduled',
            message: `Scheduled maintenance started: ${scheduled.message}`,
            user_email: 'system',
            timestamp: now.toISOString()
          };
          localStorage.setItem('maintenanceLogs', JSON.stringify([newLog, ...existingLogs]));

          // Mark as executed
          const stored = localStorage.getItem('scheduledMaintenances');
          if (stored) {
            const existing = JSON.parse(stored);
            const updated = existing.map((m: ScheduledMaintenance) => 
              m.id === scheduled.id ? { ...m, is_active: false } : m
            );
            localStorage.setItem('scheduledMaintenances', JSON.stringify(updated));
          }

          toast({
            title: 'Scheduled Maintenance Started',
            description: scheduled.message,
            variant: 'destructive'
          });
          
        } catch (error) {
          console.error('Error executing scheduled maintenance:', error);
        }
      }
    }
  }, [scheduledMaintenances, setMaintenanceMode, setMaintenanceMessage, toast]);

  useEffect(() => {
    loadScheduledMaintenances();
    
    // Check for scheduled maintenance every minute
    const interval = setInterval(checkAndExecuteScheduledMaintenance, 60000);
    
    return () => clearInterval(interval);
  }, [loadScheduledMaintenances, checkAndExecuteScheduledMaintenance]);

  return {
    scheduledMaintenances,
    loading,
    scheduleMaintenanceWindow,
    cancelScheduledMaintenance,
    loadScheduledMaintenances
  };
};