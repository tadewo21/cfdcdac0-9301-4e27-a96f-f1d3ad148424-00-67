import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, RefreshCw, Shield } from 'lucide-react';
import { useMaintenanceMode } from '@/contexts/MaintenanceContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaintenanceModeProps {
  isAdmin?: boolean;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ isAdmin = false }) => {
  const { maintenanceMessage, setMaintenanceMode, setMaintenanceMessage } = useMaintenanceMode();
  const { t } = useLanguage();

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-10 h-10 text-destructive animate-spin" />
              </div>
              <Shield className="w-6 h-6 text-primary absolute -top-1 -right-1" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                {t("maintenance.mode")}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {maintenanceMessage}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => setMaintenanceMode(false)}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("maintenance.disableMaintenanceMode")}
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                {t("maintenance.refreshApp")}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              {t("maintenance.adminPanel")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-10 h-10 text-primary animate-spin" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {t("maintenance.appUnderMaintenanceAmharic")}
            </h1>
            <h2 className="text-lg font-semibold text-muted-foreground">
              {t("maintenance.appUnderMaintenance")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {maintenanceMessage}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("maintenance.tryAgain")}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            በቅርቡ እንመለሳለን። ধንየবাদ ለመጠበቃችሁ።<br/>
            We'll be back shortly. Thank you for your patience.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};