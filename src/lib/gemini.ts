import { GoogleGenerativeAI, type GenerationConfig, type ModelParams } from "@google/generative-ai"
import type { Expense } from "@/types"
import { getErrorMessage } from "@/lib/utils"

type GeminiApiVersion = "v1" | "v1beta"
type JsonRecord = Record<string, unknown>
type DiscoveredModel = { name: string; version: GeminiApiVersion }
export type AvailableModel = DiscoveredModel & { display: string }
type RestRequest = {
  contents: Array<{ parts: Array<{ text: string }> }>
  generationConfig: GenerationConfig
  systemInstruction?: { parts: Array<{ text: string }> }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(getErrorMessage(error))
}

function getResponseText(data: unknown) {
  if (!isRecord(data) || !Array.isArray(data.candidates)) return undefined
  const candidate = data.candidates[0]
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) return undefined
  for (const part of candidate.content.parts) {
    if (isRecord(part) && typeof part.text === "string") return part.text
  }
  return undefined
}

function getApiErrorMessage(data: unknown) {
  if (!isRecord(data) || !isRecord(data.error) || typeof data.error.message !== "string") return undefined
  return data.error.message
}

function parseApiErrorMessage(message: string) {
  try {
    return getApiErrorMessage(JSON.parse(message) as unknown)
  } catch {
    return undefined
  }
}

function isCredentialOrQuotaError(message: string) {
  return message.includes("API_KEY_INVALID") || message.includes("API key") || message.includes("403") || message.includes("429")
}

const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-002",
  "gemini-pro",
  "gemini-1.0-pro",
]

async function discoverModels(apiKey: string): Promise<DiscoveredModel[]> {
  const versions: GeminiApiVersion[] = ["v1", "v1beta"]
  for (const v of versions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) {
        const txt = await res.text()
        console.warn(`[Gemini] ListModels ${v} failed ${res.status}: ${txt.slice(0,300)}`)
        continue
      }
      const data: unknown = await res.json()
      const models = isRecord(data) && Array.isArray(data.models)
        ? data.models.filter((model): model is JsonRecord => isRecord(model))
        : []
      const usable = models
        .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.some((method: unknown) => method === "generateContent"))
        .map((m) => ({
          name: typeof m.name === "string" ? m.name.replace(/^models\//, "") : "",
          version: v,
        }))
        .filter((model) => model.name.length > 0)
      if (usable.length > 0) {
        console.log(`[Gemini] ListModels ${v} found ${usable.length} models:`, usable.map((u) => u.name).join(", "))
        const prio = new Map(CANDIDATE_MODELS.map((c, i) => [c, i]))
        usable.sort((a, b) => {
          const pa = prio.has(a.name) ? prio.get(a.name)! : 999
          const pb = prio.has(b.name) ? prio.get(b.name)! : 999
          return pa - pb
        })
        return usable
      }
    } catch (e) {
      console.warn(`[Gemini] discover ${v} error`, e)
      continue
    }
  }
  return []
}

export const MODEL_CATALOG: Array<{ id: string; label: string; tier: "free" | "pro"; desc: string }> = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tier: "free", desc: "Fast, recommended (free tier)" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", tier: "free", desc: "Fastest, lower cost" },
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Exp", tier: "free", desc: "Experimental" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", tier: "free", desc: "Stable free" },
  { id: "gemini-1.5-flash-002", label: "Gemini 1.5 Flash 002", tier: "free", desc: "Stable patch" },
  { id: "gemini-1.5-flash-latest", label: "Gemini 1.5 Flash Latest", tier: "free", desc: "Latest 1.5" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", tier: "pro", desc: "Higher quality (pro)" },
  { id: "gemini-1.5-pro-002", label: "Gemini 1.5 Pro 002", tier: "pro", desc: "Pro patch" },
  { id: "gemini-pro", label: "Gemini Pro (1.0)", tier: "free", desc: "Legacy" },
  { id: "gemini-1.0-pro", label: "Gemini 1.0 Pro", tier: "free", desc: "Legacy" },
]

export async function getAvailableModels(apiKey: string): Promise<AvailableModel[]> {
  const discovered = await discoverModels(apiKey)
  return discovered.map(d => {
    const cat = MODEL_CATALOG.find(c => c.id === d.name)
    return { ...d, display: cat ? `${cat.label} (${d.name})` : d.name }
  })
}

