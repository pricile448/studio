// This file contains type definitions for the dictionaries

export interface LoginDictionary {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  forgotPassword: string;
  loginButton: string;
  registerPrompt: string;
  registerLink: string;
  backToHome: string;
  backToLogin: string;
  inactivityLogoutTitle: string;
  inactivityLogoutDescription: string;
}

export interface ForgotPasswordDictionary {
  title: string;
  description: string;
  submitButton: string;
  successTitle: string;
  successDescription: string;
  resetTitle: string;
  resetDescription: string;
  resetSubmitButton: string;
  passwordLengthError: string;
  passwordMismatchError: string;
  expiredLinkError: string;
  resetSuccessTitle: string;
  resetSuccessDescription: string;
  emailInvalid: string;
}

export interface Dictionary {
  login: LoginDictionary;
  forgotPassword: ForgotPasswordDictionary;
  // Add other dictionary sections as needed
  // This is a partial definition focusing on the login and forgotPassword sections
}