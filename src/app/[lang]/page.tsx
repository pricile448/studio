'use client';

import { useState } from 'react';

interface PageProps {
  params: {
    lang: string;
  };
}

export default function MaintenancePage({ params }: PageProps) {
  const [currentLang, setCurrentLang] = useState(params.lang || 'fr');

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

  const changeLang = (lang: string) => {
    setCurrentLang(lang);
  };

  const currentMessage = messages[currentLang as keyof typeof messages] || messages.fr;

  return (
    <>
      {/* Styles globaux */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#2B4C9B',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: 'white',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        
        {/* Sélecteur de langue */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap' as const
        }}>
          {[
            { code: 'fr', flag: '🇫🇷', label: 'FR' },
            { code: 'en', flag: '🇬🇧', label: 'EN' },
            { code: 'de', flag: '🇩🇪', label: 'DE' },
            { code: 'es', flag: '🇪🇸', label: 'ES' },
            { code: 'pt', flag: '🇵🇹', label: 'PT' }
          ].map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => changeLang(code)}
              style={{
                padding: '8px 12px',
                background: currentLang === code ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${currentLang === code ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (currentLang !== code) {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (currentLang !== code) {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }
              }}
            >
              {flag} {label}
            </button>
          ))}
        </div>

        <div style={{
          maxWidth: '600px',
          textAlign: 'center' as const,
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
          position: 'relative' as const,
          zIndex: 1
        }}>
          
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#2B4C9B',
            borderRadius: '50%',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            fontFamily: "'Poppins', sans-serif",
            color: 'white',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            A
          </div>
          
          {/* Titre */}
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '15px',
            background: 'linear-gradient(45deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {currentMessage.title}
          </h1>
          
          {/* Sous-titre */}
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '500',
            marginBottom: '25px',
            opacity: 0.9
          }}>
            {currentMessage.subtitle}
          </p>
          
          {/* Description */}
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '40px',
            opacity: 0.8
          }}>
            {currentMessage.description}
          </p>
          
          {/* Statut */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.2)',
            padding: '12px 24px',
            borderRadius: '50px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: '30px',
            fontWeight: '500'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              borderTop: '2px solid #22c55e',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>{currentMessage.backSoon}</span>
          </div>
          
          {/* Contact */}
          <div style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              marginBottom: '10px',
              fontSize: '1.1rem'
            }}>
              {currentMessage.contact}
            </h3>
            <a
              href={`mailto:${currentMessage.email}`}
              style={{
                color: '#93c5fd',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#dbeafe';
                (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#93c5fd';
                (e.target as HTMLAnchorElement).style.textDecoration = 'none';
              }}
            >
              {currentMessage.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
