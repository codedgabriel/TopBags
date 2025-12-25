import { useTopBags } from "@/hooks/use-top-bags";
import { Podium } from "@/components/podium";
import { LeaderboardList } from "@/components/leaderboard-list";
import { Loader2, Terminal, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: tokens = [], isLoading, isError, refetch, isRefetching } = useTopBags();
  const [activeTab, setActiveTab] = useState<"marketCap" | "earnings">("marketCap");

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
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="text-primary w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tighter">
              TOP<span className="text-primary">BAGS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
             <div className="hidden md:flex items-center gap-2 text-muted-foreground">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               Live Data
             </div>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => refetch()}
               disabled={isRefetching || isLoading}
               className="border-primary/20 hover:border-primary text-primary hover:bg-primary/10"
             >
               <RefreshCw className={`w-3 h-3 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
               {isRefetching ? "SYNCING..." : "REFRESH"}
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight">
             Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 text-neon">Leaderboard</span>
          </h2>
          <p className="text-muted-foreground">
            Real-time tracking of the Bags App ecosystem. Ranked by market capitalization and confirmed earnings.
          </p>
        </div>

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
            <div className="text-muted-foreground font-mono animate-pulse">ESTABLISHING UPLINK...</div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[300px] border border-destructive/30 bg-destructive/5 rounded-xl p-8 max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-destructive mb-2">Connection Failure</h3>
            <p className="text-center text-muted-foreground mb-6">
              Unable to retrieve ecosystem metrics. This might be due to an API rate limit or connectivity issue.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              Retry Connection
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
              <Podium top3={top3} type={activeTab} />
              
              <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-grow" />
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Extended Rankings</span>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-grow" />
              </div>

              <LeaderboardList tokens={sortedTokens} type={activeTab} />
            </motion.div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 mt-12 bg-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            TopBags © {new Date().getFullYear()}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            Created by 
            <a 
              href="https://x.com/dgcoinz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline hover:shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all"
            >
              dgcoinz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
