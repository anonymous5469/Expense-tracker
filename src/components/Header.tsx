import { Wallet, Sparkles, Settings, Search, Command, Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header({ theme, onToggle, onSettings, onAdmin, searchValue, onSearchChange }: { theme: 'light'|'dark'; onToggle: ()=>void; onSettings: () => void; onAdmin: () => void; searchValue?: string; onSearchChange?: (v:string)=>void }) {
  const isDark = theme === 'dark'
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b supports-[backdrop-filter]:bg-opacity-60 transition-colors ${isDark ? 'bg-zinc-950/60 border-zinc-900/80' : 'bg-white/80 border-zinc-200 shadow-sm'}`}>
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25 ring-1 ring-violet-500/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-[16px] font-bold tracking-tight leading-none flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>FINTRACK <span className="hidden lg:inline text-[10px] font-bold tracking-[0.18em] px-1.5 py-0.5 rounded bg-violet-600 text-white">OS</span></h1>
              <p className={`text-[11px] font-medium tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>PREMIUM EXPENSE OS • v3</p>
            </div>
            <div className="sm:hidden">
              <h1 className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>FINTRACK</h1>
            </div>
          </div>

          <span className="hidden xl:inline-flex ml-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE • REAL-TIME
          </span>

          <div className="hidden lg:flex items-center gap-2 ml-4 xl:ml-8 flex-1 max-w-[520px]" role="search" aria-label="Search transactions">
            <label htmlFor="header-search" className="sr-only">Search transactions</label>
            <div className="relative flex-1">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} aria-hidden="true" />
              <input id="header-search" type="search" placeholder="Search transactions, categories…" aria-label="Search transactions" value={searchValue ?? ""} onChange={e=>onSearchChange?.(e.target.value)} onKeyDown={e=>{ if(e.key==='Escape'){ onSearchChange?.("") ; (e.target as HTMLInputElement).blur() }}} className={`w-full h-9 pl-9 pr-20 rounded-xl text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-800 focus:ring-violet-600/30 focus:border-violet-600/40 text-white' : 'bg-zinc-50 border border-zinc-200 focus:ring-violet-600/20 focus:border-violet-600/30 text-zinc-900'}`} />
              <span aria-hidden="true" className={`absolute right-1.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-1 px-1.5 py-1 rounded-lg border text-[11px] font-medium ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500 shadow-sm'}`}><Command size={10} /> K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Light/Dark Toggle — prominent */}
          <button
            onClick={onToggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`relative h-9 w-[68px] rounded-full p-1 flex items-center transition-all border shadow-inner focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}
          >
            <span className={`absolute h-7 w-7 rounded-full shadow flex items-center justify-center transition-all duration-300 ${isDark ? 'translate-x-0 bg-zinc-800 text-yellow-400' : 'translate-x-[32px] bg-white text-violet-600 border border-zinc-200'}`}>
              {isDark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
            </span>
            <span aria-hidden="true" className={`absolute left-1.5 text-[11px] transition-opacity ${isDark ? 'opacity-0' : 'opacity-60 text-zinc-500'}`}><Sun size={10} /></span>
            <span aria-hidden="true" className={`absolute right-1.5 text-[11px] transition-opacity ${isDark ? 'opacity-60 text-zinc-600' : 'opacity-0'}`}><Moon size={10} /></span>
          </button>

          <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <Sparkles size={14} className="text-violet-500" />
            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>AI Powered</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs hidden xl:inline ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>• Gemini 2.0</span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications" className={`hidden sm:flex rounded-xl h-9 w-9 ${isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}>
            <Bell size={18} aria-hidden="true" />
          </Button>
          <span className={`h-6 w-px hidden sm:block ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} aria-hidden="true" />
          <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Open settings" className={`rounded-xl h-9 w-9 border ${isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 shadow-sm'}`} title="Settings">
            <Settings size={16} aria-hidden="true" />
          </Button>
          <button onClick={onAdmin} aria-label="Open admin center" title="Admin • Account Centre • AI Advisor (tap to open)" className={`hidden sm:flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring ${isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'}`}>
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow" aria-hidden="true">A</span>
            <span className={`text-xs font-semibold hidden lg:inline ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Admin</span>
          </button>
          <button onClick={onAdmin} aria-label="Open admin center" title="Admin Account Centre" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow hover:scale-105 transition-transform sm:hidden">
            Z
          </button>
          <button onClick={onAdmin} aria-label="Open admin center" title="Admin Account Centre" className="hidden sm:flex h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 items-center justify-center text-sm font-bold text-white shadow hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-ring">
            Z
          </button>
        </div>
      </div>
    </header>
  )
}
