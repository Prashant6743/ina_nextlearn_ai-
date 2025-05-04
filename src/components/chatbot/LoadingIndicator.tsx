"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
}

export function LoadingIndicator({ className }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Thinking...</span>
    </div>
  );
}
