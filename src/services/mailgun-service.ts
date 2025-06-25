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
const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;
const API_HOST = process.env.MAILGUN_API_HOST; // e.g., 'https://api.eu.mailgun.net' for EU region

if (!API_KEY || !DOMAIN || !FROM_EMAIL || !ADMIN_EMAIL) {
  console.warn(
    'Mailgun environment variables are not fully set. Email functionality will be disabled.'
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
  attachment?: {
    data: Buffer;
    filename: string;
  }[];
}

export async function sendEmail({to, subject, text, html, attachment}: EmailParams): Promise<void> {
  if (!mg || !DOMAIN || !FROM_EMAIL) {
    const errorMsg = 'Mailgun client not initialized. Check server environment variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const messageData: any = {
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };
  
  if (attachment) {
    messageData.attachment = attachment;
  }

  // Log the data being sent for easier debugging
  console.log('--- Sending email with data: ---');
  console.log('Using API Host:', API_HOST);
  // Don't log attachments as they can be large
  const loggableData = { ...messageData };
  if (loggableData.attachment) {
      loggableData.attachment = `${loggableData.attachment.length} file(s) attached.`;
  }
  console.log(JSON.stringify(loggableData, null, 2));
  console.log('---------------------------------');

  try {
    const result = await mg.messages.create(DOMAIN, messageData);
    console.log('Email sent successfully via Mailgun:', result);
  } catch (error: any) {
    console.error('Error sending email with Mailgun:', error);
    // Log all available error properties to get maximum context.
    console.error('Mailgun Error Status:', error.status);
    console.error('Mailgun Error Details:', error.details);
    console.error('Mailgun Error Body:', error.body);
    
    // The mailgun.js library returns a detailed error object.
    // The 'details' property often contains the most useful information.
    const errorMessage = error.details || error.message || 'Failed to send email.';
    throw new Error(errorMessage);
  }
}
