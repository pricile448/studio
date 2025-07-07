
# Feuille de Route pour le Déploiement de votre Application Next.js

Félicitations ! Votre application est fonctionnelle en développement. Ce guide vous aidera à la déployer sur un serveur de production.

## Comprendre la Nature de l'Application

Votre application est construite avec **Next.js**. Ce n'est pas un site web statique classique. C'est une **application Node.js** qui nécessite un environnement serveur capable d'exécuter du JavaScript côté serveur. C'est un point crucial pour le choix de votre hébergement.

---

### Étape 1 : Choisir votre Plateforme d'Hébergement

#### Option 1 : Vercel (Fortement Recommandé)

*   **Pourquoi ?** Vercel est la plateforme conçue spécifiquement pour Next.js par ses créateurs. Le déploiement est extrêmement simple, rapide et optimisé. Vercel gère automatiquement la construction, les dépendances et la mise à l'échelle de votre application. C'est la solution la plus simple et la plus performante.
*   **Comment ?** Suivez les étapes détaillées plus bas dans ce guide.

#### Option 2 : Firebase App Hosting

*   **Pourquoi ?** C'est une solution simple et intégrée si vous êtes familier avec l'écosystème Firebase. Votre projet contient déjà un fichier `apphosting.yaml` qui facilite ce déploiement.
*   **Comment ?** Le déploiement se fait généralement via la console Firebase ou les commandes `firebase deploy`.

#### Option 3 : Autres plateformes (Netlify, Render)

*   Ces services fonctionnent de manière similaire à Vercel et sont également d'excellentes options.

#### Option 4 : Hébergement Manuel (cPanel, VPS - Avancé)

*   Utiliser un hébergement mutualisé avec support Node.js (comme cPanel) ou un serveur privé virtuel (VPS) est possible, mais beaucoup plus complexe. Cette méthode est détaillée en annexe de ce guide pour les utilisateurs avancés.

---

### Étape 2 : Configurer les Variables d'Environnement (CRUCIAL)

Votre application dépend de clés API secrètes pour fonctionner. **Le fichier `.env` n'est JAMAIS envoyé en production.** Vous devez configurer ces variables directement sur votre plateforme d'hébergement.

Votre hébergeur doit fournir une interface (souvent dans le tableau de bord de votre site) pour ajouter des "variables d'environnement". Sur Vercel, cela se trouve dans `Settings` -> `Environment Variables`.

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

**Note importante pour `SERVICE_ACCOUNT_JSON` :**
Vous devez également ajouter la variable `SERVICE_ACCOUNT_JSON` pour le tableau de bord administrateur (voir étape suivante). Sur Vercel, vous pouvez simplement copier le contenu complet du fichier JSON et le coller comme valeur de la variable. Vercel gère correctement les variables sur plusieurs lignes, vous n'avez **pas besoin** d'ajouter des guillemets simples (`'`).

---

### Étape 3 : Configurer les Identifiants du SDK Admin (OBLIGATOIRE POUR LE DASHBOARD ADMIN)

Certaines fonctionnalités, comme le tableau de bord administrateur, nécessitent des permissions élevées. Pour cela, l'application utilise le SDK Admin de Firebase, qui doit être authentifié via un **compte de service**.

