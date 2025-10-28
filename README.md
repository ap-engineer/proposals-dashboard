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

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```bash
PROPOSALES_API_KEY=your_proposales_key
GROQ_API_KEY=your_groq_key  # Optional, for AI features
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required
- `PROPOSALES_API_KEY` - Get from [Proposales Profile](https://secure.proposales.com/settings/profile)

### Optional
- `GROQ_API_KEY` - Get free key from [Groq Console](https://console.groq.com) (for AI features)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI endpoints
│   │   └── proposals/    # Proposal endpoints
│   ├── analytics/        # Analytics page
│   ├── content/          # Content library page
│   ├── create/           # Create proposal page
│   └── proposals/[id]/   # Proposal detail page
├── components/            # Reusable React components
├── lib/                   # Utilities and configurations
│   ├── proposales.ts     # Proposales API client
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
└── types/                 # TypeScript type definitions
```

## Key Features Explained

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
