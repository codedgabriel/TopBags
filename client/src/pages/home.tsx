import { useTopBags } from "@/hooks/use-top-bags";
import { Podium } from "@/components/podium";
import { LeaderboardList } from "@/components/leaderboard-list";
import {
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const {
    data: tokens = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTopBags();
  const [activeTab, setActiveTab] = useState<"marketCap" | "earnings">(
    "marketCap",
  );

  // Sort tokens based on active tab logic
  const sortedTokens = [...tokens].sort((a, b) => {
    if (activeTab === "marketCap") {
      return b.marketCap - a.marketCap;
    } else {
      return b.totalEarnings - a.totalEarnings;
    }
  });

  const top3 = sortedTokens.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="TopBags logo" className="w-6 h-6" />
            <h1 className="text-lg font-semibold">TopBags</h1>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Live
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 z-10 relative">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-secondary p-1 rounded-lg border border-border inline-flex">
            <button
              onClick={() => setActiveTab("marketCap")}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "marketCap"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "earnings"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Total Earnings
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <div className="text-muted-foreground font-mono animate-pulse">
              Establishing connection...
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[300px] border border-border bg-secondary rounded-lg p-8 max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
            <p className="text-center text-muted-foreground mb-6">
              Unable to retrieve ecosystem data. This might be due to network issues or API rate limits.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            <Podium top3={top3} type={activeTab} />

            <div className="my-8">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-6">
                All Tokens
              </div>
            </div>

            <LeaderboardList tokens={sortedTokens} type={activeTab} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 mt-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-foreground">TopBags</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time leaderboards for the Bags App ecosystem
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm text-foreground">Sources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://dexscreener.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    DexScreener
                  </a>
                </li>
                <li>
                  <a
                    href="https://bags.fm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Bags.fm
                  </a>
                </li>
                <li>
                  <a
                    href="https://solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Solana
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TopBags
            </div>
            <div className="text-sm text-muted-foreground">
              Built by
              <a
                href="https://x.com/dgcoinz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors ml-1 font-semibold"
              >
                @dgcoinz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
