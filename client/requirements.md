## Packages
framer-motion | Essential for smooth podium animations and entrance effects
lucide-react | Used for icons throughout the UI
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes safely

## Notes
The application fetches data directly from external APIs (DexScreener and Bags.fm) on the client side.
No backend routes are required for data fetching.
CORS handling might be required if the external APIs block browser requests, but standard fetch is used as per instructions.
The API key for Bags.fm is hardcoded as requested for the demo.
