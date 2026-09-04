import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExpenseStore } from "@/store/useExpenseStore"
import { getGeminiSummary, chatWithGemini, getAvailableModels, MODEL_CATALOG, type ChatMessage, type AvailableModel } from "@/lib/gemini"
import { getErrorMessage } from "@/lib/utils"
import { Sparkles, Key, Shield, Loader2, Wand2, AlertCircle, Eye, EyeOff, Lightbulb, Target, TrendingUp, Zap, MessageCircle, Send, Trash2, Cpu, ChevronDown } from "lucide-react"

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i)=>{
    const t = line.trim()
    if (!t) return <div key={i} className="h-2" />
    if (t.startsWith("###")) return <h4 key={i} className="text-sm font-bold text-foreground mt-3 mb-1">{t.replace(/^###\s*/, "")}</h4>
    if (t.startsWith("##")) return <h3 key={i} className="text-sm font-bold text-primary mt-3 mb-1">{t.replace(/^##\s*/, "")}</h3>
    if (t.startsWith("#")) return <h3 key={i} className="text-base font-bold text-foreground mt-3 mb-1">{t.replace(/^#\s*/, "")}</h3>
    if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ")) {
      const content = t.slice(2)
      const parts = content.split(/(\*\*.*?\*\*)/g)
      return <div key={i} className="ml-1 flex gap-2 text-sm text-muted-foreground leading-relaxed"><span aria-hidden="true" className="text-primary">•</span><span>{parts.map((p,pi)=> p.startsWith("**") ? <strong key={pi} className="text-foreground font-semibold">{p.slice(2,-2)}</strong> : p)}</span></div>
    }
    if (/^\d+\./.test(t)) {
      const content = t.replace(/^\d+\.\s*/, "")
      const marker = t.match(/^\d+\./)?.[0] ?? ""
      const parts = content.split(/(\*\*.*?\*\*)/g)
      return <div key={i} className="ml-1 flex gap-2 text-sm text-muted-foreground leading-relaxed"><span className="font-mono text-primary">{marker}</span><span>{parts.map((p,pi)=> p.startsWith("**") ? <strong key={pi} className="text-foreground font-semibold">{p.slice(2,-2)}</strong> : p)}</span></div>
    }
    if (t.startsWith("**") && t.endsWith("**")) return <p key={i} className="text-sm font-bold text-foreground mt-2">{t.slice(2,-2)}</p>
    const parts = t.split(/(\*\*.*?\*\*)/g)
    return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{parts.map((p,pi)=> p.startsWith("**") ? <strong key={pi} className="text-foreground font-semibold">{p.slice(2,-2)}</strong> : p)}</p>
  })
}

export function AIAdvisor() {
  const { geminiKey, setGeminiKey, selectedModel, setSelectedModel, totalBalance, expenses, currency } = useExpenseStore()
  const [localKey, setLocalKey] = useState(geminiKey)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  // chat
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string|null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  // model selector
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)

  const totalSpent = expenses.reduce((s,e)=>s+e.amount,0)
  const remaining = totalBalance - totalSpent

  useEffect(()=>{ setLocalKey(geminiKey) }, [geminiKey])
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, chatLoading])

  useEffect(()=>{
    const key = geminiKey.trim()
    if (!key || key.length < 10) {
      setAvailableModels([])
      setModelsLoading(false)
      return
    }
    let cancelled = false
    setModelsLoading(true)
    getAvailableModels(key).then(list=>{
      if (!cancelled) setAvailableModels(list)
    }).catch(()=> {
      if (!cancelled) setAvailableModels([])
    }).finally(()=> {
      if (!cancelled) setModelsLoading(false)
    })
    return ()=> { cancelled = true }
  }, [geminiKey])

  const handleSave = () => {
    setGeminiKey(localKey.trim())
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }

  const handleGenerateSummary = async () => {
    const key = (localKey || geminiKey).trim()
    if (!key) { setError("Please add your Gemini API key first. Paste it and click Save."); return }
    if (key !== geminiKey) setGeminiKey(key)
    if (expenses.length === 0) { setError("Add some expenses first so AI can analyze."); return }
    if (totalBalance === 0) { setError("Set your monthly balance first."); return }
    setLoading(true); setError(null); setSummary(null)
    try {
      const txt = await getGeminiSummary(key, totalBalance, expenses, currency, selectedModel)
      setSummary(txt)
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to get summary"))
    } finally { setLoading(false) }
  }

  const handleSendChat = async () => {
    const q = chatInput.trim()
    if (!q) return
    const key = (localKey || geminiKey).trim()
    if (!key) { setChatError("Add your Gemini API key first."); return }
    if (key !== geminiKey) setGeminiKey(key)
    if (totalBalance === 0 && expenses.length===0) { setChatError("Set balance and add expenses for better answers, but you can still chat."); }
    const userMsg: ChatMessage = { role: "user", text: q }
    setMessages(prev=> [...prev, userMsg])
    setChatInput("")
    setChatLoading(true)
    setChatError(null)
    try {
      const reply = await chatWithGemini(key, totalBalance, expenses, currency, [...messages, userMsg].slice(-8), q, selectedModel)
      setMessages(prev=> [...prev, { role: "assistant", text: reply }])
    } catch (e: unknown) {
      const message = getErrorMessage(e, "Failed to answer")
      setChatError(message)
      setMessages(prev=> [...prev, { role: "assistant", text: `⚠️ ${message}` }])
    } finally { setChatLoading(false) }
  }

  const clearChat = () => setMessages([])

  return (
    <Card className="relative overflow-hidden border bg-card shadow-xl flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-indigo-500/[0.04] dark:from-violet-600/[0.06] dark:via-transparent dark:to-indigo-600/[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <CardHeader className="relative pb-4 border-b bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">AI Financial Advisor <span className="px-1.5 py-0.5 rounded-md bg-violet-600 text-white text-[10px] font-bold tracking-widest">GEMINI</span></CardTitle>
              <CardDescription className="text-xs mt-1">Brief summary + chat — private, contextual</CardDescription>
            </div>
          </div>
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Shield size={12} /> Private
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 p-4 lg:p-5 flex-1 flex flex-col">
        <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
           <Label htmlFor="gemini-api-key" className="flex items-center gap-1.5 text-xs font-semibold tracking-wide"><Key size={12} /> Gemini API Key <span className="text-muted-foreground font-normal hidden sm:inline">• stored locally</span></Label>
           <div className="flex gap-2">
             <div className="relative flex-1 min-w-0">
               <Input id="gemini-api-key" type={showKey ? "text" : "password"} value={localKey} onChange={e=>setLocalKey(e.target.value)} placeholder="AIzaSy..." className="pr-9 h-10 text-sm font-mono" />
               <button type="button" onClick={()=>setShowKey(!showKey)} aria-label={showKey ? "Hide Gemini API key" : "Show Gemini API key"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Button size="sm" onClick={handleSave} className="h-10 px-5 font-semibold shrink-0">{saved ? "Saved ✓" : "Save"}</Button>
          </div>
           <p className="text-[11px] leading-relaxed text-muted-foreground flex gap-1.5"><Shield size={12} className="mt-0.5 shrink-0" /> <span>Get key free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">aistudio.google.com</a> • AI prompts and budget context are sent directly to Google.</span></p>
        </div>

        {/* Model selector */}
        <div className="p-3 rounded-xl bg-muted/30 border flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center"><Cpu size={14} className="text-violet-600" /></div>
            <div>
              <p className="text-xs font-bold">Model</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Choose or keep Auto</p>
            </div>
          </div>
          <div className="flex-1 relative min-w-0">
            <select
               aria-label="Select Gemini model"
               value={selectedModel}
              onChange={e=>setSelectedModel(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="auto">Auto (recommended) — picks best for your key</option>
              {(availableModels.length > 0 ? availableModels.map(m=> ({ id: m.name, label: m.display, tier: MODEL_CATALOG.find(c=>c.id===m.name)?.tier || "free" as const, desc: MODEL_CATALOG.find(c=>c.id===m.name)?.desc || "" })) : MODEL_CATALOG).map(m=>(
                <option key={m.id} value={m.id}>
                  {m.label} — {m.tier === "pro" ? "Pro (needs billing)" : "Free"} {m.desc ? `• ${m.desc}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {modelsLoading && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading…</span>}
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2 px-1">Auto tries <span className="font-mono">gemini-2.0-flash</span> first (free). Pro models like <span className="font-mono">1.5-pro</span> need a billing-enabled key; if your key is free, Auto will skip them.</p>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-muted border text-center">
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">SPENT</p>
            <p className="text-sm font-bold font-mono text-foreground mt-1">{currency} {totalSpent.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted border text-center">
            <p className="text-[10px] tracking-widest font-bold text-muted-foreground">REMAINING</p>
            <p className={`text-sm font-bold font-mono mt-1 ${remaining < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>{currency} {remaining.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-500/20 text-center text-white">
            <p className="text-[10px] tracking-widest font-bold text-violet-100">SCORE*</p>
            <p className="text-sm font-bold mt-1 flex items-center justify-center gap-1"><Zap size={12} /> AI →</p>
          </div>
        </div>

        <Button onClick={handleGenerateSummary} disabled={loading} className="w-full h-11 font-bold gap-2 rounded-xl shadow-lg shadow-violet-600/20 text-sm">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating brief summary...</> : <><Wand2 size={16} /> Generate Brief Summary</>}
        </Button>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 overflow-hidden">
            <div className="p-3 flex gap-2.5 text-sm text-destructive max-h-[180px] overflow-auto">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="whitespace-pre-wrap leading-relaxed break-words">{error}</span>
            </div>
          </div>
        )}

        {summary && (
          <div className="rounded-xl bg-muted/30 border p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <Lightbulb size={14} className="text-amber-500" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground">BRIEF SUMMARY</span>
              <span className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"><Target size={12} /> Actionable • <TrendingUp size={12} /> Personal</span>
            </div>
            <div className="space-y-1 pr-1">{renderMarkdown(summary)}</div>
            <div className="pt-3 mt-3 border-t flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={()=>setSummary(null)} className="h-8 text-xs">Dismiss</Button>
              <Button variant="ghost" size="sm" onClick={handleGenerateSummary} className="h-8 text-xs">Regenerate</Button>
              <Button variant="ghost" size="sm" onClick={()=>navigator.clipboard.writeText(summary)} className="h-8 text-xs ml-auto">Copy</Button>
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className="rounded-xl border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <MessageCircle size={16} className="text-violet-600" />
            <span className="text-sm font-bold">Chat with AI</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">— ask anything about your spend</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold hidden sm:inline">Gemini</span>
               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} title="Clear chat" aria-label="Clear chat"><Trash2 size={12} /></Button>
            </div>
          </div>

          <div className="flex-1 min-h-[180px] max-h-[320px] overflow-y-auto p-3 space-y-3 bg-background/50">
            {messages.length===0 && (
              <div className="text-center py-6">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto"><MessageCircle size={16} className="text-violet-600" /></div>
                <p className="text-sm font-medium text-foreground mt-2">Ask your AI about your budget</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[28ch] mx-auto">e.g. “Why did I overspend on groceries?” or “How can I save ₹2000 next month?”</p>
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                  {["Where can I cut 10%?", "Explain my health score", "Suggest a saving plan"].map(ex=>(
                    <button key={ex} onClick={()=>setChatInput(ex)} className="px-2.5 py-1 rounded-full bg-muted border text-xs hover:bg-accent">{ex}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role==='user' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-muted border text-foreground rounded-bl-sm'}`}>
                  <div className="whitespace-pre-wrap break-words">{m.role==='assistant' ? <div className="space-y-1">{renderMarkdown(m.text)}</div> : m.text}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted border rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {chatError && <div className="px-3 pb-2 text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} /> {chatError}</div>}

          <div className="p-3 border-t bg-muted/20 flex gap-2">
            <Input
              value={chatInput}
              onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSendChat() }}}
              placeholder={summary ? "Ask about your summary…" : "Ask anything — e.g. How to save more?"}
              className="flex-1 h-10"
              disabled={chatLoading}
            />
            <Button onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()} className="h-10 px-4 gap-1.5">
              {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
