/**
 * @fileOverview This file re-exports the KYC submission flow.
 * It exists to resolve a module ambiguity between the .ts and .tsx files
 * with the same name. The actual logic is in `kyc-submission-flow.ts`.
 */
export * from './kyc-submission-flow.ts';
