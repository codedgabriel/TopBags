import { cn } from "@/lib/utils";
import React from "react";

interface CardNeonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "silver" | "bronze";
}

export const CardNeon = React.forwardRef<HTMLDivElement, CardNeonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    
    const borderColor = {
      default: "border-primary/30 hover:border-primary/80",
      gold: "border-yellow-400/50 hover:border-yellow-400",
      silver: "border-gray-300/50 hover:border-gray-300",
      bronze: "border-orange-700/50 hover:border-orange-700",
    }[variant];

    const shadowColor = {
      default: "hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]",
      gold: "hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]",
      silver: "hover:shadow-[0_0_15px_rgba(209,213,219,0.3)]",
      bronze: "hover:shadow-[0_0_15px_rgba(194,65,12,0.3)]",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-card rounded-xl border p-4 transition-all duration-300",
          borderColor,
          shadowColor,
          className
        )}
        {...props}
      >
        {/* Corner Accents for that 'Tech' look */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-0" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-0" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-0" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-0" />

        {children}
      </div>
    );
  }
);
CardNeon.displayName = "CardNeon";
