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
    const business = body.business || {};
    const phone = business.phoneRaw || business.phone || '8331055266';

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
          <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111;max-width:720px">
            <h2 style="color:#087c20;margin-bottom:4px">The Clinic Laptop's & PC's</h2>
            <p>Saludos, <b>${escapeHtml(cliente)}</b>:</p>
            <p>¡Listo! Tu dispositivo <b>${escapeHtml(equipo)}</b> con folio <b>${escapeHtml(folio)}</b> ya llegó a nuestro taller.</p>
            <p>Lo mantendremos bajo nuestro resguardo mientras realizamos el diagnóstico correspondiente. En cuanto tengamos los resultados, nos comunicaremos contigo para informarte los detalles y los siguientes pasos.</p>
            <p>Agradecemos tu preferencia. Si tienes preguntas o necesitas atención personalizada, puedes contactarnos al <b>${escapeHtml(phone)}</b>${documentUrl ? ` &nbsp;|&nbsp; <a href="${escapeAttr(documentUrl)}" download="${escapeAttr(folio)}.pdf">Descarga aquí tu hoja de recepción</a>` : ''}.</p>
            <p style="margin-top:22px">Atentamente,<br><b>Centro de Servicio The Clinic Laptop's & PC's</b></p>
            <p style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:22px;margin:8px 0 0;color:#111">Ing. Sergio Venustiano Ramirez Garnica</p>
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
