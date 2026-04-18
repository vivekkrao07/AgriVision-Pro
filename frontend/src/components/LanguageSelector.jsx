import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Hindi (हिन्दी)', code: 'hi' },
    { name: 'Spanish (Español)', code: 'es' },
    { name: 'French (Français)', code: 'fr' },
    { name: 'Bengali (বাংলা)', code: 'bn' },
    { name: 'Marathi (मराठी)', code: 'mr' },
    { name: 'Telugu (తెలుగు)', code: 'te' },
    { name: 'Tamil (தமிழ்)', code: 'ta' },
    { name: 'Gujarati (ગુજરાતી)', code: 'gu' },
    { name: 'Kannada (ಕನ್ನಡ)', code: 'kn' },
    { name: 'Malayalam (മലയാളം)', code: 'ml' },
    { name: 'Punjabi (ਪੰਜਾਬੀ)', code: 'pa' },
  ];

  useEffect(() => {
    // Inject Google Translate script if not present
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: 'en', 
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  const handleLanguageChange = (code) => {
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
      googleCombo.value = code;
      googleCombo.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="language-wrapper" style={{ position: 'relative' }}>
      {/* Completely hidden Google Widget */}
      <div id="google_translate_element" style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}></div>
      
      <div style={{ position: 'relative' }}>
        <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 2, pointerEvents: 'none' }} />
        <select 
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 35px 8px 35px',
            fontSize: '14px',
            fontWeight: '600',
            width: '230px', // Increased width for long scripts like Malayalam
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', 'Noto Sans Tamil', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}
          className="custom-agri-select notranslate"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} style={{ background: '#0f172a', color: 'white', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
              {lang.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 2, pointerEvents: 'none' }} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-agri-select:hover {
          background: #059669 !important;
          transform: translateY(-1px);
        }
        /* Hide the annoying Google top bar that appears after translation */
        .goog-te-banner-frame.skiptranslate, .goog-te-banner-frame { 
          display: none !important; 
        }
        body { 
          top: 0px !important; 
        }
        .skiptranslate > iframe {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default LanguageSelector;
