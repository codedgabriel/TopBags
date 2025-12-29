import { motion } from "framer-motion";
import { TokenData } from "@/hooks/use-top-bags";
import { Copy, Check } from "lucide-react";
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
      <div className="flex items-end justify-center gap-6 md:gap-10 h-[550px] w-full">
        {/* 2nd Place - Left */}
        {second && (
          <PodiumCard
            token={second}
            place={2}
            value={formatValue(second)}
            label={label}
            color="silver"
            height={60}
            delay={0.2}
            type={type}
          />
        )}

        {/* 1st Place - Center (Tallest) */}
        {first && (
          <PodiumCard
            token={first}
            place={1}
            value={formatValue(first)}
            label={label}
            color="gold"
            height={100}
            delay={0}
            isWinner
            type={type}
          />
        )}

        {/* 3rd Place - Right */}
        {third && (
          <PodiumCard
            token={third}
            place={3}
            value={formatValue(third)}
            label={label}
            color="bronze"
            height={30}
            delay={0.4}
            type={type}
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
  type,
}: {
  token: TokenData;
  place: number;
  value: string;
  label: string;
  color: "gold" | "silver" | "bronze";
  height: number;
  delay: number;
  isWinner?: boolean;
  type: "marketCap" | "earnings";
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const colorConfig = {
    gold: {
      bg: "bg-gradient-to-b from-yellow-500/20 to-yellow-500/10",
      border: "border-yellow-500/50",
      text: "text-yellow-400",
      badge: "bg-yellow-500 text-black",
      glow: "shadow-[0_0_30px_rgba(234,179,8,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(234,179,8,0.6)]",
    },
    silver: {
      bg: "bg-gradient-to-b from-gray-400/20 to-gray-400/10",
      border: "border-gray-400/50",
      text: "text-gray-300",
      badge: "bg-gray-400 text-black",
      glow: "shadow-[0_0_30px_rgba(156,163,175,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(156,163,175,0.6)]",
    },
    bronze: {
      bg: "bg-gradient-to-b from-orange-700/20 to-orange-700/10",
      border: "border-orange-700/50",
      text: "text-orange-500",
      badge: "bg-orange-700 text-white",
      glow: "shadow-[0_0_30px_rgba(194,65,12,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(194,65,12,0.6)]",
    },
  }[color];

  const handleCopy = () => {
    navigator.clipboard.writeText(token.mint).then(() => {
      setCopied(true);
      toast({
        title: "Address Copied!",
        description: `${token.symbol} contract address copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center h-full cursor-pointer"
      onClick={handleCopy}
    >
      {/* Token Info */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        className="flex flex-col items-center mb-4 cursor-pointer"
      >
        <div className="relative w-16 h-16 mb-3">
          <img
            src={token.image}
            alt={token.symbol}
            className="w-full h-full rounded-full border-2 border-border object-cover bg-black/50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
            }}
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colorConfig.badge}`}>
            {place}
          </div>
        </div>

        <h3 className={`font-bold text-lg ${isWinner ? "text-primary" : "text-white"}`}>
          {token.symbol}
        </h3>
        <p className={`font-mono font-bold text-sm mt-1 ${colorConfig.text}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground uppercase mt-2 tracking-wide flex items-center gap-1">
          {label}
          {type === "earnings" && (
            <motion.div
              animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {copied ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3 text-primary opacity-50" />
              )}
            </motion.div>
          )}
          {type === "marketCap" && (
            <Copy className="w-3 h-3 text-primary opacity-50" />
          )}
        </p>
      </motion.div>

      {/* Podium Base */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ delay: delay + 0.1, duration: 0.8, ease: "easeOut" }}
        className={`w-full rounded-t-2xl border-t-2 border-l border-r cursor-pointer transition-all duration-300 ${colorConfig.bg} ${colorConfig.border} ${colorConfig.glow} hover:${colorConfig.hoverGlow}`}
      >
        {/* Rank number inside podium */}
        <div className={`absolute bottom-0 w-full text-center text-5xl font-black select-none pb-2 opacity-10 ${colorConfig.text}`}>
          {place}
        </div>
      </motion.div>
    </motion.div>
  );
}
