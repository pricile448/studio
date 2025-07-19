// lib/mail.ts
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

export async function sendVerificationCodeEmail(to: string, code: string) {
  const domain = process.env.MAILGUN_DOMAIN!;
  const message = {
    from: 'MonApp <noreply@tondomaine.com>',
    to,
    subject: 'Votre code de vérification',
    text: `Voici votre code de vérification : ${code}`,
  };

  await mg.messages.create(domain, message);
}
