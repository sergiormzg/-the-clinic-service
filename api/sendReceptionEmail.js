export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Metodo no permitido' });
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RECEPTION_FROM_EMAIL;
    if (!apiKey) return res.status(500).json({ ok:false, error:'Falta RESEND_API_KEY' });
    if (!fromEmail) return res.status(500).json({ ok:false, error:'Falta RECEPTION_FROM_EMAIL' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = String(body.to || body.email || body.correo || '').trim();
    if (!to.includes('@')) return res.status(400).json({ ok:false, error:'Correo invalido' });
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from:`The Clinic <${fromEmail}>`, to, subject:'The Clinic - Recepcion', html:'<h2>The Clinic</h2><p>Recepcion registrada.</p>' })
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) return res.status(response.status).json({ ok:false, error:data?.message || 'Resend error' });
    return res.status(200).json({ ok:true, id:data.id || null });
  } catch(e) {
    return res.status(500).json({ ok:false, error:e.message || 'Error interno' });
  }
}
