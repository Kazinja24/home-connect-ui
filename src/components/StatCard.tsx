import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("hover-lift overflow-hidden group", className)}>
      <div className="h-1 bg-gradient-to-r from-primary to-accent opacity-60 group-hover:opacity-100 transition-opacity" />
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-extrabold text-foreground animate-count-up">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
