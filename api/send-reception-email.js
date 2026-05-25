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

    const subject = `Recepción de equipo ${folio} - The Clinic`;
    const text = `Hola ${cliente},\n\nTu equipo ${equipo} quedó registrado con folio ${folio}.\n\nDocumento de recepción:\n${documentUrl}\n\nFalla reportada:\n${data.falla_reportada || '-'}\n\nEstado físico:\n${data.estado_fisico || '-'}\n\nAccesorios:\n${data.accesorios || '-'}\n\nCentro de Servicio The Clinic Laptop's & PC's\nWhatsApp: ${business.phoneRaw || business.phone || '8331055266'}\n${business.address || ''}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.45;color:#111">
        <h2 style="color:#087c20;margin-bottom:4px">The Clinic Laptop's & PC's</h2>
        <p>Hola <b>${escapeHtml(cliente)}</b>, tu equipo quedó registrado correctamente.</p>
        <table style="border-collapse:collapse;width:100%;max-width:680px">
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Folio</b></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(folio)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Equipo</b></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(equipo)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Falla reportada</b></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.falla_reportada || '-')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Estado físico</b></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.estado_fisico || '-')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Accesorios</b></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(data.accesorios || '-')}</td></tr>
        </table>
        ${documentUrl ? `<p><a href="${escapeAttr(documentUrl)}" style="display:inline-block;background:#087c20;color:white;padding:10px 14px;border-radius:6px;text-decoration:none;margin-top:16px">Ver documento de recepción</a></p>` : ''}
        <p style="margin-top:18px">WhatsApp: <b>${escapeHtml(business.phoneRaw || business.phone || '8331055266')}</b><br>${escapeHtml(business.address || '')}</p>
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
