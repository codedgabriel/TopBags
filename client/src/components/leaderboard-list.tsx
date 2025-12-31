import { TokenData } from "@/hooks/use-top-bags";
import { TokenRow } from "./token-row";

interface LeaderboardListProps {
  tokens: TokenData[];
  type: "marketCap" | "earnings";
  onTokenClick?: (token: TokenData) => void;
}

export function LeaderboardList({ tokens, type, onTokenClick }: LeaderboardListProps) {
  // Only show ranks 4-10 (or whatever remains)
  const remainingTokens = tokens.slice(3, 10);

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto">
      {remainingTokens.map((token, index) => (
        <TokenRow
          key={token.mint}
          token={token}
          rank={index + 4}
          index={index}
          type={type}
          onTokenClick={onTokenClick}
        />
      ))}

      {remainingTokens.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No additional data available.
        </div>
      )}
    </div>
  );
}
