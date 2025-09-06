import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MessageSquare, Clock, CheckCircle, XCircle, Reply } from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  message: string;
  is_admin_response: boolean;
  created_at: string;
}

const ticketStatuses = [
  { value: "all", label: "ሁሉም (All)" },
  { value: "open", label: "ክፍት (Open)" },
  { value: "in_progress", label: "በሂደት ላይ (In Progress)" },
  { value: "closed", label: "ተዘግቷል (Closed)" }
];

const priorities = [
  { value: "low", label: "ዝቅተኛ (Low)", color: "bg-green-500" },
  { value: "medium", label: "መካከለኛ (Medium)", color: "bg-yellow-500" },
  { value: "high", label: "ከፍተኛ (High)", color: "bg-orange-500" },
  { value: "urgent", label: "አስቸኳይ (Urgent)", color: "bg-red-500" }
];

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all"
  });
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    // TODO: Implement API call
    const mockTickets: SupportTicket[] = [
      {
        id: "ticket_001",
        user_id: "user_123",
        user_name: "አበበ ካሳ",
        user_email: "abebe@example.com",
        subject: "የስራ ማስታወቂያ መላክ ችግር",
        message: "ስራ ማስታወቂያ ለመላክ እየሞከርኩ ነው ግን አልተሳካልኝም...",
        status: "open",
        priority: "medium",
        category: "Technical Support",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        responses: []
      }
    ];
    setTickets(mockTickets);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      // TODO: Implement API call
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: status as any } : ticket
      ));
      toast.success("የጥያቄ ሁኔታ ተቀይሯል");
    } catch (error) {
      toast.error("ስህተት ተፈጥሯል");
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    try {
      // TODO: Implement API call
      const newResponse: TicketResponse = {
        id: "response_" + Date.now(),
        ticket_id: selectedTicket.id,
        author_id: "admin",
        author_name: "Admin",
        message: replyMessage,
        is_admin_response: true,
        created_at: new Date().toISOString()
      };

      setSelectedTicket(prev => prev ? {
        ...prev,
        responses: [...prev.responses, newResponse]
      } : null);

      setReplyMessage("");
      toast.success("ምላሽ ተልኳል");
    } catch (error) {
      toast.error("ምላሽ መላክ አልተሳካም");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">ክፍት</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">በሂደት ላይ</Badge>;
      case "closed":
        return <Badge className="bg-green-500">ተዘግቷል</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return (
      <Badge className={priorityConfig?.color || "bg-gray-500"}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ማጣሪያዎች (Filters)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">ፈልግ (Search)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ርዕስ ወይም ተጠቃሚ..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>ሁኔታ (Status)</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ticketStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ቅድሚያ (Priority)</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ሁሉም (All)</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>የድጋፍ ጥያቄዎች ዝርዝር</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ተጠቃሚ</TableHead>
                  <TableHead>ርዕስ</TableHead>
                  <TableHead>ቅድሚያ</TableHead>
                  <TableHead>ሁኔታ</TableHead>
                  <TableHead>ቀን</TableHead>
                  <TableHead>እርምጃዎች</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.user_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {new Date(ticket.created_at).toLocaleDateString('am-ET')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">ክፍት</SelectItem>
                            <SelectItem value="in_progress">በሂደት ላይ</SelectItem>
                            <SelectItem value="closed">ተዘግቷል</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Modal/Sidebar would go here */}
      {selectedTicket && (
        <Card>
          <CardHeader>
            <CardTitle>የድጋፍ ጥያቄ ዝርዝር</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedTicket.subject}</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTicket.message}
                </p>
              </div>
              
              {/* Reply Section */}
              <div className="space-y-3">
                <Label htmlFor="reply">ምላሽ ይጻፉ</Label>
                <Textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="የእርስዎ ምላሽ እዚህ ይጻፉ..."
                  className="min-h-[100px]"
                />
                <Button onClick={sendReply} className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  ምላሽ ላክ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}