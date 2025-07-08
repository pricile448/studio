
import { config } from 'dotenv';
config();

import '@/ai/flows/financial-insights.ts';
import '@/ai/flows/contact-support-flow.ts';
import '@/ai/flows/kyc-submission-flow.ts';
import '@/ai/flows/get-admin-dashboard-data-flow.ts';
import '@/ai/flows/send-verification-code-flow.ts';
import '@/ai/flows/verify-email-code-flow.ts';
import '@/ai/flows/create-user-document-flow.ts';
