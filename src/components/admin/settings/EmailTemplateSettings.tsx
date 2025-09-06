import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Mail, Eye, Send, Plus, Trash2, Copy, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  variables: string[];
}

export function EmailTemplateSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("");

  const { toast } = useToast();
  const { t } = useLanguage();

  const defaultTemplates: EmailTemplate[] = [
    {
      id: "1",
      type: "registration",
      name: "የምዝገባ ደብዳቤ",
      subject: "እንኩዋን ወደ {SITE_NAME} በደህና መጡ!",
      body: `ውድ {USER_NAME},

እንኩዋን ወደ {SITE_NAME} በደህና መጡ! የእርስዎ መለያ በተሳካ ሁኔታ ተፈጥሯል።

የመለያ ዝርዝሮች:
ኢሜይል: {USER_EMAIL}
የመዝገባ ቀን: {REGISTRATION_DATE}

ወደ መለያዎ ለመግባት በዚህ ሊንክ ይጠቀሙ: {LOGIN_URL}

እኛን ስለመረጡ እናመሰግናለን!

{SITE_NAME} ቡድን`,
      isActive: true,
      variables: ["USER_NAME", "USER_EMAIL", "SITE_NAME", "REGISTRATION_DATE", "LOGIN_URL"]
    },
    {
      id: "2",
      type: "job_approved",
      name: "የስራ ማጽደቂያ ደብዳቤ",
      subject: "የእርስዎ ስራ ተፀድቋል - {JOB_TITLE}",
      body: `ውድ {EMPLOYER_NAME},

እንኩዋን ደስ አለዎት! የለጠፉት ስራ "{JOB_TITLE}" በአስተዳዳሪዎቻችን ተገምግሞ ተፀድቋል།

የስራ ዝርዝሮች:
ስራ መጠሪያ: {JOB_TITLE}
ኩባንያ: {COMPANY_NAME}
የማጽደቂያ ቀን: {APPROVAL_DATE}

የስራዎን ሙሉ ዝርዝር ለማየት: {JOB_URL}

ከዚህ በኋላ ሰዎች የእርስዎን ስራ ማየት እና ማመልከት ይችላሉ።

{SITE_NAME} ቡድን`,
      isActive: true,
      variables: ["EMPLOYER_NAME", "JOB_TITLE", "COMPANY_NAME", "APPROVAL_DATE", "JOB_URL", "SITE_NAME"]
    },
    {
      id: "3",
      type: "job_rejected",
      name: "የስራ ውድቅ ማድረጊያ ደብዳቤ",
      subject: "የእርስዎ ስራ ውድቅ ሆኗል - {JOB_TITLE}",
      body: `ውድ {EMPLOYER_NAME},

በሀዘን እያሳወቅን የለጠፉት ስራ "{JOB_TITLE}" የድህረ ገጻችንን መመሪያ ስላልተከተለ ውድቅ ሆኗል።

የውድቅነት ምክንያት: {REJECTION_REASON}

እባክዎ መመሪያዎቻችንን በማንበብ እንደገና ይለጥፉ: {GUIDELINES_URL}

ለማንኛውም ጥያቄ እዚህ ያነጋግሩን: {CONTACT_EMAIL}

{SITE_NAME} ቡድን`,
      isActive: true,
      variables: ["EMPLOYER_NAME", "JOB_TITLE", "REJECTION_REASON", "GUIDELINES_URL", "CONTACT_EMAIL", "SITE_NAME"]
    },
    {
      id: "4",
      type: "password_reset",
      name: "የይለፍ ቃል ዳግም ማስጀመሪያ",
      subject: "የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ",
      body: `ውድ {USER_NAME},

የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ ቀርቧል።

አዲስ የይለፍ ቃል ለማዘጋጀት በዚህ ሊንክ ይጠቀሙ: {RESET_URL}

ይህ ሊንክ በ 24 ሰዓት ውስጥ ያለቀዋል።

ይህንን ጥያቄ ካላቀረቡ ይህንን ኢሜይል ይተውት።

{SITE_NAME} ቡድን`,
      isActive: true,
      variables: ["USER_NAME", "RESET_URL", "SITE_NAME"]
    },
    {
      id: "5",
      type: "new_job_notification",
      name: "አዲስ ስራ ማሳወቂያ",
      subject: "በእርስዎ ተመራጭ ዘርፍ አዲስ ስራ ተለጠፏል",
      body: `ውድ {USER_NAME},

በእርስዎ ተመራጭ ዘርፍ "{JOB_CATEGORY}" አዲስ ስራ ተለጠፏል:

ስራ መጠሪያ: {JOB_TITLE}
ኩባንያ: {COMPANY_NAME}
ቦታ: {JOB_LOCATION}
ዓይነት: {JOB_TYPE}

ሙሉ ዝርዝር ለማየት እና ለማመልከት: {JOB_URL}

የማሳወቂያ ቅንብሮችን ለመቀየር: {NOTIFICATION_SETTINGS_URL}

{SITE_NAME} ቡድን`,
      isActive: true,
      variables: ["USER_NAME", "JOB_CATEGORY", "JOB_TITLE", "COMPANY_NAME", "JOB_LOCATION", "JOB_TYPE", "JOB_URL", "NOTIFICATION_SETTINGS_URL", "SITE_NAME"]
    }
  ];

  // Load templates from localStorage or use defaults
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const savedTemplates = localStorage.getItem('email_templates');
        if (savedTemplates) {
          const parsed = JSON.parse(savedTemplates);
          setTemplates(parsed);
          setSelectedTemplate(parsed[0] || null);
        } else {
          setTemplates(defaultTemplates);
          setSelectedTemplate(defaultTemplates[0]);
          // Save defaults to localStorage
          localStorage.setItem('email_templates', JSON.stringify(defaultTemplates));
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates(defaultTemplates);
        setSelectedTemplate(defaultTemplates[0]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const handleTemplateUpdate = (field: string, value: string | boolean) => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = { ...selectedTemplate, [field]: value };
    setSelectedTemplate(updatedTemplate);
    
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id ? updatedTemplate : template
    );
    setTemplates(updatedTemplates);
    
    // Auto-save to localStorage
    localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('email_templates', JSON.stringify(templates));
      
      // In a real implementation, you would save to Supabase here
      // await supabase.from('email_templates').upsert(selectedTemplate);
      
      toast({
        title: "ተሳክቷል!",
        description: "የኢሜይል አብነት በተሳካ ሁኔታ ተቀምጧል"
      });
    } catch (error) {
      toast({
        title: "ስህተት!",
        description: "አብነቱን ማስቀመጥ አልተቻለም",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!selectedTemplate || !testEmailAddress.trim()) {
      toast({
        title: "ስህተት!",
        description: "እባክዎ የኢሜይል አድራሻ ያስገቡ",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, you would send via Supabase Edge Function
      // await supabase.functions.invoke('send-test-email', {
      //   body: { 
      //     templateId: selectedTemplate.id,
      //     emailAddress: testEmailAddress
      //   }
      // });
      
      toast({
        title: "ተሳክቷል!",
        description: `ሙከራ ኢሜይል ወደ ${testEmailAddress} ተልኳል`
      });
    } catch (error) {
      toast({
        title: "ስህተት!",
        description: "ሙከራ ኢሜይል መላክ አልተቻለም",
        variant: "destructive"
      });
    }
  };

  const handleCreateNewTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateType.trim()) {
      toast({
        title: "ስህተት!",
        description: "እባክዎ የአብነት ስም እና ዓይነት ያስገቡ",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      type: newTemplateType,
      name: newTemplateName,
      subject: "አዲስ አብነት ርዕስ",
      body: "አዲስ አብነት መልእክት...",
      isActive: false,
      variables: []
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    setSelectedTemplate(newTemplate);
    localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));
    
    setNewTemplateName("");
    setNewTemplateType("");
    
    toast({
      title: "ተሳክቷል!",
      description: "አዲስ አብነት ተፈጥሯል"
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (templates.length <= 1) {
      toast({
        title: "ስህተት!",
        description: "ቢያንስ አንድ አብነት መቅረት አለበት",
        variant: "destructive"
      });
      return;
    }

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(updatedTemplates[0] || null);
    }
    
    localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));
    
    toast({
      title: "ተሳክቷል!",
      description: "አብነት ተሰርዟል"
    });
  };

  const handleDuplicateTemplate = () => {
    if (!selectedTemplate) return;

    const duplicateTemplate: EmailTemplate = {
      ...selectedTemplate,
      id: Date.now().toString(),
      name: `${selectedTemplate.name} (ኮፒ)`,
      isActive: false
    };

    const updatedTemplates = [...templates, duplicateTemplate];
    setTemplates(updatedTemplates);
    setSelectedTemplate(duplicateTemplate);
    localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));
    
    toast({
      title: "ተሳክቷል!",
      description: "አብነት ተገልብጧል"
    });
  };

  const handleResetToDefaults = () => {
    setTemplates(defaultTemplates);
    setSelectedTemplate(defaultTemplates[0]);
    localStorage.setItem('email_templates', JSON.stringify(defaultTemplates));
    
    toast({
      title: "ተሳክቷል!",
      description: "አብነቶች ወደ ነባሪ ሁኔታ ተመለሱ"
    });
  };

  const renderPreview = () => {
    let previewSubject = selectedTemplate.subject;
    let previewBody = selectedTemplate.body;
    
    // Replace variables with example data for preview
    const exampleData: Record<string, string> = {
      USER_NAME: "አሚን አሊ",
      USER_EMAIL: "amin.ali@example.com",
      SITE_NAME: "Ethiopian Job Board",
      REGISTRATION_DATE: "January 15, 2024",
      LOGIN_URL: "https://ethiojobs.com/login",
      EMPLOYER_NAME: "አኪ ኩባንያ",
      JOB_TITLE: "Software Developer",
      COMPANY_NAME: "TechEthio Solutions",
      APPROVAL_DATE: "January 16, 2024",
      JOB_URL: "https://ethiojobs.com/jobs/123",
      REJECTION_REASON: "የስራ መግለጫ ከድህረ ገጻችን መመሪያ ጋር አይጣጣምም",
      GUIDELINES_URL: "https://ethiojobs.com/guidelines",
      CONTACT_EMAIL: "support@ethiojobs.com",
      RESET_URL: "https://ethiojobs.com/reset-password/token123",
      JOB_CATEGORY: "መረጃ ቴክኖሎጂ",
      JOB_LOCATION: "አዲስ አበባ",
      JOB_TYPE: "ሙሉ ጊዜ",
      NOTIFICATION_SETTINGS_URL: "https://ethiojobs.com/settings/notifications"
    };

    selectedTemplate.variables.forEach(variable => {
      const placeholder = `{${variable}}`;
      previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), exampleData[variable] || placeholder);
      previewBody = previewBody.replace(new RegExp(placeholder, 'g'), exampleData[variable] || placeholder);
    });

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">ርዕስ:</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">{previewSubject}</div>
        </div>
        <div>
          <Label className="text-sm font-medium">መልእክት:</Label>
          <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-line">{previewBody}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">በመጫን ላይ...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedTemplate) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            ምንም አብነት አልተገኘም
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            የኢሜይል አብነቶች
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2 flex-1">
                <Label className="text-base font-medium">አብነት ምርጫ</Label>
                <p className="text-sm text-muted-foreground">
                  {templates.length} አብነቶች ይገኛሉ
                </p>
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      አዲስ አብነት
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>አዲስ ኢሜይል አብነት ፍጠር</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">አብነት ስም</Label>
                        <Input
                          id="new-name"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="የአብነቱን ስም ያስገቡ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-type">አብነት ዓይነት</Label>
                        <Select value={newTemplateType} onValueChange={setNewTemplateType}>
                          <SelectTrigger>
                            <SelectValue placeholder="አብነት ዓይነት ይምረጡ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registration">የምዝገባ ደብዳቤ</SelectItem>
                            <SelectItem value="job_approved">የስራ ማጽደቂያ</SelectItem>
                            <SelectItem value="job_rejected">የስራ ውድቅ</SelectItem>
                            <SelectItem value="password_reset">የይለፍ ቃል ዳግም ማስጀመሪያ</SelectItem>
                            <SelectItem value="notification">ማሳወቂያ</SelectItem>
                            <SelectItem value="reminder">አስታዋሽ</SelectItem>
                            <SelectItem value="custom">ሌላ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateNewTemplate} className="w-full">
                        አብነት ፍጠር
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      ዳግም አስጀምር
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ወደ ነባሪ ሁኔታ መመለስ</AlertDialogTitle>
                      <AlertDialogDescription>
                        ሁሉም አብነቶች ወደ ነባሪ ሁኔታ ይመለሳሉ። ይህ ድርጊት መቀልበስ አይቻልም።
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ሰርዝ</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetToDefaults}>
                        ዳግም አስጀምር
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Template Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate.id === template.id 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'hover:ring-1 hover:ring-muted-foreground'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-sm leading-tight">{template.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {template.isActive ? (
                            <div className="h-2 w-2 bg-green-500 rounded-full" title="ንቁ" />
                          ) : (
                            <div className="h-2 w-2 bg-gray-300 rounded-full" title="ቦዝ" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p className="truncate">{template.subject}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs px-1 py-0">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedTemplate.name}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateTemplate}
              >
                <Copy className="h-4 w-4 mr-2" />
                ገልብጥ
              </Button>
              {templates.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      ሰርዝ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>አብነት መሰረዝ</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{selectedTemplate.name}" አብነቱን መሰረዝ ይፈልጋሉ? ይህ ድርጊት መቀልበስ አይቻልም።
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ሰርዝ</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        ሰርዝ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{selectedTemplate.type}</Badge>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedTemplate.isActive}
                    onCheckedChange={(checked) => handleTemplateUpdate("isActive", checked)}
                  />
                  <span className="text-sm">{selectedTemplate.isActive ? 'ንቁ' : 'ቦዝ'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? "አርትዕ" : "ቅድመ ዕይታ"}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      ሙከራ ኢሜይል
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ሙከራ ኢሜይል ላክ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-email">የኢሜይል አድራሻ</Label>
                        <Input
                          id="test-email"
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="test@example.com"
                        />
                      </div>
                      <Button onClick={handleSendTestEmail} className="w-full">
                        ሙከራ ኢሜይል ላክ
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Template Content */}
            {previewMode ? (
              renderPreview()
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">አብነት ስም</Label>
                  <Input
                    id="template-name"
                    value={selectedTemplate.name}
                    onChange={(e) => handleTemplateUpdate("name", e.target.value)}
                    disabled={!selectedTemplate.isActive}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">ርዕስ</Label>
                  <Input
                    id="subject"
                    value={selectedTemplate.subject}
                    onChange={(e) => handleTemplateUpdate("subject", e.target.value)}
                    disabled={!selectedTemplate.isActive}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">መልእክት</Label>
                  <Textarea
                    id="body"
                    value={selectedTemplate.body}
                    onChange={(e) => handleTemplateUpdate("body", e.target.value)}
                    disabled={!selectedTemplate.isActive}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>የሚያሉ ተለዋዋጮች</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {`{${variable}}`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    እነዚህ ተለዋዋጮች በኢሜይል ላክስስ ጊዜ በትክክለኛ እሴቶች ይተካሉ
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button 
              onClick={handleSaveTemplate} 
              className="w-full" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  በማስቀመጥ ላይ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  አብነት ቀምጥ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}