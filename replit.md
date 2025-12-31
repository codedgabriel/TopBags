# TopBags - Real-time Bags Leaderboard

## Overview

TopBags is a Single Page Application (SPA) that displays real-time leaderboards for the Bags App ecosystem on Solana. The application shows two rankings: tokens by market cap and tokens by total earnings (fees claimed). It fetches data from DexScreener for market data and uses the Bags SDK for on-chain fee information, combining them to create a comprehensive token leaderboard with a podium-style display for top performers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with a custom "crypto terminal" dark theme featuring neon green accents
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for podium and list animations

### Backend Architecture
- **Server**: Express.js with HTTP server
- **Purpose**: Serves the static frontend and provides API proxy endpoints
- **API Routes**: Located in `server/routes.ts`, primarily for proxying Bags SDK calls to avoid CORS issues
- **Storage**: In-memory storage (`MemStorage`) - no persistent database required for core functionality

### Data Flow
1. Frontend makes requests via React Query hooks (`use-top-bags.ts`)
2. Market data (price, market cap) fetched directly from DexScreener API
3. Earnings data fetched through backend API routes that use the Bags SDK
4. SOL price fetched from CoinGecko with 60-second caching
5. Data combined and sorted for leaderboard display

### Token List Strategy
- Hardcoded list of 41 Solana token mint addresses in `client/src/lib/constants.ts`
- These are the only tokens tracked - no dynamic token discovery
- All tokens end with "BAGS" suffix (Bags ecosystem tokens)

### Key Design Patterns
- **Separation of Concerns**: Clear split between client (`client/`) and server (`server/`) code
- **Shared Types**: Common schemas and types in `shared/` directory
- **Component Composition**: Reusable UI components with variant support via class-variance-authority

## External Dependencies

### Third-Party APIs
- **DexScreener API**: Fetches real-time token market data (price, market cap, volume, liquidity)
- **CoinGecko API**: SOL/USD price for converting earnings to USD
- **Solana RPC**: Mainnet connection for on-chain data (default: `https://api.mainnet-beta.solana.com`)

### SDKs and Integrations
- **@bagsfm/bags-sdk**: Official Bags SDK for fetching token lifetime fees from Solana
- **@solana/web3.js**: Solana blockchain interaction

### Database
- **Drizzle ORM**: Configured with PostgreSQL dialect
- **Schema**: Minimal user schema in `shared/schema.ts`
- **Current Usage**: MemStorage for in-memory data (DB not actively used for core functionality)
- **Note**: `DATABASE_URL` environment variable expected but application functions without persistent storage

### Environment Variables
- `BAGS_API_KEY`: API key for Bags SDK (has hardcoded fallback)
- `SOLANA_RPC_URL`: Solana RPC endpoint (has hardcoded fallback)
- `DATABASE_URL`: PostgreSQL connection string (required by Drizzle config)

### Key NPM Packages
- `framer-motion`: Animation library for UI transitions
- `lucide-react` / `react-icons`: Icon libraries
- `zod`: Runtime type validation for API responses
- `wouter`: Client-side routing
- `@tanstack/react-query`: Data fetching and caching