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
    priceUsd: z.string().optional(),
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
  mint: string;
  name: string;
  symbol: string;
  marketCap: number;
  totalEarnings: number;
  priceUsd: number;
  image?: string;
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
      priceUsd: parseFloat(pair.priceUsd || "0"),
      image: `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`, // Best guess for image URL pattern or fallback
    };
  } catch (e) {
    console.error(`Failed to fetch market data for ${mint}`, e);
    return null;
  }
}

// 2. Fetch Earnings from Bags API
async function fetchTokenEarningsData(mint: string) {
  try {
    // Try multiple endpoint variations
    const endpoints = [
      `https://public-api-v2.bags.fm/api/v1/token-launch/claim-stats?tokenMint=${mint}`,
      `https://api.bags.fm/api/v1/token-launch/claim-stats?tokenMint=${mint}`,
    ];
    
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: {
            'x-api-key': BAGS_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.status === 500 || res.status === 503) {
          console.warn(`API error ${res.status} for ${mint} on ${url}`);
          continue;
        }
        
        const text = await res.text();
        let data;
        
        try {
          data = JSON.parse(text);
        } catch {
          console.warn(`Invalid JSON for ${mint}:`, text.substring(0, 100));
          continue;
        }
        
        // Handle both direct fields and wrapped response
        const totalClaimed = data.totalClaimed ?? data?.data?.totalClaimed ?? 0;
        const totalClaimedUsd = data.totalClaimedUsd ?? data?.data?.totalClaimedUsd ?? 0;
        
        if (typeof totalClaimed === 'number' || typeof totalClaimedUsd === 'number') {
          return {
            totalClaimed: typeof totalClaimed === 'number' ? totalClaimed : 0,
            totalClaimedUsd: typeof totalClaimedUsd === 'number' ? totalClaimedUsd : 0
          };
        }
      } catch (e) {
        // Try next endpoint
        continue;
      }
    }
    
    return null;
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
          priceUsd: marketData?.priceUsd || 0,
          image: marketData?.image,
          // Use totalClaimedUsd if available, otherwise totalClaimed
          totalEarnings: earningsData?.totalClaimedUsd || earningsData?.totalClaimed || 0,
          loaded: !!marketData // Consider loaded if we got market data at least
        } as TokenData;
      });

      // Wait for all to settle
      const results = await Promise.allSettled(promises);
      
      // Filter successful fetches
      const tokens = results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter((t): t is TokenData => t !== null && t.loaded);

      console.log('Final tokens data:', tokens);
      return tokens;
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 0, // No cache - always fresh
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
