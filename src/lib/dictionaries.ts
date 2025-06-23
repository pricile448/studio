
import 'server-only'

export type Locale = 'en' | 'fr';

const dictionaries = {
  en: {
    logo: 'AmCbunq',
    login: {
      title: 'Welcome Back!',
      description: 'Enter your credentials to access your account.',
      emailLabel: 'Email',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot password?',
      loginButton: 'Login',
      registerPrompt: "Don't have an account?",
      registerLink: 'Sign up',
    },
    register: {
      title: 'Create an Account',
      description: 'Sign up to start managing your finances.',
    },
    sidebar: {
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      iban: 'My IBAN',
      transfers: 'Transfers',
      cards: 'Cards',
      history: 'History',
      budgets: 'Budgets',
      settings: 'Settings',
      more: 'More',
      userMenu: {
        profile: 'Profile',
        billing: 'Billing',
        settings: 'Settings',
        logout: 'Log out',
      }
    },
    dashboard: {
      title: 'Dashboard',
      greeting: 'Hello',
      accountSummary: 'Account Summary',
      checkingAccount: 'Checking Account',
      savingsAccount: 'Savings Account',
      creditCard: 'Credit Card',
      recentTransactions: 'Recent Transactions',
      transaction: {
        description: 'Description',
        category: 'Category',
        date: 'Date',
        amount: 'Amount',
      },
      expenseChart: 'Expense Overview',
      aiAssistant: {
        title: 'AI Financial Assistant',
        description: 'Get personalized insights and recommendations based on your transaction history.',
        button: 'Get AI Insights',
        loading: 'Analyzing your finances...',
        insightsTitle: 'Your Financial Insights',
        overspendingAlert: 'Overspending Alert!',
        savingsAlert: 'Savings Opportunity!',
        noInsights: 'Could not generate insights at this time.'
      }
    },
    settings: {
      title: 'Settings',
      appearance: {
        title: 'Appearance',
        description: 'Customize the look and feel of your dashboard.',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',
        language: 'Language',
        languageEn: 'English',
        languageFr: 'French',
        saveButton: 'Save Changes'
      }
    },
    placeholders: {
      title: 'Coming Soon',
      description: 'This page is under construction. Check back later!',
    },
    notFound: {
      title: 'Oops! Page not found.',
      description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      button: 'Go to Homepage'
    }
  },
  fr: {
    logo: 'AmCbunq',
    login: {
      title: 'Content de te revoir!',
      description: 'Entrez vos identifiants pour accéder à votre compte.',
      emailLabel: 'E-mail',
      emailPlaceholder: 'nom@exemple.com',
      passwordLabel: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      loginButton: 'Connexion',
      registerPrompt: "Vous n'avez pas de compte ?",
      registerLink: "S'inscrire",
    },
    register: {
      title: 'Créer un Compte',
      description: 'Inscrivez-vous pour commencer à gérer vos finances.',
    },
    sidebar: {
      dashboard: 'Tableau de bord',
      accounts: 'Comptes',
      iban: 'Mon IBAN',
      transfers: 'Virements',
      cards: 'Cartes',
      history: 'Historique',
      budgets: 'Budgets',
      settings: 'Paramètres',
      more: 'Plus',
      userMenu: {
        profile: 'Profil',
        billing: 'Facturation',
        settings: 'Paramètres',
        logout: 'Déconnexion',
      }
    },
    dashboard: {
      title: 'Tableau de bord',
      greeting: 'Bonjour',
      accountSummary: 'Résumé des comptes',
      checkingAccount: 'Compte Courant',
      savingsAccount: 'Compte Épargne',
      creditCard: 'Carte de Crédit',
      recentTransactions: 'Transactions Récentes',
      transaction: {
        description: 'Description',
        category: 'Catégorie',
        date: 'Date',
        amount: 'Montant',
      },
      expenseChart: 'Aperçu des Dépenses',
      aiAssistant: {
        title: 'Assistant Financier IA',
        description: 'Obtenez des informations et des recommandations personnalisées basées sur votre historique de transactions.',
        button: 'Obtenir des conseils IA',
        loading: 'Analyse de vos finances...',
        insightsTitle: 'Vos Perspectives Financières',
        overspendingAlert: 'Alerte de Dépassement !',
        savingsAlert: 'Opportunité d\'Épargne !',
        noInsights: 'Impossible de générer des informations pour le moment.'
      }
    },
    settings: {
      title: 'Paramètres',
      appearance: {
        title: 'Apparence',
        description: 'Personnalisez l\'apparence de votre tableau de bord.',
        theme: 'Thème',
        themeLight: 'Clair',
        themeDark: 'Sombre',
        themeSystem: 'Système',
        language: 'Langue',
        languageEn: 'Anglais',
        languageFr: 'Français',
        saveButton: 'Enregistrer'
      }
    },
    placeholders: {
      title: 'Bientôt Disponible',
      description: 'Cette page est en cours de construction. Revenez plus tard !',
    },
    notFound: {
      title: 'Oups! Page introuvable.',
      description: 'La page que vous recherchez a peut-être été supprimée, a changé de nom ou est temporairement indisponible.',
      button: "Retour à l'accueil"
    }
  }
} as const;


export const getDictionary = (locale: Locale) => {
    return dictionaries[locale] ?? dictionaries.en;
};

export type Dictionary = ReturnType<typeof getDictionary>;
