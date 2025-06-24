'use server';
/**
 * @fileOverview Mailgun email sending service.
 * This file exports a function to send emails using the Mailgun API.
 */

import Mailgun from 'mailgun.js';
import formData from 'form-data';

// The mailgun.js library requires form-data
const mailgun = new Mailgun(formData);

const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

if (!API_KEY || !DOMAIN || !FROM_EMAIL) {
  console.warn(
    'Mailgun environment variables (MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL) are not set. Email functionality will be disabled.'
  );
}

const mg = API_KEY ? mailgun.client({username: 'api', key: API_KEY}) : null;

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({to, subject, text, html}: EmailParams): Promise<void> {
  if (!mg || !DOMAIN || !FROM_EMAIL) {
    console.error('Mailgun client not initialized. Cannot send email.');
    // In a real app, you might want to throw an error or handle this differently.
    // For this prototype, we will just log the error and do nothing.
    return;
  }

  const messageData = {
    from: `AmCbunq Support <${FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const result = await mg.messages.create(DOMAIN, messageData);
    console.log('Email sent successfully via Mailgun:', result);
  } catch (error) {
    console.error('Error sending email with Mailgun:', error);
    throw new Error('Failed to send email.');
  }
}
