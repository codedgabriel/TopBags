import { useQuery } from "@tanstack/react-query";
import { BAGS_TOKENS, BAGS_API_KEY } from "@/lib/constants";
import { z } from "zod";

// --- Schema Definitions for Safety ---
// These match the provided types in the prompt

const DexScreenerResponseSchema = z.object({
  schemaVersion: z.string().optional(),
  pairs: z.array(z.object({
    chainId: z.string(),
    dexId: z.string(),
    url: z.string(),
    pairAddress: z.string(),
    baseToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    quoteToken: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
    }).optional(),
    priceNative: z.string().optional(),
    priceUsd: z.string().optional(),
    txns: z.object({
      m5: z.object({ buys: z.number().optional(), sells: z.number().optional() }).optional(),
      h1: z.object({ buys: z.number().optional(), sells: z.number().optional() }).optional(),
      h6: z.object({ buys: z.number().optional(), sells: z.number().optional() }).optional(),
      h24: z.object({ buys: z.number().optional(), sells: z.number().optional() }).optional(),
    }).optional(),
    volume: z.object({
      h24: z.number().optional(),
      h6: z.number().optional(),
      h1: z.number().optional(),
      m5: z.number().optional(),
    }).optional(),
    priceChange: z.object({
      m5: z.number().optional(),
      h1: z.number().optional(),
      h6: z.number().optional(),
      h24: z.number().optional(),
    }).optional(),
    liquidity: z.object({
      usd: z.number().optional(),
      base: z.number().optional(),
      quote: z.number().optional(),
    }).optional(),
    fdv: z.number().optional(),
    marketCap: z.number().optional(),
  })).optional()
});

const BagsClaimStatsSchema = z.object({
  totalClaimed: z.number().optional(),
  totalClaimedUsd: z.number().optional(),
});

// --- Types ---

export interface TokenData {
  // Basic Info
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  
  // Price & Market Data (DexScreener)
  priceUsd: number;
  priceNative?: string;
  marketCap: number;
  fdv?: number;
  
  // Trading Activity (DexScreener)
  volume24h?: number;
  volume6h?: number;
  volume1h?: number;
  volume5m?: number;
  
  // Transactions (DexScreener)
  txns24h?: { buys: number; sells: number };
  txns1h?: { buys: number; sells: number };
  txns6h?: { buys: number; sells: number };
  txns5m?: { buys: number; sells: number };
  
  // Price Changes (DexScreener)
  priceChange24h?: number;
  priceChange1h?: number;
  priceChange6h?: number;
  priceChange5m?: number;
  
  // Liquidity (DexScreener)
  liquidityUsd?: number;
  liquidityBase?: number;
  liquidityQuote?: number;
  
  // Fees (Bags SDK)
  totalEarnings: number;
  feesSOL?: number;
  feesLamports?: number;
  
  // Links
  dexId?: string;
  pairAddress?: string;
  dexscreenerUrl?: string;
  
  // Status
  loaded: boolean;
}

// --- Fetch Functions ---

// 1. Fetch Market Cap from DexScreener
async function fetchTokenMarketData(mint: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
    const data = await res.json();
    const parsed = DexScreenerResponseSchema.safeParse(data);
    
    if (!parsed.success || !parsed.data.pairs || parsed.data.pairs.length === 0) {
      return null;
    }

    // DexScreener returns multiple pairs. We usually want the most liquid one, 
    // or just the first one as a proxy.
    const pair = parsed.data.pairs[0];
    
    return {
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      marketCap: pair.fdv || pair.marketCap || 0,
      fdv: pair.fdv,
      priceUsd: parseFloat(pair.priceUsd || "0"),
      priceNative: pair.priceNative,
      image: `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`,
      
      // Volume data
      volume24h: pair.volume?.h24,
      volume6h: pair.volume?.h6,
      volume1h: pair.volume?.h1,
      volume5m: pair.volume?.m5,
      
      // Transaction data
      txns24h: pair.txns?.h24 ? { buys: pair.txns.h24.buys || 0, sells: pair.txns.h24.sells || 0 } : undefined,
      txns6h: pair.txns?.h6 ? { buys: pair.txns.h6.buys || 0, sells: pair.txns.h6.sells || 0 } : undefined,
      txns1h: pair.txns?.h1 ? { buys: pair.txns.h1.buys || 0, sells: pair.txns.h1.sells || 0 } : undefined,
      txns5m: pair.txns?.m5 ? { buys: pair.txns.m5.buys || 0, sells: pair.txns.m5.sells || 0 } : undefined,
      
      // Price change data
      priceChange24h: pair.priceChange?.h24,
      priceChange6h: pair.priceChange?.h6,
      priceChange1h: pair.priceChange?.h1,
      priceChange5m: pair.priceChange?.m5,
      
      // Liquidity data
      liquidityUsd: pair.liquidity?.usd,
      liquidityBase: pair.liquidity?.base,
      liquidityQuote: pair.liquidity?.quote,
      
      // Links
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      dexscreenerUrl: pair.url,
    };
  } catch (e) {
    console.error(`Failed to fetch market data for ${mint}`, e);
    return null;
  }
}

