import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BagsSDK } from "@bagsfm/bags-sdk";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const BAGS_API_KEY = process.env.BAGS_API_KEY || "bags_prod_jBZXtr2ODsKuBZ8lNBcfI_sveEztgtuRXNBJ44DUgQw";
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

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
  // Cache SOL price for 60 seconds to avoid excessive API calls
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

  // Fallback to cached price if fetch fails
  if (cachedSolPrice) {
    return cachedSolPrice;
  }

  // Last resort fallback
  return 200;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Cache for all tokens from Bags API
  let cachedAllTokens: string[] = [];
  let lastTokensCacheFetch: number = 0;
  const TOKENS_CACHE_DURATION = 3600000; // 1 hour

  // API endpoint to get all tokens from Bags API v2
  app.get("/api/all-tokens", async (req, res) => {
    try {
      const now = Date.now();
      
      // Return cached tokens if still fresh
      if (cachedAllTokens.length > 0 && (now - lastTokensCacheFetch) < TOKENS_CACHE_DURATION) {
        return res.json({ tokens: cachedAllTokens });
      }

      // Fetch from Bags API v2
      const response = await fetch("https://public-api-v2.bags.fm/api/v1/analytics/tokens", {
        headers: {
          "x-api-key": BAGS_API_KEY,
          "Authorization": `Bearer ${BAGS_API_KEY}`,
        }
      });

      if (!response.ok) {
        // Fallback to cached tokens if API fails
        if (cachedAllTokens.length > 0) {
          return res.json({ tokens: cachedAllTokens });
        }
        throw new Error(`Bags API returned status ${response.status}`);
      }

      const data = await response.json() as any;
      
      // Extract token mints from the response
      // The API likely returns tokens with a 'mint' field
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
      // Return cached tokens if available
      if (cachedAllTokens.length > 0) {
        return res.json({ tokens: cachedAllTokens });
      }
      res.status(500).json({ 
        error: "Failed to fetch tokens",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API endpoint to get token lifetime fees using Bags SDK
  app.get("/api/token-fees/:mint", async (req, res) => {
    try {
      const { mint } = req.params;
      
      // Validate mint is a valid Solana address
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
      
      // Get real-time SOL price
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