function getContext(totalBalance: number, expenses: Expense[], currency: string) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const remaining = totalBalance - totalSpent
  const pct = totalBalance ? ((remaining / totalBalance) * 100).toFixed(1) : "0"
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const breakdown = Object.entries(byCategory)
    .map(([k, v]) => `${k}: ${currency} ${v} (${totalSpent ? ((v / totalSpent) * 100).toFixed(1) : 0}%)`)
    .join(" • ") || "None"
  const recent = expenses.slice(0, 5).map((e) => `${e.title} (${e.category}) ${currency}${e.amount} on ${e.date}`).join(" | ") || "No recent"
  return { totalSpent, remaining, pct, breakdown, recent }
}

// Brief summary prompt — anti-echo, structured, no Tasks echo
function buildSummaryPrompt(totalBalance: number, expenses: Expense[], currency: string) {
  if (totalBalance === 0) {
    return `User has not set monthly budget (0). Ask user to set Monthly Budget first in 2-3 sentences, friendly, max 40 words. Do not add any data block.`
  }
  if (expenses.length === 0) {
    return `Budget is ${currency} ${totalBalance} but 0 transactions. Provide brief 50/30/20 guidance and ask to add first expense. Max 80 words, bullets.`
  }
  // Main prompt: user content only contains the human-readable summary, DATA is supplied via systemInstruction
  return `Provide the 5 sections below in markdown, max 220 words, bullets only, encouraging tone, minimal emojis.

## Summary
One paragraph (2 lines) overview of spend health.

## Health Score
**Score: XX/100** — one-line justification.

## Top Overspending
• 2-3 categories with specific insight (why high, e.g. "Rent 83% — dominates budget")

## Action Plan
• 4 highly specific tips tied to actual categories/spend (Zepto/Blinkit, rent, bills etc). No generic advice.

## Saving Target
• One line: realistic amount in ${currency} to save next month and why.`
}

function buildSummarySystem(totalBalance: number, expenses: Expense[], currency: string) {
  const { totalSpent, remaining, pct, breakdown, recent } = getContext(totalBalance, expenses, currency)
  return `You are Fintrack AI — premium, concise personal finance analyst for India. You have hidden financial data. You MUST NOT echo raw data. NEVER output lines like "Monthly Budget:", "Total Spent:", "Remaining:", "Breakdown:", "Recent Expenses:", "Budget:", "Spent:", "Context (DATA):", "User Question:", "DATA:" or numbered tasks. ONLY output the 5 sections requested. If you include "Budget: ₹" verbatim you have failed.
Hidden DATA (use internally, do not repeat):
Budget: ${currency} ${totalBalance}
Spent: ${currency} ${totalSpent}
Remaining: ${currency} ${remaining} (${pct}% left)
Breakdown: ${breakdown}
Recent (5): ${recent}`
}

// Chat prompt — history aware, minimal leak labels
function buildChatPrompt(totalBalance: number, expenses: Expense[], currency: string, history: Array<{role:string; text:string}>, userQuestion: string) {
  const historyText = history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
  return `${historyText ? historyText + "\n" : ""}User: ${userQuestion}`.trim()
}

function buildChatSystem(totalBalance: number, expenses: Expense[], currency: string) {
  const { totalSpent, remaining, pct, breakdown } = getContext(totalBalance, expenses, currency)
  return `You are Fintrack AI, conversational finance helper for India. You have hidden financial data. Use it to answer. NEVER echo raw data verbatim. NEVER output a block with "User Question:", "Context (DATA):", "Budget:", "Spent:", "Remaining:", "Breakdown:" on separate bullet lines. NEVER prefix answer with "Context (DATA):". Just answer the question directly, friendly, max 150 words, bullets if list, markdown allowed. Be specific to their spend (e.g. Zepto/Blinkit grocery habits, rent 83%, bills 17%). If off-topic, gently redirect. Off-limit: repeating DATA.
Hidden DATA (internal only):
Budget ${currency} ${totalBalance} | Spent ${currency} ${totalSpent} | Remaining ${currency} ${remaining} (${pct}%) | Breakdown: ${breakdown}`
}

