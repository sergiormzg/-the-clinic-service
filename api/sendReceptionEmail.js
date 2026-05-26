export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Metodo no permitido' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = 'recepcion@theclinicmadero.com';

    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'Falta RESEND_API_KEY' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = String(body.to || body.email || body.correo || '').trim();

    if (!to || !to.includes('@')) {
      return res.status(400).json({ ok: false, error: 'Correo invalido', received: { to } });
    }

    const folio = String(body.folio || 'Sin folio');
    const cliente = String(body.cliente || 'Cliente');
    const equipo = [body.tipo, body.marca, body.modelo].filter(Boolean).join(' ') || 'equipo';
    const documentUrl = String(body.documentUrl || '');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `The Clinic <${fromEmail}>`,
        to,
        subject: `Recepción de equipo ${folio} - The Clinic`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.45;color:#111">
            <h2>The Clinic Laptop's & PC's</h2>
            <p>Hola <b>${escapeHtml(cliente)}</b>, tu equipo quedó registrado correctamente.</p>
            <p><b>Folio:</b> ${escapeHtml(folio)}</p>
            <p><b>Equipo:</b> ${escapeHtml(equipo)}</p>
            ${documentUrl ? `<p><a href="${escapeAttr(documentUrl)}">Ver documento de recepción</a></p>` : ''}
          </div>
        `
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.message || data?.error || 'Resend error',
        details: data
      });
    }

    return res.status(200).json({ ok: true, id: data.id || null });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Error interno' });
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
