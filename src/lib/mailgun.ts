import Mailgun from 'mailgun.js';
import formData from 'form-data';

// Types locaux pour les attachments
interface AttachmentData {
  filename: string;
  data: Buffer;
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachment?: AttachmentData[];
}

const mg = new Mailgun(formData);

export async function sendSupportEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('MAILGUN_API_KEY et MAILGUN_DOMAIN doivent être configurés');
  }

  const client = mg.client({
    username: 'api',
    key: apiKey,
  });

  // Préparer les données du message
  const messageData: any = {
    from: options.from,
    to: options.to,
    subject: options.subject,
  };

  if (options.text) {
    messageData.text = options.text;
  }

  if (options.html) {
    messageData.html = options.html;
  }

  if (options.attachment && options.attachment.length > 0) {
    messageData.attachment = options.attachment;
  }

  try {
    const result = await client.messages.create(domain, messageData);
    console.log('Email envoyé avec succès:', result.id);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

export type { AttachmentData, EmailOptions };