import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentPlansManagement } from "./PaymentPlansManagement";
import { TransactionHistory } from "./TransactionHistory";
import { PaymentGatewaySettings } from "./PaymentGatewaySettings";
import { CreditCard, History, Settings, DollarSign } from "lucide-react";

export function RevenueManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">የገቢ እና ክፍያ አስተዳደር</h2>
          <p className="text-muted-foreground">Revenue & Payment Management</p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            የክፍያ እቅዶች (Plans)
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            የግብይት ታሪክ (Transactions)
          </TabsTrigger>
          <TabsTrigger value="gateways" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            የክፍያ ቅንብሮች (Payment Settings)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የክፍያ እቅዶች አስተዳደር</CardTitle>
              <CardDescription>
                ለታዋቂ ስራዎች እና ለኩባንያ ፓኬጆች የክፍያ እቅዶችን ያስተዳድሩ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentPlansManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የግብይት ታሪክ</CardTitle>
              <CardDescription>
                ሁሉንም የተሳኩ እና ያልተሳኩ የክፍያ ግብይቶችን ይመልከቱ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የክፍያ መግቢያ ቅንብሮች</CardTitle>
              <CardDescription>
                የክፍያ ስርዓቶችን (Chapa, YenePay) ያዋቅሩ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentGatewaySettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}