import { TokenData } from "@/hooks/use-top-bags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TokenDetailModalProps {
  token: TokenData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TokenDetails {
  mint: string;
  name: string;
  symbol: string;
  marketCap: number;
  priceUsd: number;
  totalEarnings: number;
  image?: string;
  dexscreenerUrl?: string;
  solanaScanUrl?: string;
  bagsUrl?: string;
  description?: string;
  volume24h?: number;
  liquidity?: number;
  holders?: number;
  trades24h?: number;
}

export function TokenDetailModal({
  token,
  isOpen,
  onClose,
}: TokenDetailModalProps) {
  const { toast } = useToast();
  const [details, setDetails] = useState<TokenDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && isOpen) {
      setIsLoading(true);
      setDetails({
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        marketCap: token.marketCap,
        priceUsd: token.priceUsd,
        totalEarnings: token.totalEarnings,
        image: token.image,
        dexscreenerUrl: `https://dexscreener.com/solana/${token.mint}`,
        solanaScanUrl: `https://solscan.io/token/${token.mint}`,
        bagsUrl: `https://bags.fm/token/${token.mint}`,
      });
      setIsLoading(false);
    }
  }, [token, isOpen]);

  const handleCopyMint = () => {
    if (token) {
      navigator.clipboard.writeText(token.mint).then(() => {
        toast({
          title: "Copied!",
          description: "Contract address copied to clipboard",
        });
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {details?.image && (
              <img
                src={details.image}
                alt={details.symbol}
                className="w-12 h-12 rounded-full border border-border object-cover bg-black/50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${details.symbol}&background=random`;
                }}
              />
            )}
            <div>
              <DialogTitle className="text-2xl">
                {details?.name || "Token"} ({details?.symbol})
              </DialogTitle>
              <DialogDescription className="text-xs font-mono mt-2">
                {details?.mint}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Price and Market Cap */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
                <div className="text-muted-foreground text-sm font-mono mb-2">
                  Price
                </div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(details.priceUsd)}
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
                <div className="text-muted-foreground text-sm font-mono mb-2">
                  Market Cap
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatLargeNumber(details.marketCap)}
                </div>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
              <div className="text-muted-foreground text-sm font-mono mb-2">
                Total Fees Claimed
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(details.totalEarnings)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lifetime fees earned by this token on the Bags ecosystem
              </p>
            </div>

            {/* Contract Address */}
            <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
              <div className="text-muted-foreground text-sm font-mono mb-2">
                Contract Address
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono flex-1 break-all">
                  {details.mint}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyMint}
                  data-testid="button-copy-mint"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground mb-3">
                Explorer Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/50"
                >
                  <a
                    href={details.dexscreenerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    DexScreener
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/50"
                >
                  <a
                    href={details.solanaScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Solscan
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/50"
                >
                  <a
                    href={details.bagsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Bags.fm
                  </a>
                </Button>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-xs text-primary font-mono">
                This token is part of the Bags ecosystem. The fees shown above
                represent lifetime earnings from trading activity through the
                Bags protocol.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
