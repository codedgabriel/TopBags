import { useTopBags, TokenData } from "@/hooks/use-top-bags";
import { Podium } from "@/components/podium";
import { LeaderboardList } from "@/components/leaderboard-list";
import { TokenDetailModal } from "@/components/token-detail-modal";
import {
  Loader2,
  Terminal,
  AlertTriangle,
  Github,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

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
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTokenClick = (token: TokenData) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono selection:bg-primary selection:text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-[0.03] z-0" />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="TopBags logo" className="w-6 h-6" />

            <h1 className="text-xl font-bold tracking-tighter">
              TOP<span className="text-primary">BAGS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Data
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-secondary/50 p-1 rounded-lg border border-border inline-flex">
            <button
              onClick={() => setActiveTab("marketCap")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                activeTab === "marketCap"
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                activeTab === "earnings"
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                  : "text-muted-foreground hover:text-white"
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
          <div className="flex flex-col items-center justify-center h-[300px] border border-primary/30 bg-primary/5 rounded-xl p-8 max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">
              Connection Failed
            </h3>
            <p className="text-center text-muted-foreground mb-6">
              Unable to retrieve ecosystem data. This might be due to network
              issues or API rate limits.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            <motion.div
              key={activeTab} // Forces re-render of animation when tab changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Podium top3={top3} type={activeTab} onTokenClick={handleTokenClick} />

              <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-grow" />
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  Extended Rankings
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-grow" />
              </div>

              <LeaderboardList tokens={sortedTokens} type={activeTab} onTokenClick={handleTokenClick} />
            </motion.div>
          </div>
        )}
      </main>

      <TokenDetailModal
        token={selectedToken}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <footer className="border-t border-primary/10 py-8 mt-12 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="text-primary w-5 h-5" />
                <h3 className="font-bold text-primary">TopBags</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time leaderboards for the Bags App ecosystem
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">
                Sources
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://dexscreener.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    DexScreener
                  </a>
                </li>
                <li>
                  <a
                    href="https://bags.fm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Bags.fm
                  </a>
                </li>
                <li>
                  <a
                    href="https://solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Solana
                  </a>
                </li>
              </ul>
            </div>
            
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TopBags • Powered by Bags SDK
            </div>
            <div className="text-sm text-muted-foreground">
              Built by
              <a
                href="https://x.com/dgcoinz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors ml-1 font-bold"
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
