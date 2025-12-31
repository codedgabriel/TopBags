import { TokenData } from "@/hooks/use-top-bags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TokenDetailModalProps {
  token: TokenData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenDetailModal({
  token,
  isOpen,
  onClose,
}: TokenDetailModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && isOpen) {
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

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return formatLargeNumber(value);
  };

  const formatTransactions = (txns: { buys: number; sells: number } | undefined) => {
    if (!txns) return "N/A";
    return `${txns.buys} buys / ${txns.sells} sells`;
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPriceChangeColor = (value: number | undefined) => {
    if (value === undefined) return "text-muted-foreground";
    return value >= 0 ? "text-primary" : "text-destructive";
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {token.image && (
              <img
                src={token.image}
                alt={token.symbol}
                className="w-12 h-12 rounded-full border border-border object-cover bg-black/50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                }}
              />
            )}
            <div>
              <DialogTitle className="text-2xl">
                {token.name} ({token.symbol})
              </DialogTitle>
              <DialogDescription className="text-xs font-mono mt-2">
                {token.mint}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : token ? (
          <div className="space-y-6">
            {/* Price and Market Data */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Price & Market</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded p-3 border border-border/50">
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    Price USD
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(token.priceUsd)}
                  </div>
                </div>

                <div className="bg-secondary/50 rounded p-3 border border-border/50">
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    Price Native
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {token.priceNative || "N/A"}
                  </div>
                </div>

                <div className="bg-secondary/50 rounded p-3 border border-border/50">
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    Market Cap
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {formatLargeNumber(token.marketCap)}
                  </div>
                </div>

                <div className="bg-secondary/50 rounded p-3 border border-border/50">
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    FDV
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {formatLargeNumber(token.fdv)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bags Earnings */}
            <div className="bg-secondary/50 rounded p-4 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-3">Bags Ecosystem Earnings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    Lifetime Fees (USD)
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(token.totalEarnings)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">
                    Lifetime Fees (SOL)
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {token.feesSOL !== undefined ? token.feesSOL.toFixed(4) : "N/A"} SOL
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total fees earned by this token on the Bags ecosystem
              </p>
            </div>

            {/* Volume Data */}
            {(token.volume24h || token.volume1h || token.volume6h || token.volume5m) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Trading Volume</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      24h Volume
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatVolume(token.volume24h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      6h Volume
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatVolume(token.volume6h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      1h Volume
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatVolume(token.volume1h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      5m Volume
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatVolume(token.volume5m)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Changes */}
            {(token.priceChange24h !== undefined || token.priceChange1h !== undefined || 
              token.priceChange6h !== undefined || token.priceChange5m !== undefined) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Price Changes</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-secondary/50 rounded p-3 border border-border/50 ${getPriceChangeColor(token.priceChange24h)}`}>
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      24h Change
                    </div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      {token.priceChange24h !== undefined && token.priceChange24h >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      {formatPercent(token.priceChange24h)}
                    </div>
                  </div>

                  <div className={`bg-secondary/50 rounded p-3 border border-border/50 ${getPriceChangeColor(token.priceChange6h)}`}>
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      6h Change
                    </div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      {token.priceChange6h !== undefined && token.priceChange6h >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      {formatPercent(token.priceChange6h)}
                    </div>
                  </div>

                  <div className={`bg-secondary/50 rounded p-3 border border-border/50 ${getPriceChangeColor(token.priceChange1h)}`}>
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      1h Change
                    </div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      {token.priceChange1h !== undefined && token.priceChange1h >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      {formatPercent(token.priceChange1h)}
                    </div>
                  </div>

                  <div className={`bg-secondary/50 rounded p-3 border border-border/50 ${getPriceChangeColor(token.priceChange5m)}`}>
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      5m Change
                    </div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      {token.priceChange5m !== undefined && token.priceChange5m >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      {formatPercent(token.priceChange5m)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions */}
            {(token.txns24h || token.txns1h || token.txns6h || token.txns5m) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Trading Activity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      24h Transactions
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {formatTransactions(token.txns24h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      6h Transactions
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {formatTransactions(token.txns6h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      1h Transactions
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {formatTransactions(token.txns1h)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      5m Transactions
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {formatTransactions(token.txns5m)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liquidity */}
            {(token.liquidityUsd !== undefined || token.liquidityBase !== undefined || 
              token.liquidityQuote !== undefined) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Liquidity</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      USD
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {formatLargeNumber(token.liquidityUsd)}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      Base
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {token.liquidityBase ? token.liquidityBase.toFixed(2) : "N/A"}
                    </div>
                  </div>

                  <div className="bg-secondary/50 rounded p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      Quote
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {token.liquidityQuote ? token.liquidityQuote.toFixed(2) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Address */}
            <div className="bg-secondary/50 rounded p-4 border border-border/50">
              <div className="text-muted-foreground text-sm font-mono mb-2">
                Contract Address
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono flex-1 break-all">
                  {token.mint}
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
                {token.dexscreenerUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary/50"
                  >
                    <a
                      href={token.dexscreenerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      DexScreener
                    </a>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/50"
                >
                  <a
                    href={`https://solscan.io/token/${token.mint}`}
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
                    href={`https://bags.fm/token/${token.mint}`}
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
            <div className="bg-primary/10 border border-primary/30 rounded p-4">
              <p className="text-xs text-primary font-mono">
                This token is part of the Bags ecosystem. All trading data is sourced from DexScreener and the Bags SDK. The fees shown represent lifetime earnings from trading activity through the Bags protocol.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
