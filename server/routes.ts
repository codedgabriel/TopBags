import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BagsSDK } from "@bagsfm/bags-sdk";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const BAGS_API_KEY = process.env.BAGS_API_KEY || "bags_prod_jBZXtr2ODsKuBZ8lNBcfI_sveEztgtuRXNBJ44DUgQw";
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

let sdk: BagsSDK | null = null;

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

      // Convert SOL to USD using a simple exchange rate (can be improved with real-time pricing)
      // For now, we'll just return both SOL and a placeholder USD value
      res.json({
        feesLamports,
        feesSOL,
        feesUSD: feesSOL * 200 // Placeholder: 1 SOL = $200 (user can see actual in SOL)
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
