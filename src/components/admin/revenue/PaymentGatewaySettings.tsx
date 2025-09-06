import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, TestTube, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  configuration: Record<string, any>;
  status: "connected" | "disconnected" | "error";
  last_tested?: string;
}

export function PaymentGatewaySettings() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [activeTab, setActiveTab] = useState("chapa");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchGatewaySettings();
  }, []);

  const fetchGatewaySettings = async () => {
    try {
      // TODO: Implement API call to fetch gateway settings
      // Mock data
      const mockGateways: PaymentGateway[] = [
        {
          id: "chapa",
          name: "Chapa",
          description: "Ethiopian payment gateway supporting mobile money, bank transfers, and cards",
          is_enabled: true,
          is_test_mode: true,
          status: "connected",
          configuration: {
            public_key: "",
            secret_key: "",
            webhook_url: "",
            callback_url: ""
          }
        },
        {
          id: "yenepay",
          name: "YenePay",
          description: "Ethiopian digital payment platform",
          is_enabled: false,
          is_test_mode: true,
          status: "disconnected",
          configuration: {
            merchant_id: "",
            api_key: "",
            webhook_url: "",
            callback_url: ""
          }
        },
        {
          id: "stripe",
          name: "Stripe",
          description: "International payment processor for global customers",
          is_enabled: false,
          is_test_mode: true,
          status: "disconnected",
          configuration: {
            publishable_key: "",
            secret_key: "",
            webhook_secret: "",
            webhook_url: ""
          }
        }
      ];
      setGateways(mockGateways);
    } catch (error) {
      toast.error("የክፍያ ቅንብሮች መጫን አልተሳካም");
    }
  };

  const updateGatewayConfiguration = async (gatewayId: string, configuration: any) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update gateway configuration
      console.log("Updating gateway configuration:", { gatewayId, configuration });
      
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, configuration }
          : gateway
      ));
      
      toast.success("ቅንብሮች ተቀመጡ");
    } catch (error) {
      toast.error("ቅንብሮች ማስቀመጥ አልተሳካም");
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      // TODO: Implement API call to toggle gateway
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, is_enabled: enabled }
          : gateway
      ));
      
      toast.success(enabled ? "የክፍያ መንገድ ተነቃ" : "የክፍያ መንገድ ተቦዘን");
    } catch (error) {
      toast.error("ሁኔታ መቀየር አልተሳካም");
    }
  };

  const toggleTestMode = async (gatewayId: string, testMode: boolean) => {
    try {
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, is_test_mode: testMode }
          : gateway
      ));
      
      toast.success(testMode ? "የሙከራ ሁኔታ ተነቃ" : "ቀጥተኛ ሁኔታ ተነቃ");
    } catch (error) {
      toast.error("ሁኔታ መቀየር አልተሳካም");
    }
  };

  const testGatewayConnection = async (gatewayId: string) => {
    try {
      setLoading(true);
      // TODO: Implement API call to test gateway connection
      console.log("Testing gateway connection:", gatewayId);
      
      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      setTestResults(prev => ({ ...prev, [gatewayId]: isSuccess }));
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { 
              ...gateway, 
              status: isSuccess ? "connected" : "error",
              last_tested: new Date().toISOString()
            }
          : gateway
      ));
      
      toast.success(isSuccess ? "ግንኙነት ተሳክቷል" : "ግንኙነት አልተሳካም");
    } catch (error) {
      toast.error("ሙከራ አልተሳካም");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">ተገናኝቷል</Badge>;
      case "error":
        return <Badge className="bg-red-500">ስህተት</Badge>;
      default:
        return <Badge variant="secondary">አልተገናኘም</Badge>;
    }
  };

  const GatewayConfigForm = ({ gateway }: { gateway: PaymentGateway }) => {
    const [config, setConfig] = useState(gateway.configuration);

    const handleSave = () => {
      updateGatewayConfiguration(gateway.id, config);
    };

    const renderConfigFields = () => {
      switch (gateway.id) {
        case "chapa":
          return (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="public_key">Public Key</Label>
                <Input
                  id="public_key"
                  value={config.public_key || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, public_key: e.target.value }))}
                  placeholder="CHPUBK_TEST_..."
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  value={config.secret_key || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="CHASECK_TEST_..."
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={config.webhook_url || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/chapa"
                />
              </div>
            </div>
          );

        case "yenepay":
          return (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchant_id">Merchant ID</Label>
                <Input
                  id="merchant_id"
                  value={config.merchant_id || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, merchant_id: e.target.value }))}
                  placeholder="Your YenePay merchant ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  value={config.api_key || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Your YenePay API key"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={config.webhook_url || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/yenepay"
                />
              </div>
            </div>
          );

        case "stripe":
          return (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishable_key">Publishable Key</Label>
                <Input
                  id="publishable_key"
                  value={config.publishable_key || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, publishable_key: e.target.value }))}
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  value={config.secret_key || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="sk_test_..."
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret</Label>
                <Input
                  id="webhook_secret"
                  value={config.webhook_secret || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, webhook_secret: e.target.value }))}
                  placeholder="whsec_..."
                  type="password"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(gateway.status)}
            <div>
              <h3 className="text-lg font-semibold">{gateway.name}</h3>
              <p className="text-sm text-muted-foreground">{gateway.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(gateway.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`enable_${gateway.id}`} className="text-base font-medium">
                የክፍያ መንገድ ይንቁ
              </Label>
              <p className="text-sm text-muted-foreground">
                ይህ የክፍያ መንገድ ንቁ ወይም ዝግ እንደሆነ ይቆጣጠሩ
              </p>
            </div>
            <Switch
              id={`enable_${gateway.id}`}
              checked={gateway.is_enabled}
              onCheckedChange={(checked) => toggleGateway(gateway.id, checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`test_${gateway.id}`} className="text-base font-medium">
                የሙከራ ሁኔታ
              </Label>
              <p className="text-sm text-muted-foreground">
                ለሙከራ ወይም ለቀጥተኛ ክፍያ መጠቀም
              </p>
            </div>
            <Switch
              id={`test_${gateway.id}`}
              checked={gateway.is_test_mode}
              onCheckedChange={(checked) => toggleTestMode(gateway.id, checked)}
            />
          </div>
        </div>

        {renderConfigFields()}

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => testGatewayConnection(gateway.id)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            ግንኙነት ይሞክሩ
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            ቅንብሮች አስቀምጥ
          </Button>
        </div>

        {gateway.last_tested && (
          <div className="text-sm text-muted-foreground">
            የመጨረሻ ሙከራ: {new Date(gateway.last_tested).toLocaleString('am-ET')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {gateways.map((gateway) => (
            <TabsTrigger 
              key={gateway.id} 
              value={gateway.id}
              className="flex items-center gap-2"
            >
              {getStatusIcon(gateway.status)}
              {gateway.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {gateways.map((gateway) => (
          <TabsContent key={gateway.id} value={gateway.id} className="mt-6">
            <Card>
              <CardContent className="p-6">
                <GatewayConfigForm gateway={gateway} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>አስፈላጊ መረጃዎች</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">የሙከራ ሁኔታ vs ቀጥተኛ ሁኔታ</h4>
              <p className="text-muted-foreground">
                የሙከራ ሁኔታን በመጠቀም በእውነተኛ ገንዘብ ሳትከፍሉ ክፍያዎችን ይሞክሩ። ቀጥተኛ ሁኔታ ለእውነተኛ ገንዘብ ማስተላለፍ ይጠቅማል።
              </p>
            </div>
            <div>
              <h4 className="font-medium">Webhook URLs</h4>
              <p className="text-muted-foreground">
                Webhook URLs በክፍያ አቅራቢዎች ዘንድ ክፍያዎች ስኬታማ በሆኑ ጊዜ ማሳወቂያ ለመቀበል ያስፈልጋሉ።
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}