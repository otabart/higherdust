# HigherDust - Dust Token Swap App

A Next.js application for swapping dust tokens on the Base network.

## Features

- Connect wallet using wagmi
- View and select dust tokens
- Swap selected tokens for HIGHER tokens
- Real-time price calculations
- Slippage protection

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Wagmi (Web3)
- Viem
- Radix UI Components

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This app is configured for deployment on Vercel. The main fixes applied:

1. **Project Structure**: Moved all files from nested `higherdust/` folder to root level
2. **Build Configuration**: Added `output: 'standalone'` and wagmi external packages configuration
3. **Dynamic Rendering**: Added `dynamic = 'force-dynamic'` to prevent static generation issues with wagmi

## Environment Variables

No environment variables are required for the demo version. In production, you may want to add:

- `NEXT_PUBLIC_RPC_URL` - Base network RPC URL
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Router contract address

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main application page
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # Radix UI components
│   └── wallet-connect.tsx
├── lib/
│   ├── wagmi.ts        # Wagmi configuration
│   └── strings.ts      # Localization strings
└── hooks/
    └── use-toast.ts    # Toast notifications
```

## License

MIT 