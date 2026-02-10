import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AdminAnalytics = () => {
  const conversionRate = 68;

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Takwimu</h1>
      <Card className="glass-strong border-border/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />
        <CardHeader><CardTitle className="text-lg">Ubadilishaji: Maombi → Mkataba</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Kiwango cha Ubadilishaji</p>
            <p className="text-3xl font-extrabold text-primary animate-count-up">{conversionRate}%</p>
          </div>
          <Progress value={conversionRate} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground">Jumla Maombi</p>
              <p className="font-bold text-foreground text-lg">156</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground">Yaliyokubaliwa</p>
              <p className="font-bold text-foreground text-lg">106</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground">Mikataba Iliyosainiwa</p>
              <p className="font-bold text-foreground text-lg">72</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
