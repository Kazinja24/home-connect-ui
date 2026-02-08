import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AdminAnalytics = () => {
  const conversionRate = 68; // placeholder

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Application → Agreement Conversion</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
          </div>
          <Progress value={conversionRate} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div><p className="text-muted-foreground">Total Applications</p><p className="font-semibold text-foreground">156</p></div>
            <div><p className="text-muted-foreground">Approved</p><p className="font-semibold text-foreground">106</p></div>
            <div><p className="text-muted-foreground">Leases Signed</p><p className="font-semibold text-foreground">72</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