// 2. Fetch Earnings from Bags SDK via Backend
async function fetchTokenEarningsData(mint: string) {
  try {
    const res = await fetch(`/api/token-fees/${mint}`);
    
    if (!res.ok) {
      console.warn(`Failed to fetch fees for ${mint}: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    
    // Return fees in USD (or use SOL value)
    return {
      totalClaimed: data.feesSOL || 0,
      totalClaimedUsd: data.feesUSD || 0,
      feesSOL: data.feesSOL || 0,
      feesLamports: data.feesLamports || 0,
    };
  } catch (e) {
    console.error(`Failed to fetch earnings data for ${mint}:`, e);
    return null;
  }
}

// --- Combined Hook ---

export function useTopBags() {
  return useQuery({
    queryKey: ['top-bags-data'],
    queryFn: async () => {
      // Create promises for all tokens with sequential delays to avoid rate limiting
      const promises = BAGS_TOKENS.map(async (mint, index) => {
        // Add a small delay based on index to spread out requests
        await new Promise(resolve => setTimeout(resolve, index * 50));
        
        // Fetch both data sources in parallel for this token
        const [marketData, earningsData] = await Promise.all([
          fetchTokenMarketData(mint),
          fetchTokenEarningsData(mint)
        ]);

        return {
          mint,
          name: marketData?.name || "Unknown",
          symbol: marketData?.symbol || "UNK",
          marketCap: marketData?.marketCap || 0,
          fdv: marketData?.fdv,
          priceUsd: marketData?.priceUsd || 0,
          priceNative: marketData?.priceNative,
          image: marketData?.image,
          
          // Volume
          volume24h: marketData?.volume24h,
          volume6h: marketData?.volume6h,
          volume1h: marketData?.volume1h,
          volume5m: marketData?.volume5m,
          
          // Transactions
          txns24h: marketData?.txns24h,
          txns6h: marketData?.txns6h,
          txns1h: marketData?.txns1h,
          txns5m: marketData?.txns5m,
          
          // Price Changes
          priceChange24h: marketData?.priceChange24h,
          priceChange1h: marketData?.priceChange1h,
          priceChange6h: marketData?.priceChange6h,
          priceChange5m: marketData?.priceChange5m,
          
          // Liquidity
          liquidityUsd: marketData?.liquidityUsd,
          liquidityBase: marketData?.liquidityBase,
          liquidityQuote: marketData?.liquidityQuote,
          
          // Use totalClaimedUsd if available, otherwise totalClaimed
          totalEarnings: earningsData?.totalClaimedUsd || earningsData?.totalClaimed || 0,
          feesSOL: earningsData?.feesSOL,
          feesLamports: earningsData?.feesLamports,
          
          // Links
          dexId: marketData?.dexId,
          pairAddress: marketData?.pairAddress,
          dexscreenerUrl: marketData?.dexscreenerUrl,
          
          loaded: !!marketData // Consider loaded if we got market data at least
        } as TokenData;
      });

      // Wait for all to settle
      const results = await Promise.allSettled(promises);
      
      // Filter successful fetches
      const tokens = results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter((t): t is TokenData => t !== null && t.loaded);

      // Debug logging for each token
      tokens.forEach(token => {
        console.log(`${token.symbol} (${token.mint.slice(0, 8)}...): $${token.totalEarnings.toFixed(2)}`);
      });
      
      console.log('Final tokens data:', tokens);
      return tokens;
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 0, // No cache - always fresh
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
