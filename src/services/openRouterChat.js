import { OPENROUTER_MODELS } from '../config/openrouterModels.js'

export const OPENROUTER_MODEL = OPENROUTER_MODELS[0]
export const OPENROUTER_MODEL_LABEL = `${OPENROUTER_MODEL} + fallback`

const endpoint = 'https://openrouter.ai/api/v1/chat/completions'
const systemMessage = {
  role: 'system',
  content:
    'You are a focused AI learning assistant. Be clear, practical, and concise. Use Markdown when it improves readability.',
}

function readApiKey() {
  return import.meta.env.VITE_OPENROUTER_API_KEY?.trim()
}

function logOpenRouterDebug(label, payload) {
  console.debug(`[OpenRouter] ${label}`, payload)
}

export class OpenRouterError extends Error {
  constructor(message, { type = 'unknown', status = null, model = null, userMessage = null } = {}) {
    super(message)
    this.name = 'OpenRouterError'
    this.type = type
    this.status = status
    this.model = model
    this.userMessage = userMessage || message
  }
}

function classifyOpenRouterError(message, status, model) {
  const lower = String(message || '').toLowerCase()

  if (status === 401 || status === 403 || lower.includes('api key') || lower.includes('auth')) {
    return {
      type: 'invalid_api_key',
      userMessage: `OpenRouter rejected the API key. Check VITE_OPENROUTER_API_KEY and restart the app. OpenRouter said: ${message}`,
    }
  }

  if (status === 429 || lower.includes('rate limit') || lower.includes('too many requests')) {
    return {
      type: 'rate_limited',
      userMessage: `OpenRouter is rate limiting requests right now. OpenRouter said: ${message}`,
    }
  }

  if (
    status === 404 ||
    lower.includes('no endpoints found') ||
    lower.includes('model unavailable') ||
    lower.includes('not available') ||
    lower.includes('no provider')
  ) {
    return {
      type: 'model_unavailable',
      userMessage: model
        ? `${model} is unavailable on OpenRouter. OpenRouter said: ${message}`
        : `The selected OpenRouter model is unavailable. OpenRouter said: ${message}`,
    }
  }

  return {
    type: 'unknown',
    userMessage: `OpenRouter could not complete the response. OpenRouter said: ${message}`,
  }
}

function makeOpenRouterError(message, { status = null, model = null } = {}) {
  const numericStatus = Number(status)
  const normalizedStatus = Number.isFinite(numericStatus) ? numericStatus : status
  const classified = classifyOpenRouterError(message, normalizedStatus, model)
  return new OpenRouterError(message, {
    type: classified.type,
    status: normalizedStatus,
    model,
    userMessage: classified.userMessage,
  })
}

export function getOpenRouterUserMessage(error) {
  if (error?.name === 'AbortError') return ''
  if (error instanceof OpenRouterError) return error.userMessage
  return error?.message || 'The assistant could not respond. Check your connection and try again.'
}

async function readErrorResponse(response, model) {
  let message = `OpenRouter request failed (${response.status}).`
  let raw = ''
  try {
    raw = await response.text()
    logOpenRouterDebug('raw error response', {
      model,
      status: response.status,
      statusText: response.statusText,
      body: raw,
    })
    const json = JSON.parse(raw)
    message = json?.error?.message || json?.message || message
  } catch {
    message = raw || message
  }
  throw makeOpenRouterError(message, { status: response.status, model })
}

function parseDataLine(line, model) {
  const raw = line.slice('data:'.length).trim()
  logOpenRouterDebug('raw stream data line', { model, raw })
  if (!raw || raw === '[DONE]') return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new OpenRouterError(err?.message || 'Could not parse OpenRouter stream chunk.', {
      type: 'parse',
      model,
      userMessage: `Could not parse OpenRouter response. Raw chunk: ${raw}`,
    })
  }
}

async function streamOneModel({ model, messages, onToken, signal }) {
  const apiKey = readApiKey()
  logOpenRouterDebug('api key check', {
    loaded: Boolean(apiKey),
    length: apiKey?.length ?? 0,
    startsWithSkOr: apiKey?.startsWith('sk-or-') ?? false,
  })
  if (!apiKey) {
    throw new OpenRouterError('Missing VITE_OPENROUTER_API_KEY.', {
      type: 'invalid_api_key',
      userMessage: 'Missing VITE_OPENROUTER_API_KEY. Add it to your .env file and restart Vite.',
    })
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Learning Dashboard',
  }
  const requestBody = {
    model,
    stream: true,
    messages: [systemMessage, ...messages.map(({ role, content }) => ({ role, content }))],
  }

  logOpenRouterDebug('attempting model', { model })
  logOpenRouterDebug('request headers', {
    ...headers,
    Authorization: `Bearer ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
  })
  logOpenRouterDebug('request body', {
    ...requestBody,
    messages: requestBody.messages.map((message) => ({
      role: message.role,
      contentLength: message.content.length,
    })),
  })

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      signal,
      headers,
      body: JSON.stringify(requestBody),
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new OpenRouterError(err?.message || 'Network request failed.', {
      type: 'network',
      model,
      userMessage: 'Could not reach OpenRouter. Check your internet connection and try again.',
    })
  }

  logOpenRouterDebug('response metadata', {
    model,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
  })

  if (!response.ok) {
    await readErrorResponse(response, model)
  }

  if (!response.body) {
    throw new OpenRouterError('OpenRouter did not return a readable stream.', {
      model,
      userMessage: 'OpenRouter did not start a response stream. Please try again.',
    })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalText = ''

  function handleLine(line) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data:')) return

    const chunk = parseDataLine(trimmed, model)
    if (!chunk) return

    if (chunk.error) {
      throw makeOpenRouterError(chunk.error.message || 'OpenRouter stream failed.', {
        status: chunk.error.code ?? null,
        model,
      })
    }

    const token = chunk.choices?.[0]?.delta?.content ?? ''
    if (token) {
      finalText += token
      onToken?.(token)
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      handleLine(line)
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    handleLine(buffer)
  }
  logOpenRouterDebug('stream complete', { model, responseLength: finalText.length })

  return { text: finalText, model }
}

export async function streamOpenRouterChat({ messages, onToken, signal }) {
  let lastError = null
  const attempts = []

  logOpenRouterDebug('model attempt order', OPENROUTER_MODELS)

  for (const model of OPENROUTER_MODELS) {
    let tokenSeen = false
    try {
      const result = await streamOneModel({
        model,
        messages,
        signal,
        onToken: (token) => {
          tokenSeen = true
          onToken?.(token)
        },
      })
      return { ...result, fallbackUsed: model !== OPENROUTER_MODEL }
    } catch (err) {
      if (err?.name === 'AbortError') throw err
      lastError = err
      attempts.push({
        model,
        type: err?.type || 'unknown',
        status: err?.status ?? null,
        message: err?.message || String(err),
      })
      logOpenRouterDebug('model attempt failed', attempts.at(-1))
      if (err?.type === 'model_unavailable' && !tokenSeen) continue
      throw err
    }
  }

  if (lastError?.type === 'model_unavailable') {
    const detail = attempts.map((attempt) => `${attempt.model}: ${attempt.message}`).join('\n')
    throw new OpenRouterError('No OpenRouter models were available.', {
      type: 'model_unavailable',
      userMessage: `All configured OpenRouter models were unavailable.\n${detail}`,
    })
  }

  throw lastError || new OpenRouterError('No OpenRouter models were available.', {
    type: 'model_unavailable',
    userMessage: 'OpenRouter did not return a response from any attempted model. Check the console diagnostics for the exact request and response details.',
  })
}
