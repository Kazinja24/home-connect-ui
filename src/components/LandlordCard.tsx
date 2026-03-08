import { Button } from "@/components/ui/button";

interface LandlordCardProps {
  name: string;
  responseRate?: number;
  memberSince?: string;
  onContact?: () => void;
}

export function LandlordCard({ name, responseRate, memberSince, onContact }: LandlordCardProps) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          {responseRate && (
            <p className="text-xs text-muted-foreground">Jibu: {responseRate}% ya maombi</p>
          )}
          {memberSince && (
            <p className="text-xs text-muted-foreground">Mwanachama tangu {memberSince}</p>
          )}
        </div>
      </div>
      {onContact && (
        <Button onClick={onContact} className="w-full rounded bg-primary text-primary-foreground hover:bg-primary/90">
          Wasiliana
        </Button>
      )}
    </div>
  );
}
