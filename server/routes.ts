[file name]: routes.ts
[file content begin]
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BagsSDK } from "@bagsfm/bags-sdk";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const BAGS_API_KEY = process.env.BAGS_API_KEY || "bags_prod_jBZXtr2ODsKuBZ8lNBcfI_sveEztgtuRXNBJ44DUgQw";
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens";
const BIRDEYE_API = "https://public-api.birdeye.so/public";
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";

let sdk: BagsSDK | null = null;
let cachedSolPrice: number | null = null;
let lastSolPriceFetch: number = 0;

function getSDK() {
  if (!sdk) {
    try {
      const connection = new Connection(SOLANA_RPC_URL, "processed");
      sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
    } catch (e) {
      console.error("Failed to initialize BagsSDK:", e);
    }
  }
  return sdk;
}

async function getSolPrice(): Promise<number> {
  const now = Date.now();
  if (cachedSolPrice && (now - lastSolPriceFetch) < 60000) {
    return cachedSolPrice;
  }

  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const data = await response.json();
    const price = data.solana?.usd;
    
    if (price) {
      cachedSolPrice = price;
      lastSolPriceFetch = now;
      console.log(`[SOL Price] Updated to $${price}`);
      return price;
    }
  } catch (error) {
    console.error("Error fetching SOL price from CoinGecko:", error);
  }

  if (cachedSolPrice) {
    return cachedSolPrice;
  }

  return 200;
}

