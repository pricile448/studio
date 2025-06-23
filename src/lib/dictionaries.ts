
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
    accounts: {
      title: 'My Accounts',
      addAccount: 'Add Account',
      details: 'View Details',
      checking: 'Checking Account',
      savings: 'Savings Account',
      credit: 'Credit Card',
    },
    transfers: {
      title: 'Make a Transfer',
      newTransfer: 'New Transfer',
      newTransferDescription: 'Send money to any bank account.',
      from: 'From',
      selectAccount: 'Select an account',
      to: 'To (IBAN / Recipient)',
      toPlaceholder: 'FR76...',
      amount: 'Amount',
      description: 'Description (optional)',
      descriptionPlaceholder: 'e.g., Rent payment',
      submit: 'Send Transfer',
      recentTransfers: 'Recent Transfers',
      noRecentTransfers: 'No recent transfers found.',
    },
    cards: {
      title: 'My Cards',
      orderCard: 'Order a New Card',
      cardBankName: 'AmCbunq Bank',
      cardHolder: 'Card Holder',
      validThru: 'Valid Thru',
      settings: 'Card Settings',
      settingsDescription: 'Manage your card settings and security.',
      freeze: 'Freeze Card',
      freezeDescription: 'Temporarily block your card.',
      setLimit: 'Set Spending Limits',
      setLimitDescription: 'Control your monthly spending.',
      viewPin: 'View PIN',
      viewPinDescription: 'Securely view your card PIN.',
    },
    history: {
      title: 'Transaction History',
      filters: 'Filters',
      dateRange: 'Select a date range',
      transactionType: 'Transaction Type',
      all: 'All',
      income: 'Income',
      expense: 'Expense',
      applyFilters: 'Apply Filters',
      noTransactions: 'No transactions found for the selected period.',
      table: {
        date: 'Date',
        description: 'Description',
        category: 'Category',
        status: 'Status',
        amount: 'Amount',
        statuses: {
          completed: 'Completed',
          pending: 'Pending',
          failed: 'Failed',
        }
      }
    },
    budgets: {
      title: 'My Budgets',
      createBudget: 'Create Budget',
      spentOf: 'Spent {spent} of {total}',
      groceries: 'Groceries',
      transport: 'Transport',
      entertainment: 'Entertainment',
    },
    iban: {
      title: 'My IBAN Details',
      description: 'Use these details to receive money from other accounts.',
      accountDetails: 'Account Details',
      accountHolder: 'Account Holder',
      iban: 'IBAN',
      bic: 'BIC / SWIFT',
      copy: 'Copy',
      copied: 'Copied!',
      copiedDescription: 'has been copied to your clipboard.',
    },
    more: {
      title: 'More Options',
      help: 'Help & Support',
      documents: 'Documents',
      exchange: 'Currency Exchange',
      referrals: 'Refer a Friend',
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
      title: 'Content de vous revoir !',
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
    accounts: {
      title: 'Mes Comptes',
      addAccount: 'Ajouter un compte',
      details: 'Voir les détails',
      checking: 'Compte Courant',
      savings: 'Compte Épargne',
      credit: 'Carte de Crédit',
    },
    transfers: {
      title: 'Effectuer un Virement',
      newTransfer: 'Nouveau Virement',
      newTransferDescription: 'Envoyez de l\'argent vers n\'importe quel compte bancaire.',
      from: 'Depuis',
      selectAccount: 'Sélectionner un compte',
      to: 'Vers (IBAN / Bénéficiaire)',
      toPlaceholder: 'FR76...',
      amount: 'Montant',
      description: 'Description (optionnel)',
      descriptionPlaceholder: 'ex: Loyer, facture...',
      submit: 'Envoyer le virement',
      recentTransfers: 'Virements Récents',
      noRecentTransfers: 'Aucun virement récent trouvé.',
    },
    cards: {
      title: 'Mes Cartes',
      orderCard: 'Commander une nouvelle carte',
      cardBankName: 'Banque AmCbunq',
      cardHolder: 'Titulaire',
      validThru: 'Expire fin',
      settings: 'Paramètres de la carte',
      settingsDescription: 'Gérez les paramètres et la sécurité de votre carte.',
      freeze: 'Bloquer la carte',
      freezeDescription: 'Bloquez temporairement votre carte.',
      setLimit: 'Définir les plafonds',
      setLimitDescription: 'Contrôlez vos dépenses mensuelles.',
      viewPin: 'Voir le code PIN',
      viewPinDescription: 'Consultez votre code PIN en toute sécurité.',
    },
    history: {
      title: 'Historique des Transactions',
      filters: 'Filtres',
      dateRange: 'Sélectionner une période',
      transactionType: 'Type de transaction',
      all: 'Toutes',
      income: 'Revenus',
      expense: 'Dépenses',
      applyFilters: 'Appliquer les filtres',
      noTransactions: 'Aucune transaction trouvée pour la période sélectionnée.',
      table: {
        date: 'Date',
        description: 'Description',
        category: 'Catégorie',
        status: 'Statut',
        amount: 'Montant',
        statuses: {
          completed: 'Terminé',
          pending: 'En attente',
          failed: 'Échoué',
        }
      }
    },
    budgets: {
      title: 'Mes Budgets',
      createBudget: 'Créer un budget',
      spentOf: 'Dépensé {spent} sur {total}',
      groceries: 'Courses',
      transport: 'Transport',
      entertainment: 'Loisirs',
    },
    iban: {
      title: 'Détails de mon IBAN',
      description: 'Utilisez ces informations pour recevoir de l\'argent.',
      accountDetails: 'Détails du compte',
      accountHolder: 'Titulaire du compte',
      iban: 'IBAN',
      bic: 'BIC / SWIFT',
      copy: 'Copier',
      copied: 'Copié !',
      copiedDescription: 'a été copié dans votre presse-papiers.',
    },
    more: {
      title: 'Plus d\'options',
      help: 'Aide & Support',
      documents: 'Documents',
      exchange: 'Change de devises',
      referrals: 'Parrainer un ami',
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
