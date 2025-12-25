import { TokenData } from "@/hooks/use-top-bags";
import { CardNeon } from "./ui/card-neon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LeaderboardListProps {
  tokens: TokenData[];
  type: "marketCap" | "earnings";
}

export function LeaderboardList({ tokens, type }: LeaderboardListProps) {
  // Only show ranks 4-10 (or whatever remains)
  const remainingTokens = tokens.slice(3, 10); 

  const formatValue = (token: TokenData) => {
    if (type === "marketCap") {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(token.marketCap);
    } else {
      return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(token.totalEarnings)}`;
    }
  };

  const label = type === "marketCap" ? "Est. MC" : "Claimed";

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto">
      {remainingTokens.map((token, index) => {
        const rank = index + 4;
        return (
          <motion.div
            key={token.mint}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            <CardNeon className="flex items-center justify-between py-3 px-4 md:px-6 bg-card/50 hover:bg-card/80">
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground font-mono font-bold w-6 text-right">
                  {rank}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black border border-border overflow-hidden">
                     <img 
                       src={token.image} 
                       alt={token.symbol}
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                       }}
                     />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{token.name}</div>
                    <div className="text-xs text-primary font-mono">{token.symbol}</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-foreground">{formatValue(token)}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
              </div>
            </CardNeon>
          </motion.div>
        );
      })}
      
      {remainingTokens.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No additional data available.
        </div>
      )}
    </div>
  );
}