async function getDexScreenerData(mint: string) {
  try {
    const response = await fetch(`${DEXSCREENER_API}/${mint}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        priceUsd: pair.priceUsd,
        priceChange24h: pair.priceChange?.h24,
        volume24h: pair.volume?.h24,
        liquidityUsd: pair.liquidity?.usd,
        fdv: pair.fdv,
        pairAddress: pair.pairAddress,
        url: `https://dexscreener.com/solana/${pair.pairAddress}`,
        baseToken: {
          name: pair.baseToken?.name,
          symbol: pair.baseToken?.symbol,
          address: pair.baseToken?.address
        },
        quoteToken: pair.quoteToken,
        marketCap: pair.marketCap,
        txns24h: pair.txns?.h24,
        buys24h: pair.txns?.h24?.buys,
        sells24h: pair.txns?.h24?.sells
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching DexScreener data:", error);
    return null;
  }
}

async function getBirdeyeData(mint: string) {
  if (!BIRDEYE_API_KEY) return null;
  
  try {
    const [priceRes, holdersRes, marketRes] = await Promise.all([
      fetch(`${BIRDEYE_API}/price?address=${mint}`, {
        headers: { "X-API-KEY": BIRDEYE_API_KEY }
      }),
      fetch(`${BIRDEYE_API}/token/holder?address=${mint}`, {
        headers: { "X-API-KEY": BIRDEYE_API_KEY }
      }),
      fetch(`${BIRDEYE_API}/token/market?address=${mint}`, {
        headers: { "X-API-KEY": BIRDEYE_API_KEY }
      })
    ]);

    const priceData = priceRes.ok ? await priceRes.json() : null;
    const holdersData = holdersRes.ok ? await holdersRes.json() : null;
    const marketData = marketRes.ok ? await marketRes.json() : null;

    return {
      price: priceData?.data?.value || null,
      holders: holdersData?.data?.holderNumber || null,
      marketCap: marketData?.data?.marketCap || null,
      volume24h: marketData?.data?.volume24h || null,
      liquidity: marketData?.data?.liquidity || null
    };
  } catch (error) {
    console.error("Error fetching Birdeye data:", error);
    return null;
  }
}

async function getTokenMetadata(mint: string) {
  try {
    const response = await fetch(`https://public-api-v2.bags.fm/api/v1/analytics/tokens/${mint}`, {
      headers: { 
        "x-api-key": BAGS_API_KEY,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

async function getTokenSocials(mint: string) {
  try {
    const response = await fetch(`https://public-api-v2.bags.fm/api/v1/token/socials/${mint}`, {
      headers: { "x-api-key": BAGS_API_KEY }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.socials || data.links || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching token socials:", error);
    return [];
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  let cachedAllTokens: string[] = [];
  let lastTokensCacheFetch: number = 0;
  const TOKENS_CACHE_DURATION = 3600000;

  app.get("/api/all-tokens", async (req, res) => {
    try {
      const now = Date.now();
      
      if (cachedAllTokens.length > 0 && (now - lastTokensCacheFetch) < TOKENS_CACHE_DURATION) {
        return res.json({ tokens: cachedAllTokens });
      }

      const response = await fetch("https://public-api-v2.bags.fm/api/v1/analytics/tokens", {
        headers: {
          "x-api-key": BAGS_API_KEY,
          "Authorization": `Bearer ${BAGS_API_KEY}`,
        }
      });

      if (!response.ok) {
        if (cachedAllTokens.length > 0) {
          return res.json({ tokens: cachedAllTokens });
        }
        throw new Error(`Bags API returned status ${response.status}`);
      }

      const data = await response.json() as any;
      const tokens = (data.tokens || data.data || [])
        .filter((token: any) => token.mint || token.address)
        .map((token: any) => token.mint || token.address);

      if (tokens.length > 0) {
        cachedAllTokens = tokens;
        lastTokensCacheFetch = now;
      }

      res.json({ tokens: tokens.length > 0 ? tokens : cachedAllTokens });
    } catch (error) {
      console.error("Error fetching all tokens from Bags API:", error);
      if (cachedAllTokens.length > 0) {
        return res.json({ tokens: cachedAllTokens });
      }
      res.status(500).json({ 
        error: "Failed to fetch tokens",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhanced token details endpoint with comprehensive data
  app.get("/api/token-details/:mint", async (req, res) => {
    try {
      const { mint } = req.params;
      const tokenMint = new PublicKey(mint);
      const bagsSDK = getSDK();
      
      if (!bagsSDK) {
        throw new Error("SDK not initialized");
      }

      // Fetch all data in parallel
      const [
        feesLamports,
        metadata,
        socials,
        dexscreenerData,
        birdeyeData,
        solPrice
      ] = await Promise.all([
        bagsSDK.state.getTokenLifetimeFees(tokenMint),
        getTokenMetadata(mint),
        getTokenSocials(mint),
        getDexScreenerData(mint),
        getBirdeyeData(mint),
        getSolPrice()
      ]);

      const feesSOL = feesLamports / LAMPORTS_PER_SOL;
      const feesUSD = feesSOL * solPrice;

      // Extract creator info
      let creator = null;
      if (metadata?.data?.creator) {
        creator = {
          username: metadata.data.creator.username || metadata.data.creator.wallet || "Unknown",
          avatar: metadata.data.creator.avatar || null,
          twitter: metadata.data.creator.twitter || null,
          profileUrl: `https://bags.fm/profile/${metadata.data.creator.wallet || metadata.data.creator.username}`,
          bio: metadata.data.creator.bio || null
        };
      }

      // Extract social links
      const websites = [];
      const socialLinks = [];
      
      if (metadata?.data?.website) {
        websites.push({
          url: metadata.data.website,
          label: "Official Website"
        });
      }
      
      if (socials && socials.length > 0) {
        socials.forEach((social: any) => {
          if (social.type === 'website' && social.url) {
            websites.push({
              url: social.url,
              label: social.label || "Website"
            });
          } else if (social.url) {
            socialLinks.push({
              type: social.type || 'social',
              url: social.url,
              label: social.label
            });
          }
        });
      }

      // Process trading data
      const tradingData = {
        price: dexscreenerData?.priceUsd || birdeyeData?.price || null,
        priceChange24h: dexscreenerData?.priceChange24h || null,
        volume24h: dexscreenerData?.volume24h || birdeyeData?.volume24h || null,
        liquidityUsd: dexscreenerData?.liquidityUsd || birdeyeData?.liquidity || null,
        marketCap: dexscreenerData?.marketCap || birdeyeData?.marketCap || null,
        fdv: dexscreenerData?.fdv || null,
        holders: birdeyeData?.holders || null,
        buys24h: dexscreenerData?.buys24h || null,
        sells24h: dexscreenerData?.sells24h || null,
        txns24h: dexscreenerData?.txns24h || null
      };

      res.json({
        success: true,
        data: {
          mint,
          name: metadata?.data?.name || dexscreenerData?.baseToken?.name || "Unknown",
          symbol: metadata?.data?.symbol || dexscreenerData?.baseToken?.symbol || "UNKNOWN",
          description: metadata?.data?.description || null,
          image: metadata?.data?.image || `https://cdn.bags.fm/tokens/${mint}/icon` || `https://ui-avatars.com/api/?name=${mint}&background=0f0&color=000&bold=true`,
          bannerImage: metadata?.data?.banner || `https://cdn.bags.fm/tokens/${mint}/banner` || null,
          creator,
          websites,
          socials: socialLinks,
          trading: tradingData,
          fees: {
            lamports: feesLamports,
            sol: feesSOL,
            usd: feesUSD
          },
          solPrice,
          dexscreenerUrl: dexscreenerData?.url || `https://dexscreener.com/solana/${mint}`,
          birdeyeUrl: `https://birdeye.so/token/${mint}?chain=solana`,
          bagsUrl: `https://bags.fm/token/${mint}`,
          verified: metadata?.data?.verified || false,
          createdAt: metadata?.data?.createdAt || null,
          updatedAt: metadata?.data?.updatedAt || null
        }
      });
    } catch (error) {
      console.error("Error fetching token details:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch token details",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/token-fees/:mint", async (req, res) => {
    try {
      const { mint } = req.params;
      
      let tokenMint: PublicKey;
      try {
        tokenMint = new PublicKey(mint);
      } catch {
        return res.status(400).json({ error: "Invalid token mint address" });
      }

      const bagsSDK = getSDK();
      if (!bagsSDK) {
        return res.status(500).json({ error: "Failed to initialize SDK" });
      }

      const feesLamports = await bagsSDK.state.getTokenLifetimeFees(tokenMint);
      const feesSOL = feesLamports / LAMPORTS_PER_SOL;
      const solPrice = await getSolPrice();
      const feesUSD = feesSOL * solPrice;

      res.json({
        feesLamports,
        feesSOL,
        feesUSD,
        solPrice
      });
    } catch (error) {
      console.error("Error fetching token fees:", error);
      res.status(500).json({ 
        error: "Failed to fetch token fees",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
[file content end]