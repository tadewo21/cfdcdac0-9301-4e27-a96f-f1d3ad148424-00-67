import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: "ETB" | "USD";
  status: "pending" | "success" | "failed" | "refunded";
  payment_gateway: "chapa" | "yenepay" | "stripe" | "paypal";
  gateway_transaction_id?: string;
  gateway_reference?: string;
  description: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

const transactionStatuses = [
  { value: "all", label: "ሁሉም (All)" },
  { value: "pending", label: "በመጠባበቅ ላይ (Pending)" },
  { value: "success", label: "የተሳካ (Success)" },
  { value: "failed", label: "ያልተሳካ (Failed)" },
  { value: "refunded", label: "የተመለሰ (Refunded)" }
];

const paymentGateways = [
  { value: "all", label: "ሁሉም (All)" },
  { value: "chapa", label: "Chapa" },
  { value: "yenepay", label: "YenePay" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" }
];

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    gateway: "all",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call with filters
      
      // Mock data
      const mockTransactions: Transaction[] = [
        {
          id: "txn_001",
          user_id: "user_123",
          user_name: "አበበ ካሳ",
          user_email: "abebe@example.com",
          plan_id: "plan_001",
          plan_name: "Basic Featured Job",
          amount: 500,
          currency: "ETB",
          status: "success",
          payment_gateway: "chapa",
          gateway_transaction_id: "chapa_txn_456",
          gateway_reference: "REF_789",
          description: "Payment for featured job posting",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:32:00Z"
        },
        {
          id: "txn_002",
          user_id: "user_456",
          user_name: "ብርሃኔ ተስፋዬ",
          user_email: "birhane@example.com",
          plan_id: "plan_002",
          plan_name: "Premium Company Package",
          amount: 2000,
          currency: "ETB",
          status: "failed",
          payment_gateway: "yenepay",
          description: "Payment for company package",
          created_at: "2024-01-14T14:20:00Z",
          updated_at: "2024-01-14T14:25:00Z"
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      toast.error("የግብይት ታሪክ መጫን አልተሳካም");
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async () => {
    try {
      // TODO: Implement export functionality
      console.log("Exporting transactions...");
      toast.success("የግብይት ዘገባ ወደ CSV ተልኳል");
    } catch (error) {
      toast.error("ውጭ መላክ አልተሳካም");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">የተሳካ</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">በመጠባበቅ</Badge>;
      case "failed":
        return <Badge className="bg-red-500">ያልተሳካ</Badge>;
      case "refunded":
        return <Badge className="bg-blue-500">የተመለሰ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('am-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">ፈልግ (Search)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ተጠቃሚ ወይም መለያ..."
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
                  {transactionStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>የክፍያ መንገድ</Label>
              <Select
                value={filters.gateway}
                onValueChange={(value) => setFilters(prev => ({ ...prev, gateway: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentGateways.map((gateway) => (
                    <SelectItem key={gateway.value} value={gateway.value}>
                      {gateway.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from">ከ ቀን</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_to">እስከ ቀን</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">የግብይት ታሪክ</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            አድስ
          </Button>
          <Button onClick={exportTransactions} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            ወደ CSV ላክ
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>የግብይት መለያ</TableHead>
                  <TableHead>ተጠቃሚ</TableHead>
                  <TableHead>እቅድ</TableHead>
                  <TableHead>መጠን</TableHead>
                  <TableHead>ሁኔታ</TableHead>
                  <TableHead>የክፍያ መንገድ</TableHead>
                  <TableHead>ቀን</TableHead>
                  <TableHead>አሁኔታ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      መጫን...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      ምንም ግብይት አልተገኘም
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.user_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.plan_name}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.payment_gateway.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}