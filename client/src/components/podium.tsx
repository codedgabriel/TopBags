import { motion } from "framer-motion";
import { TokenData } from "@/hooks/use-top-bags";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";

interface PodiumProps {
  top3: TokenData[];
  type: "marketCap" | "earnings";
}

export function Podium({ top3, type }: PodiumProps) {
  // Ensure we have 3 spots even if data is missing, to prevent layout shifts
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const formatValue = (token: TokenData | undefined) => {
    if (!token) return "-";
    if (type === "marketCap") {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(token.marketCap);
    } else {
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(token.totalEarnings)}`;
    }
  };

  const label = type === "marketCap" ? "Market Cap" : "Total Earnings";

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 h-[450px] w-full max-w-4xl mx-auto mb-12 px-4">
      {/* 2nd Place */}
      <PodiumStep 
        token={second} 
        place={2} 
        color="silver" 
        height="h-[60%]" 
        delay={0.2} 
        value={formatValue(second)}
        label={label}
      />

      {/* 1st Place */}
      <PodiumStep 
        token={first} 
        place={1} 
        color="gold" 
        height="h-[80%]" 
        delay={0}
        value={formatValue(first)}
        label={label}
        isWinner
      />

      {/* 3rd Place */}
      <PodiumStep 
        token={third} 
        place={3} 
        color="bronze" 
        height="h-[50%]" 
        delay={0.4}
        value={formatValue(third)}
        label={label}
      />
    </div>
  );
}

function PodiumStep({ 
  token, 
  place, 
  color, 
  height, 
  delay,
  value,
  label,
  isWinner = false
}: { 
  token?: TokenData; 
  place: number; 
  color: "gold" | "silver" | "bronze"; 
  height: string;
  delay: number;
  value: string;
  label: string;
  isWinner?: boolean;
}) {
  const colorStyles = {
    gold: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500",
      text: "text-yellow-400",
      shadow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
      badge: "bg-yellow-500 text-black"
    },
    silver: {
      bg: "bg-gray-400/10",
      border: "border-gray-400",
      text: "text-gray-300",
      shadow: "shadow-[0_0_30px_rgba(156,163,175,0.2)]",
      badge: "bg-gray-400 text-black"
    },
    bronze: {
      bg: "bg-orange-700/10",
      border: "border-orange-700",
      text: "text-orange-500",
      shadow: "shadow-[0_0_30px_rgba(194,65,12,0.2)]",
      badge: "bg-orange-700 text-white"
    }
  }[color];

  return (
    <div className={cn("flex flex-col items-center justify-end w-1/3 max-w-[200px] h-full")}>
      {/* Token Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        className="mb-4 text-center w-full"
      >
        {token ? (
          <>
            <div className="relative mx-auto w-16 h-16 mb-2 rounded-full border-2 border-border overflow-hidden bg-black/50">
               {/* Fallback image if DexScreener img fails, but simple img tag usually works */}
               <img 
                 src={token.image} 
                 alt={token.symbol}
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                 }}
               />
               <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg", colorStyles.badge)}>
                 {place}
               </div>
            </div>
            <div className={cn("font-bold text-lg md:text-xl truncate", isWinner ? "text-neon" : "text-white")}>
              {token.symbol}
            </div>
            <div className={cn("text-xs md:text-sm font-mono mt-1", colorStyles.text)}>
              {value}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
              {label}
            </div>
          </>
        ) : (
          <div className="h-20 flex items-center justify-center text-muted-foreground text-xs">Loading...</div>
        )}
      </motion.div>

      {/* Podium Block */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ delay, duration: 0.8, ease: "circOut" }}
        className={cn(
          "w-full rounded-t-lg border-t-4 border-x border-b-0 backdrop-blur-sm relative overflow-hidden group",
          height,
          colorStyles.bg,
          colorStyles.border,
          colorStyles.shadow
        )}
      >
        {/* Subtle grid pattern inside podium */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        {/* Rank Number Large */}
        <div className={cn(
          "absolute bottom-0 w-full text-center text-6xl font-black opacity-10 select-none pb-4",
          colorStyles.text
        )}>
          {place}
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
      </motion.div>
    </div>
  );
}
