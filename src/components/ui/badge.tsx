import { cn } from "@/lib/utils";

export function Badge({ className, variant = "outline", children }: { className?: string; variant?: "outline" | "secondary" | "solid"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "outline" && "border border-border text-foreground",
        variant === "secondary" && "bg-muted text-foreground",
        variant === "solid" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
