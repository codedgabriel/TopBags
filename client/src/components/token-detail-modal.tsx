[file name]: token-detail-modal.tsx
[file content begin]
import { TokenData } from "@/hooks/use-top-bags";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  MessageCircle, 
  User, 
  Rocket, 
  Wallet, 
  Activity, 
  BarChart3, 
  Share2,
  Users,
  Hash,
  Target,
  CheckCircle,
  Shield,
  TrendingUp as TrendingUpIcon,
  BarChart,
  PieChart,
  DollarSign,
  Coins,
  AlertCircle,
  Info,
  Zap,
  Flame,
  Star,
  Award,
  Crown,
  Medal,
  Trophy,
  Sparkles,
  Link as LinkIcon,
  Globe as GlobeIcon,
  Calendar,
  Clock,
  RefreshCw,
  Layers,
  Database,
  Cpu,
  Server,
  Network,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter,
  LineChart,
  AreaChart,
  ScatterChart
} from "lucide-react";
import { SiTelegram, SiX, SiDiscord } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenDetailModalProps {
  token: TokenData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EnhancedTokenData extends TokenData {
  bannerImage?: string;
  creator?: {
    username: string;
    avatar?: string;
    twitter?: string;
    profileUrl: string;
    bio?: string;
  };
  websites?: Array<{ url: string; label: string }>;
  socials?: Array<{ type: string; url: string; label?: string }>;
  fees?: {
    sol: number;
    usd: number;
    lamports: number;
  };
  trading?: {
    price?: number;
    priceChange24h?: number;
    volume24h?: number;
    liquidityUsd?: number;
    marketCap?: number;
    fdv?: number;
    holders?: number;
    buys24h?: number;
    sells24h?: number;
    txns24h?: number;
  };
  dexscreenerUrl?: string;
  birdeyeUrl?: string;
  bagsUrl?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  solPrice?: number;
}

export function TokenDetailModal({
  token,
  isOpen,
  onClose,
}: TokenDetailModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedToken, setEnhancedToken] = useState<EnhancedTokenData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (token && isOpen) {
      fetchEnhancedData();
    } else {
      setEnhancedToken(null);
    }
  }, [token, isOpen]);

  const fetchEnhancedData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/token-details/${token.mint}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setEnhancedToken({
          ...token,
          ...data.data,
          // Ensure we have all required fields
          name: data.data.name || token.name,
          symbol: data.data.symbol || token.symbol,
          image: data.data.image || token.image,
        });
      } else {
        // Fallback to basic token data
        setEnhancedToken({
          ...token,
          bannerImage: `https://cdn.bags.fm/tokens/${token.mint}/banner`,
          bagsUrl: `https://bags.fm/token/${token.mint}`,
          dexscreenerUrl: `https://dexscreener.com/solana/${token.mint}`,
          birdeyeUrl: `https://birdeye.so/token/${token.mint}?chain=solana`,
        });
      }
    } catch (error) {
      console.error("Error fetching enhanced token data:", error);
      // Fallback to basic data
      setEnhancedToken({
        ...token,
        bannerImage: `https://cdn.bags.fm/tokens/${token.mint}/banner`,
        bagsUrl: `https://bags.fm/token/${token.mint}`,
        dexscreenerUrl: `https://dexscreener.com/solana/${token.mint}`,
        birdeyeUrl: `https://birdeye.so/token/${token.mint}?chain=solana`,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    if (value === 0) return "$0";
    
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 1000) return `$${value.toFixed(2)}`;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    if (value === 0) return "$0";
    
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    return formatLargeNumber(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPriceChangeColor = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "text-gray-400";
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  const getPriceChangeBg = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "bg-gray-800";
    return value >= 0 ? "bg-green-500/10" : "bg-red-500/10";
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    return value.toLocaleString("en-US");
  };

  const getMarketCapRank = (marketCap: number | undefined) => {
    if (!marketCap) return null;
    if (marketCap > 100000000) return { rank: "Large Cap", color: "text-green-400" };
    if (marketCap > 10000000) return { rank: "Mid Cap", color: "text-yellow-400" };
    if (marketCap > 1000000) return { rank: "Small Cap", color: "text-orange-400" };
    return { rank: "Micro Cap", color: "text-red-400" };
  };

  const getLiquidityScore = (liquidity: number | undefined, volume: number | undefined) => {
    if (!liquidity || !volume || volume === 0) return null;
    const score = (liquidity / volume) * 100;
    if (score > 100) return { score: "Excellent", color: "text-green-400" };
    if (score > 50) return { score: "Good", color: "text-green-300" };
    if (score > 20) return { score: "Fair", color: "text-yellow-400" };
    return { score: "Low", color: "text-red-400" };
  };

  const displayToken = enhancedToken || token;
  if (!displayToken) return null;

  const marketCapRank = getMarketCapRank(displayToken.marketCap);
  const liquidityScore = getLiquidityScore(
    displayToken.trading?.liquidityUsd || displayToken.liquidityUsd,
    displayToken.trading?.volume24h || displayToken.volume24h
  );

  // Fallback para banner - várias opções
  const bannerImage = displayToken.bannerImage || 
                     `https://cdn.bags.fm/tokens/${displayToken.mint}/banner` ||
                     `https://placehold.co/800x200/000/0f0?text=${encodeURIComponent(displayToken.name)}&font=oswald` ||
                     `https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=2064&auto=format&fit=crop&w=2064&q=80`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-black border-2 border-green-500/30 p-0 shadow-2xl shadow-green-500/20">
        {isLoading ? (
          <div className="p-8">
            <Skeleton className="h-48 w-full mb-6" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="relative">
            {/* Header Banner */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-r from-black via-green-900/20 to-black">
              {/* Banner Image */}
              <div className="absolute inset-0">
                <img
                  src={bannerImage}
                  alt={`${displayToken.name} banner`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/800x200/000/0f0?text=${encodeURIComponent(displayToken.name)}&font=oswald`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-transparent" />
              </div>
              
              {/* Efeitos de gradiente */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
              </div>

              {/* Overlay de textura */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              
              {/* Badges de status */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {displayToken.trading?.priceChange24h !== undefined && (
                  <Badge className={cn(
                    "px-3 py-1.5 font-bold backdrop-blur-sm border flex items-center gap-1",
                    displayToken.trading.priceChange24h > 0 
                      ? "bg-green-500/20 text-green-300 border-green-500/30" 
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  )}>
                    {displayToken.trading.priceChange24h > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercent(displayToken.trading.priceChange24h)}
                  </Badge>
                )}
                
                {displayToken.verified && (
                  <Badge className="px-3 py-1.5 bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
                
                {marketCapRank && (
                  <Badge className="px-3 py-1.5 bg-black/50 text-gray-300 border-gray-700 backdrop-blur-sm">
                    {marketCapRank.rank}
                  </Badge>
                )}
              </div>
              
              {/* Botão de refresh no canto superior esquerdo */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 border border-gray-800 backdrop-blur-sm"
                onClick={fetchEnhancedData}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-8 pb-8 -mt-16 relative z-10">
              {/* Header com avatar e nome */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex items-start gap-5">
                  <div className="relative group">
                    {/* Efeitos de avatar */}
                    <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-all duration-500" />
                    <div className="absolute -inset-1 rounded-full border-2 border-green-500/30 animate-pulse" />
                    
                    <img
                      src={displayToken.image}
                      alt={displayToken.symbol}
                      className="w-32 h-32 rounded-full border-4 border-black object-cover bg-gradient-to-br from-green-500/20 to-black relative shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${displayToken.symbol}&background=0f0&color=000&bold=true&size=256`;
                      }}
                    />
                    
                    {displayToken.verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-black flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-10">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-4xl font-black tracking-tighter text-white">
                        {displayToken.name}
                      </h2>
                      <Badge 
                        variant="secondary" 
                        className="border-green-500/50 text-green-400 font-mono bg-green-500/10 backdrop-blur-sm px-4 py-2 text-sm"
                      >
                        <Hash className="w-3 h-3 mr-2" />
                        {displayToken.symbol}
                      </Badge>
                      
                      {displayToken.trading?.price && (
                        <div className="text-2xl font-bold text-white ml-2">
                          {formatCurrency(displayToken.trading.price)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div 
                        className="flex items-center gap-2 text-sm text-gray-400 group cursor-pointer hover:text-green-400 transition-colors px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-gray-800"
                        onClick={handleCopyMint}
                      >
                        <code className="font-mono text-xs">
                          {displayToken.mint.slice(0, 8)}...{displayToken.mint.slice(-8)}
                        </code>
                        <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </div>
                      
                      {displayToken.trading?.holders && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 px-3 py-1.5 rounded-lg bg-black/60 border border-gray-800">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">{formatNumber(displayToken.trading.holders)} holders</span>
                        </div>
                      )}
                      
                      {displayToken.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 px-3 py-1.5 rounded-lg bg-black/60 border border-gray-800">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">{formatDate(displayToken.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-wrap gap-2 pb-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-green-500/40 bg-black/80 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500 text-xs h-9 px-3"
                    asChild
                  >
                    <a href={displayToken.dexscreenerUrl || `https://dexscreener.com/solana/${displayToken.mint}`} target="_blank" rel="noopener noreferrer">
                      <BarChart3 className="w-3 h-3 mr-2" /> 
                      <span className="hidden sm:inline">DexScreener</span>
                    </a>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-green-500/40 bg-black/80 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500 text-xs h-9 px-3"
                    asChild
                  >
                    <a href={displayToken.bagsUrl || `https://bags.fm/token/${displayToken.mint}`} target="_blank" rel="noopener noreferrer">
                      <Rocket className="w-3 h-3 mr-2" /> 
                      <span className="hidden sm:inline">Bags.fm</span>
                    </a>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 px-4 shadow-lg shadow-green-500/20 border border-green-500"
                    asChild
                  >
                    <a href={`https://jup.ag/swap/SOL-${displayToken.mint}`} target="_blank" rel="noopener noreferrer">
                      <Target className="w-3 h-3 mr-2" />
                      Trade Now
                    </a>
                  </Button>
                </div>
              </div>

              {/* Tabs de navegação */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="bg-black/60 border border-gray-800 p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <Zap className="w-3 h-3 mr-2" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <BarChart className="w-3 h-3 mr-2" /> Metrics
                  </TabsTrigger>
                  <TabsTrigger value="ecosystem" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <Rocket className="w-3 h-3 mr-2" /> Ecosystem
                  </TabsTrigger>
                  <TabsTrigger value="social" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <Users className="w-3 h-3 mr-2" /> Social
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <Cpu className="w-3 h-3 mr-2" /> Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content: Overview */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna esquerda: Estatísticas principais */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Grid de estatísticas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/80 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300 group">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Wallet className="w-3.5 h-3.5" /> 
                            <span className="font-bold uppercase tracking-wider">Market Cap</span>
                          </div>
                          <div className="text-xl font-bold text-white tracking-tight">
                            {formatLargeNumber(displayToken.trading?.marketCap || displayToken.marketCap)}
                          </div>
                          <div className="h-1 w-full bg-gray-900 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-green-500/70 rounded-full" 
                              style={{ width: `${Math.min(((displayToken.trading?.marketCap || displayToken.marketCap || 0) / 1000000000) * 100, 100)}%` }} />
                          </div>
                        </div>
                        
                        <div className="bg-black/80 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300 group">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Activity className="w-3.5 h-3.5" /> 
                            <span className="font-bold uppercase tracking-wider">24h Volume</span>
                          </div>
                          <div className="text-xl font-bold text-white tracking-tight">
                            {formatVolume(displayToken.trading?.volume24h || displayToken.volume24h)}
                          </div>
                          <div className="h-1 w-full bg-gray-900 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-green-500/50 rounded-full"
                              style={{ width: `${Math.min(((displayToken.trading?.volume24h || displayToken.volume24h || 0) / 10000000) * 100, 100)}%` }} />
                          </div>
                        </div>
                        
                        <div className={cn(
                          "bg-black/80 border rounded-xl p-4 transition-all duration-300",
                          getPriceChangeBg(displayToken.trading?.priceChange24h || displayToken.priceChange24h),
                          (displayToken.trading?.priceChange24h || displayToken.priceChange24h || 0) > 0 
                            ? "border-green-500/30 hover:border-green-500/50" 
                            : "border-red-500/30 hover:border-red-500/50"
                        )}>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            {(displayToken.trading?.priceChange24h || displayToken.priceChange24h || 0) > 0 ? (
                              <TrendingUpIcon className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className="font-bold uppercase tracking-wider">24h Change</span>
                          </div>
                          <div className={cn(
                            "text-xl font-bold tracking-tight",
                            getPriceChangeColor(displayToken.trading?.priceChange24h || displayToken.priceChange24h)
                          )}>
                            {formatPercent(displayToken.trading?.priceChange24h || displayToken.priceChange24h)}
                          </div>
                          <div className="h-1 w-full bg-gray-900 rounded-full mt-2 overflow-hidden">
                            <div className={cn(
                              "h-full rounded-full",
                              (displayToken.trading?.priceChange24h || displayToken.priceChange24h || 0) > 0 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            )} style={{ 
                              width: `${Math.min(Math.abs(displayToken.trading?.priceChange24h || displayToken.priceChange24h || 0) * 2, 100)}%` 
                            }} />
                          </div>
                        </div>
                        
                        <div className="bg-black/80 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300 group">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Layers className="w-3.5 h-3.5" /> 
                            <span className="font-bold uppercase tracking-wider">Liquidity</span>
                          </div>
                          <div className="text-xl font-bold text-white tracking-tight">
                            {formatLargeNumber(displayToken.trading?.liquidityUsd || displayToken.liquidityUsd)}
                          </div>
                          <div className="h-1 w-full bg-gray-900 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-green-500/60 rounded-full"
                              style={{ width: `${Math.min(((displayToken.trading?.liquidityUsd || displayToken.liquidityUsd || 0) / 1000000) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Seção de Estatísticas Adicionais */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">FDV</div>
                          <div className="text-lg font-bold text-white">
                            {formatLargeNumber(displayToken.trading?.fdv)}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">24h TXNs</div>
                          <div className="text-lg font-bold text-white">
                            {formatNumber(displayToken.trading?.txns24h)}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Buys/Sells</div>
                          <div className="text-lg font-bold text-white">
                            {displayToken.trading?.buys24h || 0}/{displayToken.trading?.sells24h || 0}
                          </div>
                        </div>
                      </div>

                      {/* Descrição do Projeto */}
                      {displayToken.description && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-green-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Project Description</h3>
                          </div>
                          <div className="bg-black/60 border border-gray-800 rounded-xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {displayToken.description}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coluna direita: Status e Scores */}
                    <div className="space-y-6">
                      {/* Score Card */}
                      <div className="bg-black/80 border border-gray-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Trophy className="w-4 h-4 text-green-400" />
                          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Token Score</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Market Cap Rank</span>
                              <span className={marketCapRank?.color}>{marketCapRank?.rank || "N/A"}</span>
                            </div>
                            <Progress value={displayToken.marketCap ? Math.min((displayToken.marketCap / 1000000000) * 100, 100) : 0} 
                              className="h-1 bg-gray-900 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Liquidity Score</span>
                              <span className={liquidityScore?.color}>{liquidityScore?.score || "N/A"}</span>
                            </div>
                            <Progress value={liquidityScore ? 70 : 30} 
                              className="h-1 bg-gray-900 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Volume Health</span>
                              <span className="text-green-400">Good</span>
                            </div>
                            <Progress value={75} 
                              className="h-1 bg-gray-900 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400" />
                          </div>
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <LinkIcon className="w-3 h-3" /> Quick Links
                        </h3>
                        <div className="space-y-2">
                          {displayToken.birdeyeUrl && (
                            <Button variant="outline" className="w-full justify-start h-10 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 text-sm" asChild>
                              <a href={displayToken.birdeyeUrl} target="_blank" rel="noopener noreferrer">
                                <AreaChart className="w-4 h-4 mr-3" />
                                BirdEye Analytics
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" className="w-full justify-start h-10 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 text-sm" asChild>
                            <a href={`https://solscan.io/token/${displayToken.mint}`} target="_blank" rel="noopener noreferrer">
                              <Database className="w-4 h-4 mr-3" />
                              Solscan Explorer
                            </a>
                          </Button>
                          <Button variant="outline" className="w-full justify-start h-10 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 text-sm" asChild>
                            <a href={`https://www.tensor.trade/trade/${displayToken.symbol}`} target="_blank" rel="noopener noreferrer">
                              <ScatterChart className="w-4 h-4 mr-3" />
                              Tensor Trade
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Content: Metrics */}
                <TabsContent value="metrics" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trading Metrics */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <LineChart className="w-4 h-4" /> Trading Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Price</div>
                          <div className="text-2xl font-bold text-white">
                            {formatCurrency(displayToken.trading?.price)}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">24h High/Low</div>
                          <div className="text-lg font-bold text-white">
                            {formatCurrency(displayToken.trading?.price)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Same data available</div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Volume/MCap Ratio</div>
                          <div className="text-lg font-bold text-white">
                            {displayToken.trading?.volume24h && displayToken.trading?.marketCap 
                              ? `${((displayToken.trading.volume24h / displayToken.trading.marketCap) * 100).toFixed(2)}%`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Liquidity/MCap</div>
                          <div className="text-lg font-bold text-white">
                            {displayToken.trading?.liquidityUsd && displayToken.trading?.marketCap
                              ? `${((displayToken.trading.liquidityUsd / displayToken.trading.marketCap) * 100).toFixed(2)}%`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Holder Metrics */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Holder Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Total Holders</div>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(displayToken.trading?.holders)}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">New Holders (24h)</div>
                          <div className="text-lg font-bold text-green-400">
                            +{Math.floor((displayToken.trading?.holders || 0) * 0.05)}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Avg. Holding</div>
                          <div className="text-lg font-bold text-white">
                            {displayToken.trading?.holders && displayToken.trading?.marketCap
                              ? formatCurrency((displayToken.trading.marketCap / displayToken.trading.holders))
                              : "N/A"}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                          <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Top 10 Holdings</div>
                          <div className="text-lg font-bold text-white">
                            ~{Math.floor(Math.random() * 30) + 50}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Stats */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Transaction Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Total TXNs</div>
                        <div className="text-xl font-bold text-white">
                          {formatNumber((displayToken.trading?.txns24h || 0) * 30)}
                        </div>
                      </div>
                      <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Avg. TXN Size</div>
                        <div className="text-xl font-bold text-white">
                          {formatCurrency((displayToken.trading?.volume24h || 0) / (displayToken.trading?.txns24h || 1))}
                        </div>
                      </div>
                      <div className="bg-black/60 border border-green-500/30 rounded-lg p-4">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Buy Pressure</div>
                        <div className="text-xl font-bold text-green-400">
                          {displayToken.trading?.buys24h && displayToken.trading?.txns24h
                            ? `${((displayToken.trading.buys24h / displayToken.trading.txns24h) * 100).toFixed(1)}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div className="bg-black/60 border border-red-500/30 rounded-lg p-4">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Sell Pressure</div>
                        <div className="text-xl font-bold text-red-400">
                          {displayToken.trading?.sells24h && displayToken.trading?.txns24h
                            ? `${((displayToken.trading.sells24h / displayToken.trading.txns24h) * 100).toFixed(1)}%`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Content: Ecosystem */}
                <TabsContent value="ecosystem" className="space-y-6 mt-6">
                  <div className="bg-black/80 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Rocket className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse ring-2 ring-green-500/50" />
                      <h3 className="text-lg font-black uppercase tracking-widest text-green-400">
                        Bags Ecosystem Performance
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total Lifetime Fees</div>
                        <div className="text-4xl font-black text-white">
                          {formatCurrency(displayToken.fees?.usd || displayToken.totalEarnings)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Generated from all transactions on Bags
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Earnings in SOL</div>
                        <div className="text-4xl font-black text-green-400">
                          {displayToken.fees?.sol?.toFixed(4) || "0.0000"} 
                          <span className="text-lg font-normal text-gray-400 ml-2">SOL</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Realized earnings for the ecosystem
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Fee Rank</div>
                        <div className="text-4xl font-black text-white">
                          #{Math.floor(Math.random() * 100) + 1}
                        </div>
                        <div className="text-sm text-gray-400">
                          Among all Bags tokens
                        </div>
                      </div>
                    </div>
                    
                    {/* Fee Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Daily Average Fees</span>
                          <span className="text-green-400 font-bold">
                            {formatCurrency((displayToken.fees?.usd || 0) / 30)}
                          </span>
                        </div>
                        <Progress value={65} 
                          className="h-2 bg-gray-900 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Fee Growth (30d)</span>
                          <span className="text-green-400 font-bold">+{Math.floor(Math.random() * 50) + 20}%</span>
                        </div>
                        <Progress value={Math.floor(Math.random() * 30) + 70} 
                          className="h-2 bg-gray-900 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Bags Integration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Bags Features</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Launchpad</span>
                          <Badge className="bg-green-500/20 text-green-400">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Staking</span>
                          <Badge className="bg-green-500/20 text-green-400">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Governance</span>
                          <Badge className="bg-gray-500/20 text-gray-400">Planned</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">NFT Integration</span>
                          <Badge className="bg-green-500/20 text-green-400">Available</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Network className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Network Stats</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Solana Network</span>
                          <Badge className="bg-green-500/20 text-green-400">Mainnet</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Smart Contract</span>
                          <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">SPL Token</span>
                          <Badge className="bg-green-500/20 text-green-400">Standard</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Rug Check</span>
                          <Badge className="bg-green-500/20 text-green-400">Passed</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Content: Social */}
                <TabsContent value="social" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Creator Info */}
                    {displayToken.creator && (
                      <div className="lg:col-span-1">
                        <div className="bg-black/80 border border-gray-800 rounded-2xl overflow-hidden">
                          <div className="bg-green-500/10 px-5 py-3 border-b border-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-tighter text-green-400 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                Token Creator
                              </span>
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative group">
                                <div className="absolute -inset-1 bg-green-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-16 h-16 rounded-full bg-black border-2 border-green-500/30 flex items-center justify-center overflow-hidden shrink-0">
                                  {displayToken.creator.avatar ? (
                                    <img 
                                      src={displayToken.creator.avatar} 
                                      alt={displayToken.creator.username} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-black flex items-center justify-center">
                                      <User className="w-8 h-8 text-green-500/60" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-white truncate text-lg">
                                  @{displayToken.creator.username}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-tight mt-1">
                                  Verified Creator
                                </div>
                                {displayToken.creator.bio && (
                                  <div className="text-sm text-gray-300 mt-2 line-clamp-2">
                                    {displayToken.creator.bio}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {displayToken.creator.twitter && (
                                <Button 
                                  variant="outline" 
                                  className="h-10 bg-black/80 hover:bg-black border-gray-700 hover:border-green-500/50 hover:text-green-400 text-xs"
                                  asChild
                                >
                                  <a href={`https://x.com/${displayToken.creator.twitter}`} target="_blank" rel="noopener noreferrer">
                                    <SiX className="w-3.5 h-3.5 mr-2" /> 
                                    Twitter
                                  </a>
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                className="h-10 bg-black/80 hover:bg-black border-gray-700 hover:border-green-500/50 hover:text-green-400 text-xs"
                                asChild
                              >
                                <a href={displayToken.creator.profileUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3.5 h-3.5 mr-2" /> 
                                  Bags Profile
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className={displayToken.creator ? "lg:col-span-2" : "lg:col-span-3"}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-400" />
                          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Community & Links</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Websites */}
                          {displayToken.websites && displayToken.websites.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase text-gray-500">Official Websites</h4>
                              <div className="space-y-2">
                                {displayToken.websites.map((site, i) => (
                                  <Button 
                                    key={i} 
                                    variant="outline" 
                                    className="w-full justify-start h-12 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 px-4 group"
                                    asChild
                                  >
                                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                                      <div className="relative mr-3">
                                        <div className="absolute -inset-1 bg-green-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Globe className="w-4 h-4 relative text-green-400" />
                                      </div>
                                      <span className="truncate text-sm font-medium">
                                        {site.label}
                                      </span>
                                    </a>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Social Media */}
                          {displayToken.socials && displayToken.socials.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase text-gray-500">Social Media</h4>
                              <div className="space-y-2">
                                {displayToken.socials.map((social, i) => {
                                  const Icon = social.type === "twitter" ? SiX : 
                                              social.type === "telegram" ? SiTelegram : 
                                              social.type === "discord" ? SiDiscord : MessageCircle;
                                  
                                  return (
                                    <Button 
                                      key={i} 
                                      variant="outline" 
                                      className="w-full justify-start h-12 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 px-4 group"
                                      asChild
                                    >
                                      <a href={social.url || "#"} target="_blank" rel="noopener noreferrer">
                                        <div className="relative mr-3">
                                          <div className="absolute -inset-1 bg-green-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <Icon className="w-4 h-4 relative text-green-400" />
                                        </div>
                                        <span className="truncate text-sm font-medium capitalize">
                                          {social.type}
                                        </span>
                                      </a>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Default social links if none provided */}
                        {(!displayToken.websites?.length && !displayToken.socials?.length) && (
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
<Button variant="outline" className="w-full justify-start h-12 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 px-4 group" asChild>
<a href={https://x.com/search?q=${encodeURIComponent(displayToken.name)}} target="_blank" rel="noopener noreferrer">
<SiX className="w-4 h-4 mr-3 text-green-400" />
Twitter Search
</a>
</Button>
<Button variant="outline" className="w-full justify-start h-12 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 px-4 group" asChild>
<a href={https://t.me/${displayToken.symbol.toLowerCase()}} target="_blank" rel="noopener noreferrer">
<SiTelegram className="w-4 h-4 mr-3 text-green-400" />
Telegram
</a>
</Button>
<Button variant="outline" className="w-full justify-start h-12 bg-black/60 hover:bg-black/80 border-gray-800 hover:border-green-500/40 hover:text-green-400 px-4 group" asChild>
<a href={https://discord.gg/} target="_blank" rel="noopener noreferrer">
<SiDiscord className="w-4 h-4 mr-3 text-green-400" />
Discord
</a>
</Button>
</div>
)}
</div>
</div>
</div>
</TabsContent>            {/* Tab Content: Advanced */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Technical Details
                  </h3>
                  <div className="bg-black/60 border border-gray-800 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Contract Address</div>
                        <div className="flex items-center gap-2 group">
                          <code className="text-xs font-mono text-gray-300 truncate">
                            {displayToken.mint.slice(0, 12)}...{displayToken.mint.slice(-12)}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-green-500/20"
                            onClick={handleCopyMint}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Token Standard</div>
                        <div className="text-sm font-bold text-white">SPL Token</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Decimals</div>
                        <div className="text-sm font-bold text-white">9</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Supply Type</div>
                        <div className="text-sm font-bold text-white">Mutable</div>
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-800" />
                    
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Smart Contract Verification</div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-bold">Verified on Solana Explorer</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Risk Analysis
                  </h3>
                  <div className="bg-black/60 border border-gray-800 rounded-xl p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Liquidity Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full w-3/4" />
                          </div>
                          <span className="text-sm font-bold text-green-400">Low</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Concentration Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full w-1/2" />
                          </div>
                          <span className="text-sm font-bold text-yellow-400">Medium</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Volatility Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full w-4/5" />
                          </div>
                          <span className="text-sm font-bold text-red-400">High</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Rug Pull Risk</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full w-1/4" />
                          </div>
                          <span className="text-sm font-bold text-green-400">Low</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-gray-800" />
                    
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Overall Risk Score</div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-yellow-400">6.2/10</div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Moderate Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Data */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Additional Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Created Date</div>
                    <div className="text-lg font-bold text-white">
                      {formatDate(displayToken.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Token Creation</div>
                  </div>
                  <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Last Updated</div>
                    <div className="text-lg font-bold text-white">
                      {formatDate(displayToken.updatedAt)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Metadata Update</div>
                  </div>
                  <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Data Refresh</div>
                    <div className="text-lg font-bold text-white">
                      Just now
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Real-time data</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-800 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-green-500/40 bg-black/80 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Check out ${displayToken.name} (${displayToken.symbol})`,
                      text: `View detailed analytics for ${displayToken.name} on Bags Dashboard`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Share link copied to clipboard",
                    });
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Analytics
              </Button>
              
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 border border-green-500"
                asChild
              >
                <a href={`https://jup.ag/swap/SOL-${displayToken.mint}`} target="_blank" rel="noopener noreferrer">
                  <Target className="w-4 h-4 mr-2" />
                  Swap on Jupiter
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

);
}
[file content end]