export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RECEPTION_FROM_EMAIL;

    if (!apiKey) return res.status(500).json({ ok: false, error: 'Falta RESEND_API_KEY en Vercel.' });
    if (!fromEmail) return res.status(500).json({ ok: false, error: 'Falta RECEPTION_FROM_EMAIL en Vercel.' });

    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = String(data.correo || '').trim();
    if (!to) return res.status(400).json({ ok: false, error: 'Falta correo del cliente.' });

    const folio = String(data.folio || 'Sin folio');
    const cliente = String(data.cliente || 'Cliente');
    const equipo = [data.tipo, data.marca, data.modelo].filter(Boolean).join(' ') || 'equipo';
    const documentUrl = String(data.documentUrl || '');
    const business = data.business || {};
    const phone = business.phoneRaw || business.phone || '8331055266';

    const subject = `Recepción de equipo ${folio} - The Clinic`;
    const text = `Saludos, ${cliente}:\n\nTu dispositivo ${equipo} con folio ${folio} ya llegó a nuestro taller. Lo mantendremos bajo nuestro resguardo mientras realizamos el diagnóstico correspondiente. En cuanto tengamos los resultados, nos comunicaremos contigo para informarte los detalles y los siguientes pasos.\n\nContacto: ${phone}${documentUrl ? `\nDescarga aquí tu hoja de recepción: ${documentUrl}` : ''}\n\nAtentamente,\nCentro de Servicio The Clinic Laptop's & PC's\nIng. Sergio Venustiano Ramirez Garnica`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111;max-width:720px">
        <h2 style="color:#087c20;margin-bottom:4px">The Clinic Laptop's & PC's</h2>
        <p>Saludos, <b>${escapeHtml(cliente)}</b>:</p>
        <p>¡Listo! Tu dispositivo <b>${escapeHtml(equipo)}</b> con folio <b>${escapeHtml(folio)}</b> ya llegó a nuestro taller.</p>
        <p>Lo mantendremos bajo nuestro resguardo mientras realizamos el diagnóstico correspondiente. En cuanto tengamos los resultados, nos comunicaremos contigo para informarte los detalles y los siguientes pasos.</p>
        <p>Agradecemos tu preferencia. Si tienes preguntas o necesitas atención personalizada, puedes contactarnos al <b>${escapeHtml(phone)}</b>${documentUrl ? ` &nbsp;|&nbsp; <a href="${escapeAttr(documentUrl)}" download="${escapeAttr(folio)}.pdf" style="color:#087c20">Descarga aquí tu hoja de recepción</a>` : ''}.</p>
        <p style="margin-top:22px">Atentamente,<br><b>Centro de Servicio The Clinic Laptop's & PC's</b></p>
        <p style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:22px;margin:8px 0 0;color:#111">Ing. Sergio Venustiano Ramirez Garnica</p>
      </div>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `The Clinic <${fromEmail}>`,
        to,
        subject,
        html,
        text
      })
    });

    const result = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      return res.status(resendRes.status).json({ ok: false, error: result?.message || result?.error || 'Resend rechazó el correo.', details: result });
    }

    return res.status(200).json({ ok: true, id: result.id || null });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Error interno enviando correo.' });
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
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#096;'); }