1.  **Créez un compte de service :**
    *   Allez dans votre [console Firebase](https://console.firebase.google.com/).
    *   Sélectionnez votre projet.
    *   Cliquez sur l'icône en forme d'engrenage à côté de "Project Overview" et sélectionnez "Paramètres du projet".
    *   Allez dans l'onglet "Comptes de service".
    *   Cliquez sur le bouton "**Générer une nouvelle clé privée**". Un fichier JSON sera téléchargé.

2.  **Configurez la variable d'environnement :**
    *   Ouvrez le fichier JSON que vous venez de télécharger.
    *   Copiez **l'intégralité du contenu** de ce fichier.
    *   Sur votre plateforme d'hébergement (Vercel), créez une nouvelle variable d'environnement nommée `SERVICE_ACCOUNT_JSON`.
    *   Collez l'intégralité du contenu JSON comme valeur pour cette variable.

---

### Étape 4 : Déployer sur Vercel

1.  **Créez un compte** sur [Vercel](https://vercel.com).
2.  **Liez votre dépôt de code** (GitHub, GitLab, ou Bitbucket).
3.  **Importez votre projet**. Vercel détectera automatiquement que c'est un projet Next.js et configurera le build pour vous.
4.  **Configurez les variables d'environnement** comme décrit à l'étape 2.
5.  **Lancez le déploiement**. Votre site sera en ligne en quelques minutes sur une URL fournie par Vercel (par exemple `mon-projet.vercel.app`).

---

### Étape 5 : Configurer votre Nom de Domaine Personnalisé

1.  **Allez dans votre tableau de bord Vercel** et sélectionnez votre projet.
2.  **Accédez à la section des domaines :** `Settings` -> `Domains`.
3.  **Ajoutez votre nom de domaine** (par exemple, `mon-site.com`) ou votre sous-domaine (`app.mon-site.com`).
4.  **Configurez vos enregistrements DNS :** Suivez les instructions fournies par Vercel pour mettre à jour les DNS chez votre fournisseur de domaine (OVH, GoDaddy, etc.). Cela implique généralement d'ajouter un enregistrement `A` ou `CNAME`.
5.  **Attendez la propagation.** Vercel vérifiera la configuration et s'occupera automatiquement du certificat SSL (HTTPS).

---

### Étape 6 : Mettre à jour votre Application (le Flux de Travail Git)

C'est là que la magie de Vercel opère. Mettre à jour votre site est incroyablement simple.

1.  **Demandez vos modifications de code** dans Firebase Studio.
2.  Une fois les modifications appliquées, **envoyez-les à votre dépôt Git** avec les commandes suivantes dans votre terminal :
    ```bash
    git add .
    git commit -m "Description de vos modifications"
    git push
    ```
3.  **Vercel s'occupe du reste !** Dès que Vercel détecte le `push` sur votre branche principale, il lance automatiquement un nouveau build et déploie la mise à jour sur votre site de production. Vous n'avez rien d'autre à faire.

**Déploiements de prévisualisation (Preview Deployments) :**
Si vous poussez votre code sur une autre branche que la branche principale (par exemple, une branche nommée `nouvelle-fonctionnalite`), Vercel créera un déploiement de **prévisualisation**. C'est une version de votre site accessible via une URL unique, où vous pouvez tester vos changements en conditions réelles avant de les fusionner sur la branche principale.

---

### Annexe A : Déploiement Manuel sur cPanel

Si vous n'utilisez pas une plateforme automatisée comme Vercel, le processus manuel ressemble généralement à ceci :

#### A. Prérequis CRUCIAL : Version de Node.js

**Votre application nécessite impérativement Node.js version 20 ou une version supérieure pour fonctionner.** L'erreur `Unsupported engine` indique que votre serveur utilise une version plus ancienne.
*   **Correction sur cPanel :** Allez dans **"Setup Node.js App"** -> **"Node.js version"** et sélectionnez `20.x` ou plus.

#### B. Processus de déploiement

1.  **Construire l'application (Build) :**
    *   Sur votre machine locale, exécutez : `npm run build`
2.  **Téléverser les Fichiers :**
    *   Téléversez (via FTP ou SSH) les fichiers et dossiers suivants : `.next`, `public`, `package.json`, `package-lock.json`, `next.config.ts`, `app.js`.
3.  **Installer les dépendances de production sur le serveur :**
    *   Connectez-vous via un terminal (SSH) et exécutez : `npm install --production`
4.  **Configurer et démarrer l'application dans cPanel :**
    *   Allez dans **"Setup Node.js App"**.
    *   Vérifiez que le **"Application startup file"** est bien `app.js`.
    *   Configurez les **variables d'environnement** comme décrit à l'étape 2.
    *   **ATTENTION :** Pour `SERVICE_ACCOUNT_JSON`, la valeur doit être entourée de guillemets simples : `'{"type": "...", ...}'`
    *   Cliquez sur **"Run NPM Install"**, puis **"Restart"**.

---

### Annexe B : Dépannage des Erreurs Courantes sur cPanel

#### Erreur : `ENOTEMPTY: directory not empty` lors de `npm install`

Cette erreur indique que votre dossier de dépendances (`node_modules`) est dans un état incohérent.
1.  **Arrêtez l'application** dans cPanel.
2.  **Supprimez** le dossier `node_modules` et le fichier `package-lock.json`.
3.  **Réinstallez** en cliquant sur "Run NPM Install".
4.  **Redémarrez** l'application.

#### Erreur : `not a valid identifier` au démarrage

Cela signifie que votre variable d'environnement `SERVICE_ACCOUNT_JSON` n'est pas correctement formatée. Assurez-vous que la valeur est bien entourée de guillemets simples (`'...'`).
