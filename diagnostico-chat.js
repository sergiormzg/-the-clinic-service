export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Falta OPENAI_API_KEY en Vercel Environment Variables' })
    const { mode = 'chat', context = '', messages = [], images = [] } = req.body || {}
    const system = mode === 'final'
      ? 'Eres copiloto técnico para un taller de laptops y PCs. Genera un diagnóstico profesional para cliente en español. Usa SOLO la información de recepción, conversación, mediciones e imágenes. Estructura: Resumen, Pruebas realizadas, Mediciones relevantes, Evidencia, Diagnóstico técnico, Recomendación, Notas para cliente. No inventes mediciones ni costos.'
      : 'Eres copiloto experto en diagnóstico de laptops y PCs. Ayuda paso a paso al técnico. Sé práctico: pide mediciones concretas, sugiere puntos de revisión, interpreta síntomas, fotos y esquemas. No inventes certezas; diferencia causa probable de causa confirmada.'
    const content = [
      { type: 'text', text: `Contexto de recepción:\n${context}\n\nModo: ${mode}` },
      ...((images || []).slice(0, 4).map(img => ({ type: 'image_url', image_url: { url: img.url } })))
    ]
    const body = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content },
        ...messages.slice(-20).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }))
      ],
      temperature: 0.25
    }
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || 'Error de OpenAI' })
    return res.status(200).json({ text: data.choices?.[0]?.message?.content || '' })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno' })
  }
}
