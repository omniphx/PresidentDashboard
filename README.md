# PresidentDashboard

PresidentDashboard is a Next.js 16 app that compares U.S. presidential terms against market and macroeconomic data. The site supports head-to-head term comparisons, scoreboard views, live or latest snapshots, and relative versus absolute chart modes.

Repository: https://github.com/omniphx/PresidentDashboard

## What It Tracks

- Dow Jones
- S&P 500
- Nasdaq Composite
- Real oil prices
- Unemployment rate
- Federal funds rate

Depending on the selected series, the app compares presidents by percent change or point change over each term and aligns head-to-head charts by elapsed time in office.

## Data Sources

- Stooq historical market data
- Financial Modeling Prep quote data
- FRED macroeconomic series
- FRED CPI data for inflation-adjusted oil

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from `.env.example` and provide API keys:

```bash
cp .env.example .env.local
```

Required variables:

- `FMP_API_KEY`
- `FRED_API_KEY`

3. Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the local Next.js dev server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm test` runs the Vitest suite

## Project Structure

- [`app/`](/Users/mjmitchener/Development/PresidentsStockMarkets/app) App Router entry points
- [`components/`](/Users/mjmitchener/Development/PresidentsStockMarkets/components) UI components for charts, cards, controls, and tables
- [`lib/`](/Users/mjmitchener/Development/PresidentsStockMarkets/lib) benchmark definitions, formatting helpers, and market data logic
- [`tests/`](/Users/mjmitchener/Development/PresidentsStockMarkets/tests) unit and component tests

## Notes

- Market benchmarks use live quote support when available.
- Macro series use the latest available historical release rather than live intraday pricing.
- Comparison state is encoded in the URL so benchmark, matchup, and chart mode can be shared directly.
