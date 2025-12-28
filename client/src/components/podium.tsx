import { motion } from "framer-motion";
import { TokenData } from "@/hooks/use-top-bags";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, DollarSign, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="flex items-end justify-center gap-6 md:gap-10 h-[500px] w-full max-w-5xl mx-auto mb-12 px-4">
      {/* 2nd Place */}
      <PodiumStep 
        token={second} 
        place={2} 
        color="silver" 
        height="h-[55%]" 
        delay={0.2} 
        value={formatValue(second)}
        label={label}
      />

      {/* 1st Place - Much taller for emphasis */}
      <PodiumStep 
        token={first} 
        place={1} 
        color="gold" 
        height="h-[100%]" 
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
        height="h-[40%]" 
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
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const colorStyles = {
    gold: {
      bg: "bg-gradient-to-b from-yellow-500/15 to-yellow-500/5",
      border: "border-yellow-500/60",
      text: "text-yellow-400",
      shadow: "shadow-[0_0_40px_rgba(234,179,8,0.3)]",
      badge: "bg-yellow-500 text-black",
      glow: "hover:shadow-[0_0_60px_rgba(234,179,8,0.5)]",
      accent: "bg-yellow-500/20"
    },
    silver: {
      bg: "bg-gradient-to-b from-gray-400/15 to-gray-400/5",
      border: "border-gray-400/60",
      text: "text-gray-300",
      shadow: "shadow-[0_0_40px_rgba(156,163,175,0.3)]",
      badge: "bg-gray-400 text-black",
      glow: "hover:shadow-[0_0_60px_rgba(156,163,175,0.5)]",
      accent: "bg-gray-400/20"
    },
    bronze: {
      bg: "bg-gradient-to-b from-orange-700/15 to-orange-700/5",
      border: "border-orange-700/60",
      text: "text-orange-500",
      shadow: "shadow-[0_0_40px_rgba(194,65,12,0.3)]",
      badge: "bg-orange-700 text-white",
      glow: "hover:shadow-[0_0_60px_rgba(194,65,12,0.5)]",
      accent: "bg-orange-700/20"
    }
  }[color];

  const handleCopyCA = () => {
    if (!token) return;
    navigator.clipboard.writeText(token.mint).then(() => {
      setCopied(true);
      toast({
        title: "Address Copied!",
        description: `${token.symbol} contract address copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy contract address",
        variant: "destructive"
      });
    });
  };

  return (
    <div className={cn("flex flex-col items-center justify-end w-1/3 max-w-[200px] h-full cursor-pointer group")} onClick={handleCopyCA}>
      {/* Token Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        className="mb-4 text-center w-full"
      >
        {token ? (
          <>
            <div className="relative mx-auto w-16 h-16 mb-3 rounded-full border-2 border-border overflow-hidden bg-black/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-110" style={{
              boxShadow: copied ? `0 0 30px ${color === 'gold' ? 'rgba(234,179,8,0.6)' : color === 'silver' ? 'rgba(156,163,175,0.6)' : 'rgba(194,65,12,0.6)'}` : 'none'
            }}>
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
            <div className={cn("font-bold text-lg md:text-xl truncate transition-colors duration-200", isWinner ? "text-primary" : "text-white", "group-hover:text-primary")}>
              {token.symbol}
            </div>
            <div className={cn("text-xs md:text-sm font-mono mt-2 font-bold transition-colors duration-200", colorStyles.text)}>
              {value}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2 flex items-center justify-center gap-1">
              {label}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </motion.div>
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
          "w-full rounded-t-2xl border-t-4 border-x border-b-0 backdrop-blur-md relative overflow-hidden group transition-all duration-300 cursor-pointer",
          height,
          colorStyles.bg,
          colorStyles.border,
          colorStyles.shadow,
          colorStyles.glow
        )}
      >
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-t-2xl border-t-4 border-x border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
          borderColor: color === 'gold' ? 'rgba(234,179,8,0.8)' : color === 'silver' ? 'rgba(156,163,175,0.8)' : 'rgba(194,65,12,0.8)'
        }} />

        {/* Grid pattern inside podium */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Accent color on hover */}
        <div className={cn("absolute inset-0 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300", colorStyles.accent)} />
        
        {/* Rank Number Large */}
        <div className={cn(
          "absolute bottom-0 w-full text-center text-6xl font-black select-none pb-4 opacity-15 group-hover:opacity-25 transition-opacity duration-300",
          colorStyles.text
        )}>
          {place}
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-transparent via-white/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out opacity-0 group-hover:opacity-100" />
      </motion.div>
    </div>
  );
}
