# Proposales Dashboard

A modern Next.js dashboard for viewing and managing proposals from the [Proposales API](https://docs.proposales.com/api-reference/introduction).

## Features

- 📊 View all proposals from your Proposales account
- 🔍 Detailed proposal view with full metadata
- ⚡ Built with Next.js 16 (App Router) and React 19
- 🎨 Styled with Tailwind CSS
- 🔄 Real-time data fetching with SWR
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **Data Fetching**: SWR 2.3.6
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety
- **API**: Proposales API v3

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Proposales account ([sign up here](https://proposales.com))
- Your Proposales API key (found at [https://secure.proposales.com/settings/profile](https://secure.proposales.com/settings/profile))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd proposal-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PROPOSALES_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── proposals/
│   │       ├── [id]/route.ts      # Get single proposal
│   │       └── list/route.ts      # List all proposals
│   ├── proposals/
│   │   └── [id]/page.tsx          # Proposal detail page
│   ├── types/
│   │   └── proposales.ts          # TypeScript types
│   ├── page.tsx                   # Home page
│   └── layout.tsx                 # Root layout
├── components/
│   ├── ProposalCard.tsx           # Proposal card component
│   ├── ProposalList.tsx           # Proposal list component
│   ├── SearchBar.tsx              # Search component
│   ├── LoadingState.tsx           # Loading state
│   └── ErrorState.tsx             # Error state
└── lib/
    ├── proposales.ts              # Proposales API client
    └── swrFetcher.ts              # SWR fetcher utility
```

## API Routes

- `GET /api/proposals/list` - Fetch all proposals
- `GET /api/proposals/[id]` - Fetch a specific proposal by UUID

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PROPOSALES_API_KEY` | Your Proposales API key | Yes |

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your `PROPOSALES_API_KEY` environment variable
4. Deploy!

## API Documentation

This project uses the Proposales API v3. For more information:
- [API Introduction](https://docs.proposales.com/api-reference/introduction)
- [Proposals Search](https://docs.proposales.com/api-reference/proposals/search)
- [Get Proposal](https://docs.proposales.com/api-reference/proposals/get)

## License

MIT
