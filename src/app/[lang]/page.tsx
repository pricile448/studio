<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nous faisons peau neuve - AmCbunq</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #2B4C9B;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Boutons de langue */
        .language-selector {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .lang-btn {
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .lang-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        
        .lang-btn.active {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }
        
        .container {
            max-width: 600px;
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: #2B4C9B;
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            font-family: 'Poppins', sans-serif;
            color: white;
            border: 3px solid rgba(255, 255, 255, 0.3);
            animation: pulse 2s infinite;
        }
        
        h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 15px;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 1.2rem;
            font-weight: 500;
            margin-bottom: 25px;
            opacity: 0.9;
        }
        
        .description {
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 40px;
            opacity: 0.8;
        }
        
        .status {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(34, 197, 94, 0.2);
            padding: 12px 24px;
            border-radius: 50px;
            border: 1px solid rgba(34, 197, 94, 0.3);
            margin-bottom: 30px;
            font-weight: 500;
        }
        
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(34, 197, 94, 0.3);
            border-top: 2px solid #22c55e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .contact {
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .contact h3 {
            font-family: 'Poppins', sans-serif;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .contact a {
            color: #93c5fd;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .contact a:hover {
            color: #dbeafe;
            text-decoration: underline;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
            .language-selector {
                top: 10px;
                right: 10px;
                left: 10px;
                justify-content: center;
            }
            
            .container {
                padding: 30px 20px;
                margin: 60px 10px 10px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .subtitle {
                font-size: 1.1rem;
            }
            
            .description {
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <!-- Sélecteur de langue -->
    <div class="language-selector">
        <button class="lang-btn active" onclick="changeLang('fr')">🇫🇷 FR</button>
        <button class="lang-btn" onclick="changeLang('en')">🇬🇧 EN</button>
        <button class="lang-btn" onclick="changeLang('de')">🇩🇪 DE</button>
        <button class="lang-btn" onclick="changeLang('es')">🇪🇸 ES</button>
        <button class="lang-btn" onclick="changeLang('pt')">🇵🇹 PT</button>
    </div>

    <div class="container">
        <div class="logo">A</div>
        <h1 id="title">Nous faisons peau neuve</h1>
        <p class="subtitle" id="subtitle">Notre site est temporairement en maintenance</p>
        <p class="description" id="description">Nous travaillons actuellement sur des améliorations importantes pour vous offrir une meilleure expérience. Nous serons de retour très bientôt.</p>
        
        <div class="status">
            <div class="spinner"></div>
            <span id="backSoon">De retour très bientôt</span>
        </div>
        
        <div class="contact">
            <h3 id="contact">Contactez-nous</h3>
            <a href="mailto:support@mybunq.amccredit.com" id="email">support@mybunq.amccredit.com</a>
        </div>
    </div>

    <script>
        const messages = {
            fr: {
                title: "Nous faisons peau neuve",
                subtitle: "Notre site est temporairement en maintenance",
                description: "Nous travaillons actuellement sur des améliorations importantes pour vous offrir une meilleure expérience. Nous serons de retour très bientôt.",
                backSoon: "De retour très bientôt",
                contact: "Contactez-nous",
                email: "support@mybunq.amccredit.com"
            },
            en: {
                title: "We're getting a makeover",
                subtitle: "Our site is temporarily under maintenance",
                description: "We are currently working on important improvements to provide you with a better experience. We'll be back very soon.",
                backSoon: "Back very soon",
                contact: "Contact us",
                email: "support@mybunq.amccredit.com"
            },
            de: {
                title: "Wir machen uns schön",
                subtitle: "Unsere Website befindet sich vorübergehend in Wartung",
                description: "Wir arbeiten derzeit an wichtigen Verbesserungen, um Ihnen eine bessere Erfahrung zu bieten. Wir sind sehr bald wieder da.",
                backSoon: "Bald wieder da",
                contact: "Kontaktieren Sie uns",
                email: "support@mybunq.amccredit.com"
            },
            es: {
                title: "Nos estamos renovando",
                subtitle: "Nuestro sitio está temporalmente en mantenimiento",
                description: "Actualmente estamos trabajando en mejoras importantes para ofrecerte una mejor experiencia. Volveremos muy pronto.",
                backSoon: "De vuelta muy pronto",
                contact: "Contáctanos",
                email: "support@mybunq.amccredit.com"
            },
            pt: {
                title: "Estamos nos renovando",
                subtitle: "Nosso site está temporariamente em manutenção",
                description: "Estamos atualmente trabalhando em melhorias importantes para oferecer uma experiência melhor. Voltaremos muito em breve.",
                backSoon: "De volta muito em breve",
                contact: "Entre em contato",
                email: "support@mybunq.amccredit.com"
            }
        };

        function changeLang(lang) {
            const message = messages[lang];
            
            // Met à jour le contenu
            document.getElementById('title').textContent = message.title;
            document.getElementById('subtitle').textContent = message.subtitle;
            document.getElementById('description').textContent = message.description;
            document.getElementById('backSoon').textContent = message.backSoon;
            document.getElementById('contact').textContent = message.contact;
            document.getElementById('email').textContent = message.email;
            
            // Met à jour la langue du HTML
            document.documentElement.lang = lang;
            document.title = message.title + ' - AmCbunq';
            
            // Met à jour les boutons actifs
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
    </script>
</body>
</html>
