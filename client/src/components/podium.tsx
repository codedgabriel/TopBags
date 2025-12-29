import { motion } from "framer-motion";
import { TokenData } from "@/hooks/use-top-bags";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PodiumProps {
  top3: TokenData[];
  type: "marketCap" | "earnings";
}

export function Podium({ top3, type }: PodiumProps) {
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
    <div className="w-full max-w-5xl mx-auto mb-12 px-4">
      <div className="flex items-end justify-center gap-8 h-64">
        {/* 3rd Place - h-48 */}
        {third && (
          <PodiumCard
            token={third}
            place={3}
            value={formatValue(third)}
            label={label}
            color="bronze"
            height="h-48"
            delay={0.4}
          />
        )}

        {/* 1st Place - h-64 (tallest) */}
        {first && (
          <PodiumCard
            token={first}
            place={1}
            value={formatValue(first)}
            label={label}
            color="gold"
            height="h-64"
            delay={0}
            isWinner
          />
        )}

        {/* 2nd Place - h-56 */}
        {second && (
          <PodiumCard
            token={second}
            place={2}
            value={formatValue(second)}
            label={label}
            color="silver"
            height="h-56"
            delay={0.2}
          />
        )}
      </div>
    </div>
  );
}

function PodiumCard({
  token,
  place,
  value,
  label,
  color,
  height,
  delay,
  isWinner = false,
}: {
  token: TokenData;
  place: number;
  value: string;
  label: string;
  color: "gold" | "silver" | "bronze";
  height: string;
  delay: number;
  isWinner?: boolean;
}) {
  const { toast } = useToast();

  const colorConfig = {
    gold: {
      bg: "bg-gradient-to-b from-yellow-500/20 to-yellow-500/10",
      border: "border-yellow-500/50",
      text: "text-yellow-400",
      badge: "bg-yellow-500 text-black",
      glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]",
    },
    silver: {
      bg: "bg-gradient-to-b from-gray-400/20 to-gray-400/10",
      border: "border-gray-400/50",
      text: "text-gray-300",
      badge: "bg-gray-400 text-black",
      glow: "shadow-[0_0_30px_rgba(156,163,175,0.4)]",
    },
    bronze: {
      bg: "bg-gradient-to-b from-orange-700/20 to-orange-700/10",
      border: "border-orange-700/50",
      text: "text-orange-500",
      badge: "bg-orange-700 text-white",
      glow: "shadow-[0_0_30px_rgba(194,65,12,0.4)]",
    },
  }[color];

  const handleClick = () => {
    navigator.clipboard.writeText(token.mint).then(() => {
      toast({
        title: "Address Copied!",
        description: `${token.symbol} contract address copied to clipboard`,
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`flex flex-col items-center cursor-pointer ${height}`}
      onClick={handleClick}
    >
      {/* Token Info - Fixed at top */}
      <div className="flex flex-col items-center mb-3 text-center">
        <div className="relative w-14 h-14 mb-2">
          <img
            src={token.image}
            alt={token.symbol}
            className="w-full h-full rounded-full border-2 border-border object-cover bg-black/50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
            }}
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorConfig.badge}`}>
            {place}
          </div>
        </div>

        <h3 className={`font-bold text-base ${isWinner ? "text-primary" : "text-white"}`}>
          {token.symbol}
        </h3>
        <p className={`font-mono font-bold text-xs mt-1 ${colorConfig.text}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground uppercase mt-1">
          {label}
        </p>
      </div>

      {/* Podium Block - Grows to fill remaining space */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
        className={`w-32 flex-grow rounded-t-2xl border-2 border-t-2 relative origin-bottom ${colorConfig.bg} ${colorConfig.border} ${colorConfig.glow}`}
      >
        <div className={`absolute bottom-2 left-0 right-0 text-center text-5xl font-black select-none opacity-10 ${colorConfig.text}`}>
          {place}
        </div>
      </motion.div>
    </motion.div>
  );
}
