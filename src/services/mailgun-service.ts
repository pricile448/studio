
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
const API_HOST = process.env.MAILGUN_API_HOST; // e.g. 'https://api.eu.mailgun.net' for EU region

// For sandbox domains, FROM_EMAIL is not required as it's constructed automatically.
const isSandbox = DOMAIN?.startsWith('sandbox');
if (!API_KEY || !DOMAIN || (!FROM_EMAIL && !isSandbox)) {
  console.warn(
    'Mailgun environment variables (MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM_EMAIL for non-sandbox) are not set. Email functionality will be disabled.'
  );
}

const mg = API_KEY && DOMAIN ? mailgun.client({
    username: 'api',
    key: API_KEY,
    url: API_HOST,
}) : null;

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({to, subject, text, html}: EmailParams): Promise<void> {
  if (!mg || !DOMAIN) {
    console.error('Mailgun client not initialized. Cannot send email.');
    throw new Error('Mailgun client not initialized. Check server environment variables.');
  }
  
  // For sandbox domains, Mailgun requires a very specific "from" format which we can construct automatically.
  // For custom domains, we use the FROM_EMAIL from the environment variables.
  const fromAddress = isSandbox
    ? `Mailgun Sandbox <postmaster@${DOMAIN}>`
    : FROM_EMAIL;

  if (!fromAddress) {
    const errorMsg = 'Mailgun "from" address is not configured. For non-sandbox domains, set MAILGUN_FROM_EMAIL in your .env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const messageData = {
    from: fromAddress,
    to,
    subject,
    text,
    html,
  };
  
  // Log the data being sent for easier debugging
  console.log('--- Sending email with data: ---');
  console.log(JSON.stringify(messageData, null, 2));
  console.log('---------------------------------');

  try {
    const result = await mg.messages.create(DOMAIN, messageData);
    console.log('Email sent successfully via Mailgun:', result);
  } catch (error: any) {
    console.error('Error sending email with Mailgun:', error);
    // The mailgun.js library returns a detailed error object.
    // The 'details' property often contains the most useful information.
    const errorMessage = error.details || error.message || 'Failed to send email.';
    throw new Error(errorMessage);
  }
}
