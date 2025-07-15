import formData from 'form-data';
import Mailgun from 'mailgun.js';

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: process.env.MAILGUN_API_HOST || 'https://api.mailgun.net',
});

export async function sendSupportEmail(options: EmailOptions): Promise<any> {
  const domain = process.env.MAILGUN_DOMAIN;

  if (!domain) {
    throw new Error('MAILGUN_DOMAIN environment variable is not set.');
  }

  try {
    const result = await mg.messages.create(domain, options);
    console.log('Email sent successfully via Mailgun:', result);
    return result;
  } catch (error) {
    console.error('Mailgun API Error:', error);
    throw error;
  }
}
