export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { nombre, correo, whatsapp } = req.body || {};

  if (!nombre || !correo || !whatsapp) {
    res.status(400).json({ error: 'missing fields' });
    return;
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = 13;
  const SENDER = { name: 'Mujer Alquímica Digital', email: 'info@mujeralquimicadigital.com' };
  const WHATSAPP_LINK = 'https://chat.whatsapp.com/IbuUzVOAJ68Fm1FILClHI0';

  try {
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: correo,
        attributes: { NOMBRE: nombre, SMS: whatsapp },
        listIds: [LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!contactRes.ok && contactRes.status !== 400) {
      const errText = await contactRes.text();
      throw new Error('brevo contact error: ' + errText);
    }

    const firstName = nombre.split(' ')[0];

    const welcomeHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background-color:#f5f0e8; font-family: 'Raleway', Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#fdfaf5; max-width:600px; width:100%; border-radius:12px; overflow:hidden;">
<tr><td>
<img src="https://raw.githubusercontent.com/MujerAlquimicaDigital/mad-email-assets/main/cabezote-email-newsletter.png" alt="Mujer Alquímica Digital" width="600" style="display:block; width:100%; max-width:600px; height:auto;">
</td></tr>
<tr><td style="padding:40px 32px; font-family:'Raleway', Arial, sans-serif; color:#3a2c22; font-size:16px; line-height:1.65;">
<p style="margin:0 0 8px 0; font-size:22px; font-family: Georgia, serif; color:#7a3c28;">Ya eres parte de la comunidad 🌙</p>
<p style="margin:24px 0 18px 0;">Hola ${firstName},</p>
<p style="margin:0 0 18px 0;">Gracias por unirte al newsletter de Mujer Alquímica Digital.</p>
<p style="margin:0 0 18px 0;">Cada semana vas a recibir un correo nuestro con contenido real &mdash; somático, estructura, mensaje, astrología, análisis de casos, y más &mdash; pensado para darte claridad, no para llenarte la bandeja de relleno.</p>
<p style="margin:0 0 18px 0;">Y como una semana a veces es mucho tiempo para esperar, también queremos invitarte a la comunidad de WhatsApp &mdash; ahí compartimos en el momento, entre correo y correo. Es gratuita, y eso no la hace menos valiosa: se nutre con contenido real.</p>
<p style="text-align:center; margin:28px 0;">
<a href="${WHATSAPP_LINK}" target="_blank" style="background-color:#9e5038; color:#fdfaf5; text-decoration:none; font-family:'Raleway', Arial, sans-serif; font-size:16px; font-weight:600; padding:15px 30px; border-radius:8px; display:inline-block;">Únete a la comunidad</a>
</p>
<p style="margin:24px 0 0 0;">Con cariño,<br>Mimi &amp; Ale</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: correo, name: nombre }],
        subject: 'Ya eres parte de la comunidad 🌙',
        htmlContent: welcomeHtml,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error('brevo email error: ' + errText);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
}
