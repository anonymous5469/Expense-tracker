<div align="center">

# FinTrack

**Premium AI-powered expense tracker with real-time balance calculations.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://expense-tracker-eight-iota-67.vercel.app)
[![Built with React](https://img.shields.io/badge/Built_with-React_18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Optional-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)

[Live Demo](https://expense-tracker-eight-iota-67.vercel.app) · [Report Bug](https://github.com/anonymous5469/Expense-tracker/issues) · [Request Feature](https://github.com/anonymous5469/Expense-tracker/issues)

</div>

---

## Highlights

| Feature | Description |
|---------|-------------|
| Budget Tracking | Monthly budget, spent, and remaining balance update instantly |
| Transaction Management | Add, edit, delete, undo, search, filter, and export as CSV |
| Visual Insights | Category breakdown and 14-day spending trend charts |
| Themes | Light and dark mode with persisted preferences |
| AI Assistant | Optional Gemini-powered summaries, insights, and chat |
| Responsive | Desktop, tablet, and mobile layouts |

## Quick Start

```bash
git clone https://github.com/anonymous5469/Expense-tracker.git && cd Expense-tracker && npm install && npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |

## Gemini Setup (Optional)

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open **Admin Centre** in the app
3. Paste your key and select **Save**

## Tech Stack

- **React 18** + **TypeScript** — UI and type safety
- **Tailwind CSS** — Utility-first styling
- **Zustand** — Lightweight state management
- **Recharts** — Interactive charts
- **Vite** — Fast build tooling
- **Gemini AI** — Optional financial insights

## Project Structure

```
src/
├── App.tsx                  # Application shell, theme, totals, dialogs
├── main.tsx                 # Entry point
├── index.css                # Global styles
├── components/
│   ├── AdminCenter.tsx      # Settings and API key management
│   ├── AIAdvisor.tsx        # Gemini summaries and chat
│   ├── BalanceSetup.tsx     # Monthly budget configuration
│   ├── CategoryChart.tsx    # Expense breakdown chart
│   ├── ExpenseForm.tsx      # Add/edit transactions
│   ├── ExpenseTable.tsx     # Transaction list with filters
│   ├── Header.tsx           # App header
│   ├── StatsCards.tsx       # Budget overview cards
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── gemini.ts            # Gemini API client and sanitization
│   └── utils.ts             # Utility functions
├── store/
│   └── useExpenseStore.ts   # Persisted state management
└── types.ts                 # TypeScript interfaces
```

## License

MIT
