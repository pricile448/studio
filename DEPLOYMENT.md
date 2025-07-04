
# Feuille de Route pour le Déploiement de votre Application Next.js

Félicitations ! Votre application est fonctionnelle en développement. Ce guide vous aidera à la déployer sur un serveur de production.

## Comprendre la Nature de l'Application

Votre application est construite avec **Next.js**. Ce n'est pas un site web statique classique. C'est une **application Node.js** qui nécessite un environnement serveur capable d'exécuter du JavaScript côté serveur. C'est un point crucial pour le choix de votre hébergement.

---

### Étape 1 : Vérifier la Compatibilité de votre Hébergement

La plupart des hébergements "mutualisés" standards (basés sur cPanel, conçus pour PHP/WordPress) ne supportent pas les applications Node.js nativement. Vous devez vous assurer que votre hébergeur propose bien une offre compatible avec **Node.js**.

**Options d'hébergement :**

1.  **Recommandé : Firebase App Hosting**
    *   **Pourquoi ?** C'est la solution la plus simple et la plus intégrée pour un projet développé dans Firebase Studio. Votre projet contient déjà un fichier `apphosting.yaml` qui facilite ce déploiement. Il gère automatiquement le build, l'installation des dépendances et le démarrage du serveur.
    *   **Comment ?** Le déploiement se fait généralement via la console Firebase ou les commandes `firebase deploy`.

2.  **Autres plateformes modernes (Alternatives simples)**
    *   Des services comme **Vercel** (par les créateurs de Next.js), **Netlify**, ou **Render** sont spécialisés dans le déploiement d'applications comme la vôtre. Le processus est souvent aussi simple que de lier votre dépôt de code.

3.  **Hébergement Mutualisé (avec support Node.js)**
    *   Si votre hébergeur le permet, vous aurez accès à une interface pour configurer une application Node.js. Vous devrez spécifier le fichier de démarrage et la version de Node.js.

4.  **Serveur Privé Virtuel (VPS) (Option avancée)**
    *   Des services comme DigitalOcean, Linode, ou AWS EC2 vous donnent un contrôle total, mais vous êtes responsable de la configuration complète du serveur (installation de Node.js, Nginx, gestion de la sécurité, etc.).

---

### Étape 1.5 : Configurer les Identifiants du SDK Admin (OBLIGATOIRE POUR LE DASHBOARD ADMIN)

Certaines fonctionnalités, comme le tableau de bord administrateur, s'exécutent côté serveur et nécessitent des permissions élevées pour accéder à votre base de données. Pour cela, l'application utilise le SDK Admin de Firebase, qui doit être authentifié via un **compte de service**.

**Cette étape est cruciale, sinon le tableau de bord administrateur ne fonctionnera pas.**

1.  **Créez un compte de service :**
    *   Allez dans votre [console Firebase](https://console.firebase.google.com/).
    *   Sélectionnez votre projet.
    *   Cliquez sur l'icône en forme d'engrenage à côté de "Project Overview" et sélectionnez "Paramètres du projet".
    *   Allez dans l'onglet "Comptes de service".
    *   Cliquez sur le bouton "**Générer une nouvelle clé privée**". Un fichier JSON sera téléchargé.

2.  **Configurez la variable d'environnement :**
    *   Ouvrez le fichier JSON que vous venez de télécharger.
    *   Copiez **l'intégralité du contenu** de ce fichier.
    *   Sur votre plateforme d'hébergement (ou dans votre fichier `.env` pour le développement local), créez une nouvelle variable d'environnement nommée `SERVICE_ACCOUNT_JSON`.
    *   Collez l'intégralité du contenu JSON comme valeur pour cette variable.

**Exemple dans le fichier `.env` :**
```
SERVICE_ACCOUNT_JSON='{"type": "service_account", "project_id": "...", ...}'
```

**Note :** Assurez-vous de coller la chaîne JSON complète, y compris les accolades `{}`. Il est recommandé de l'entourer de guillemets simples `'` ou doubles `"` si votre système le permet. **Ne partagez jamais ce fichier JSON publiquement.**

---

### Étape 2 : Configurer les Variables d'Environnement (CRUCIAL)

Votre application dépend de clés API secrètes pour fonctionner. **Le fichier `.env` n'est JAMAIS envoyé en production.** Vous devez configurer ces variables directement sur votre plateforme d'hébergement.

Votre hébergeur doit fournir une interface (souvent dans le tableau de bord de votre site) pour ajouter des "variables d'environnement".

**Variables à configurer :**

```
# Firebase (côté client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Mailgun (côté serveur)
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
MAILGUN_FROM_EMAIL=...
MAILGUN_ADMIN_EMAIL=...
MAILGUN_API_HOST=...

# Cloudinary (côté serveur)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google AI (côté serveur)
GOOGLE_API_KEY=...
```

**Ceci est l'une des étapes les plus importantes. Si elle est oubliée, les fonctionnalités de base comme l'envoi d'e-mails, la connexion ou l'upload de fichiers échoueront.**

---

### Étape 3 : Processus de Déploiement Général

Si vous n'utilisez pas une plateforme automatisée comme Firebase App Hosting ou Vercel, le processus manuel ressemble généralement à ceci :

#### A. Prérequis : Version de Node.js

**Assurez-vous que votre serveur de production utilise Node.js version 20 ou une version supérieure.** C'est la version recommandée pour la version de Next.js de ce projet. Vous pouvez le vérifier sur le serveur avec la commande `node -v`.

#### B. Processus de déploiement

1.  **Construire l'application (Build) :**
    *   Sur votre machine locale, ou sur le serveur de build, exécutez la commande :
        ```bash
        npm run build
        ```
    *   Cette commande crée un dossier `.next` optimisé pour la production.

2.  **Téléverser les Fichiers :**
    *   Vous devez téléverser (via FTP ou SSH) les fichiers et dossiers suivants sur votre serveur :
        *   Le dossier `.next`
        *   Le dossier `public`
        *   Le fichier `package.json` et `package-lock.json`
        *   Le fichier `next.config.ts`

3.  **Installer les dépendances de production sur le serveur :**
    *   Connectez-vous à votre serveur via un terminal (SSH) et exécutez :
        ```bash
        npm install --production
        ```
    *   Cela installe uniquement les paquets nécessaires au fonctionnement de l'application, pas ceux de développement.

4.  **Démarrer l'application :**
    *   La commande pour lancer l'application en mode production est :
        ```bash
        npm start
        ```
    *   Votre hébergeur doit s'assurer que cette commande est exécutée et que le processus reste actif (souvent via un gestionnaire de processus comme PM2).

---

### Résumé et Recommandations

-   **Priorité n°1 :** Vérifiez que votre hébergement supporte **Node.js 20+**.
-   **Priorité n°2 :** Configurez les variables d'environnement sur la plateforme d'hébergement. C'est la source d'erreur la plus commune.
-   **Chemin le plus simple :** Utilisez **Firebase App Hosting** ou **Vercel** pour un déploiement simple et sans tracas.

Bon déploiement !
