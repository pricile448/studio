
import { z } from 'zod';

const FileAttachmentSchema = z.object({
  filename: z.string(),
  data: z.string(), // Base64 encoded data URI
});

// KYC Submission Flow
export const KycEmailInputSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  idDocument: FileAttachmentSchema,
  proofOfAddress: FileAttachmentSchema,
  selfie: FileAttachmentSchema,
});
export type KycEmailInput = z.infer<typeof KycEmailInputSchema>;

export const KycSubmissionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});
export type KycSubmissionResult = z.infer<typeof KycSubmissionResultSchema>;

// Contact Support Flow
export const ContactSupportInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  subject: z.string().describe('The subject of the support request.'),
  message: z.string().describe('The content of the support message.'),
});
export type ContactSupportInput = z.infer<typeof ContactSupportInputSchema>;

export const ContactSupportResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});
export type ContactSupportResult = z.infer<typeof ContactSupportResultSchema>;

// Admin Dashboard Data Flow
export const AdminDashboardDataSchema = z.object({
    stats: z.object({
        totalUsers: z.number(),
        pendingKyc: z.number(),
        approvedKyc: z.number(),
        rejectedKyc: z.number(),
    }),
    recentActivity: z.array(z.object({
        id: z.string(),
        type: z.enum(['user', 'kyc']),
        timestamp: z.string(), // ISO 8601 string
        data: z.any(),
    })),
    admins: z.array(z.any()),
});
export type AdminDashboardData = z.infer<typeof AdminDashboardDataSchema>;

export const AdminDashboardDataResultSchema = z.object({
    success: z.boolean(),
    data: AdminDashboardData.optional(),
    error: z.string().optional(),
});
export type AdminDashboardDataResult = z.infer<typeof AdminDashboardDataResultSchema>;