async function tryWithRest(apiKey: string, modelName: string, apiVersion: GeminiApiVersion, prompt: string, systemInstruction: string | undefined, generationConfig: GenerationConfig) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`
  const body: RestRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  }
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  const data: unknown = await res.json()
  const text = getResponseText(data)
  return text ? sanitize(text) : null
}

async function tryWithSDK(apiKey: string, prompt: string, systemInstruction?: string, preferredModel?: string): Promise<string> {
  let lastError: Error | null = null
  const generationConfig: GenerationConfig = { temperature: 0.7, maxOutputTokens: 2048 }
  const requestWithSDK = async (modelName: string, apiVersion: GeminiApiVersion) => {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelParams: ModelParams = { model: modelName, generationConfig }
    if (systemInstruction) modelParams.systemInstruction = systemInstruction
    const model = genAI.getGenerativeModel(modelParams, { apiVersion })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text ? sanitize(text) : null
  }

  // If user picked a specific model, try it first before discovering alternatives.
  if (preferredModel && preferredModel !== "auto") {
    for (const apiVersion of ["v1", "v1beta"] as const) {
      try {
        const text = await requestWithSDK(preferredModel, apiVersion)
        if (text) {
          console.log(`[Gemini] Success (preferred ${preferredModel} @ ${apiVersion})`)
          return text
        }
      } catch (error: unknown) {
        lastError = toError(error)
        const message = getErrorMessage(error)
        if (isCredentialOrQuotaError(message)) throw error
        console.warn(`[Gemini] preferred ${preferredModel} @ ${apiVersion} failed: ${message.slice(0, 160)}`)
        try {
          const text = await tryWithRest(apiKey, preferredModel, apiVersion, prompt, systemInstruction, generationConfig)
          if (text) return text
        } catch (restError: unknown) {
          lastError = toError(restError)
        }
      }
    }
    console.warn(`[Gemini] preferred ${preferredModel} failed on both versions, falling back to auto`)
  }

  const discovered = await discoverModels(apiKey)
  if (discovered.length > 0) {
    for (const { name: modelName, version: apiVersion } of discovered) {
      try {
        const text = await requestWithSDK(modelName, apiVersion)
        if (text) {
          console.log(`[Gemini] Success (discovered) with ${modelName} @ ${apiVersion}`)
          return text
        }
      } catch (error: unknown) {
        lastError = toError(error)
        const message = getErrorMessage(error)
        console.warn(`[Gemini] discovered ${modelName} @ ${apiVersion} SDK failed: ${message.slice(0, 180)}`)
        try {
          const text = await tryWithRest(apiKey, modelName, apiVersion, prompt, systemInstruction, generationConfig)
          if (text) {
            console.log(`[Gemini REST] Success (discovered) with ${modelName} @ ${apiVersion}`)
            return text
          }
        } catch (restError: unknown) {
          lastError = toError(restError)
          console.warn(`[Gemini] discovered REST ${modelName} @ ${apiVersion} failed: ${getErrorMessage(restError).slice(0, 180)}`)
        }
      }
    }
  } else {
    console.warn("[Gemini] No models discovered via ListModels, falling back to candidate loop")
  }

  for (const apiVersion of ["v1", "v1beta"] as const) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const text = await requestWithSDK(modelName, apiVersion)
        if (text) {
          console.log(`[Gemini] Success with ${modelName} @ ${apiVersion}`)
          return text
        }
      } catch (error: unknown) {
        lastError = toError(error)
        const message = getErrorMessage(error)
        if (message.includes("404") || message.includes("not found") || message.includes("not supported")) {
          console.warn(`[Gemini] ${modelName} @ ${apiVersion} not available: ${message.slice(0, 120)}`)
          continue
        }
        if (isCredentialOrQuotaError(message)) throw error
        console.warn(`[Gemini] ${modelName} @ ${apiVersion} failed: ${message.slice(0, 150)}`)
      }
    }
  }

  for (const modelName of ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]) {
    for (const apiVersion of ["v1", "v1beta"] as const) {
      try {
        const text = await tryWithRest(apiKey, modelName, apiVersion, prompt, systemInstruction, generationConfig)
        if (text) {
          console.log(`[Gemini REST] Success with ${modelName} @ ${apiVersion}`)
          return text
        }
      } catch (error: unknown) {
        lastError = toError(error)
        if (!getErrorMessage(error).includes("not found")) {
          console.warn(`[Gemini REST] ${modelName} @ ${apiVersion} failed: ${getErrorMessage(error).slice(0, 150)}`)
        }
      }
    }
  }

  if (discovered.length === 0) {
    throw new Error(
      (lastError?.message || "") +
        " | No models were listed for this key. This usually means: 1) Generative Language API is NOT enabled in your Google Cloud project, 2) API key is restricted (HTTP referrer/IP), or 3) Key was created in wrong project. Fix: go to https://aistudio.google.com/app/apikey -> Create new key -> ensure 'Generative Language API' shows Enabled, and try again without restrictions."
    )
  }

  throw lastError || new Error("All Gemini models failed. Please try again or check your API key at aistudio.google.com")
}

function sanitize(text: string): string {
  const trim = text.trim()
  // Detect classic prompt echo
  const hasClassicLeak = trim.includes("Monthly Budget:") && trim.includes("Tasks:") && trim.includes("Breakdown:")
  // Detect chat leak: "User Question:" + "Context (DATA):" + Budget/Spent/Remaining/Breakdown block
  const hasChatLeak = /User Question:/i.test(trim) && /(Context\s*\(?DATA\)?:|Hidden DATA)/i.test(trim) && /Budget:\s*₹?\s*[\d,]+/i.test(trim) && /Spent:/i.test(trim) && /Remaining:/i.test(trim)
  // Detect generic structured leak: bullet list with Budget/Spent/Remaining/Breakdown
  const hasStructuredLeak = /^\s*•\s*Budget:\s*₹/m.test(trim) && /^\s*•\s*Spent:\s*₹/m.test(trim) && /^\s*•\s*Remaining:/m.test(trim) && /^\s*•\s*Breakdown:/m.test(trim)
  const hasDataBlockLeak = /Budget:\s*₹?\s*\d[\d,]*\s*\|\s*Spent:/i.test(trim) && trim.includes("Breakdown:")

  if (!hasClassicLeak && !hasChatLeak && !hasStructuredLeak && !hasDataBlockLeak) {
    // also check for raw DATA pipe leak without headers
    // if it contains a lot of budget-like lines, still treat as leak if it also has User Question
    const isQuestionLeak = /User Question:/i.test(trim) && /Breakdown:/i.test(trim)
    if (!isQuestionLeak) return trim
  }

  console.warn("[Gemini] Leak detected, sanitizing")

  // Try to extract from first meaningful heading
  const idxSummary = trim.search(/##\s*Summary/i)
  if (idxSummary !== -1) return trim.slice(idxSummary).trim()

  const idxHealth = trim.search(/Health Score|Top Overspending|Action Plan|Saving Target/i)
  if (idxHealth !== -1) {
    const cut = Math.max(0, trim.lastIndexOf("\n", idxHealth - 40))
    const candidate = trim.slice(cut).trim()
    if (candidate.length > 80) return candidate
  }

  // Remove leaked bullet block
  const lines = trim.split("\n")
  const filtered = lines.filter(l => {
    const t = l.trim()
    // Remove prompt-like lines
    if (/^(Role:|Inputs:|Monthly Budget:|Total Spent:|Remaining:|Breakdown:|Recent Expenses:|Constraints:|Tasks:)/i.test(t)) return false
    if (/^\d+\.\s+(Health Score|Top 2-3|4 highly|Realistic saving|Tone:|Format:|Max words:|Logic checks:)/i.test(t)) return false
    if (/^•\s*(User Question|Context\s*\(?DATA\)?|Budget|Spent|Remaining|Breakdown):/i.test(t)) return false
    if (/^(User Question|Context\s*\(?DATA\)?|Hidden DATA|DATA:)/i.test(t)) return false
    if (/^Budget:\s*₹?\s*\d/i.test(t) && lines.some(x=>/Spent:/i.test(x)) && lines.some(x=>/Remaining:/i.test(x))) {
      // if this is part of a 4-line budget block, remove it
      return false
    }
    return true
  })
  const out = filtered.join("\n").trim()
  // If filtered removed too much, fall back to tail after last leaked line
  if (out.length < 40) {
    const lastLeakIdx = Math.max(trim.lastIndexOf("Breakdown:"), trim.lastIndexOf("Remaining:"), trim.lastIndexOf("Context (DATA):"))
    if (lastLeakIdx !== -1) return trim.slice(lastLeakIdx + 40).trim()
  }
  return out || trim
}

export async function getGeminiAdvice(apiKey: string, totalBalance: number, expenses: Expense[], currency: string, preferredModel?: string) {
  return getGeminiSummary(apiKey, totalBalance, expenses, currency, preferredModel)
}

export async function getGeminiSummary(apiKey: string, totalBalance: number, expenses: Expense[], currency: string, preferredModel?: string) {
  if (!apiKey) throw new Error("API key missing. Paste your Gemini key from aistudio.google.com")
  apiKey = apiKey.trim()
  const prompt = buildSummaryPrompt(totalBalance, expenses, currency)
  const systemInstruction = buildSummarySystem(totalBalance, expenses, currency)
  try {
    const text = await tryWithSDK(apiKey, prompt, systemInstruction, preferredModel)
    const cleaned = sanitize(text)
    // If still looks like a leak, try one more time with stricter instruction
    if (cleaned.includes("User Question:") || cleaned.includes("Context (DATA):")) {
      return sanitize(cleaned)
    }
    return cleaned
  } catch (error: unknown) {
    let msg = getErrorMessage(error, "Gemini request failed")
    msg = msg.replace(/\[GoogleGenerativeAI Error\]:/g, "").trim()
    const parsedMessage = parseApiErrorMessage(msg)
    if (parsedMessage) msg = parsedMessage
    const jsonMatch = msg.match(/\{.*"error".*\}/)
    if (jsonMatch) {
      const nestedMessage = parseApiErrorMessage(jsonMatch[0])
      if (nestedMessage) msg = nestedMessage
    }
    if (msg.includes("API_KEY_INVALID") || msg.toLowerCase().includes("api key not valid") || msg.toLowerCase().includes("api key is invalid")) {
      throw new Error("Invalid API key. Get a fresh key at https://aistudio.google.com/app/apikey -> Create API key -> copy without spaces.")
    }
    if (msg.toLowerCase().includes("generative language api has not been used") || msg.toLowerCase().includes("is not enabled") || msg.toLowerCase().includes("service is not enabled")) {
      throw new Error("Generative Language API is not enabled for this key's project. Enable it at https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com -> Enable, or create a brand new key at aistudio.google.com (it auto-enables).")
    }
    if (msg.includes("403") && msg.toLowerCase().includes("key")) {
      throw new Error("API key rejected (403). Check if key is restricted by HTTP referrer/IP at https://console.cloud.google.com/apis/credentials -> remove restrictions or create unrestricted key.")
    }
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("resource exhausted") || msg.toLowerCase().includes("exhausted")) {
      throw new Error("Quota exceeded. Gemini free tier limit hit. Wait 60s and retry, or check https://aistudio.google.com > Usage.")
    }
    if (msg.includes("404") || msg.includes("not found") || msg.includes("NOT_FOUND")) {
      if (msg.includes("No models were listed")) throw new Error(msg)
      throw new Error(
        "Model not found for this key/region. " +
          "We tried ListModels and all fallbacks. Common fixes: 1) Create a NEW key at aistudio.google.com (old keys lose v1 access), 2) Enable Generative Language API, 3) Remove key restrictions, 4) Try again in 5 seconds. Details: " +
          msg.slice(0, 250)
      )
    }
    throw new Error(msg)
  }
}

export type ChatMessage = { role: "user" | "assistant"; text: string }

export async function chatWithGemini(apiKey: string, totalBalance: number, expenses: Expense[], currency: string, history: ChatMessage[], userQuestion: string, preferredModel?: string) {
  if (!apiKey) throw new Error("API key missing")
  apiKey = apiKey.trim()
  if (!userQuestion.trim()) throw new Error("Empty question")
  const prompt = buildChatPrompt(totalBalance, expenses, currency, history, userQuestion)
  const systemInstruction = buildChatSystem(totalBalance, expenses, currency)
  const text = await tryWithSDK(apiKey, prompt, systemInstruction, preferredModel)
  return sanitize(text)
}

export async function validateGeminiKey(apiKey: string) {
  apiKey = apiKey.trim()
  if (!apiKey) throw new Error("API key missing")
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1" })
    const res = await model.generateContent("ping - reply with pong")
    return !!res.response.text()
  } catch {
    try {
      const text = await tryWithRest(apiKey, "gemini-2.0-flash", "v1", "ping", undefined, {})
      return Boolean(text)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Invalid key"))
    }
  }
}
