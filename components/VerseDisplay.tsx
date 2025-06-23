
import React, { useState, useEffect, useCallback } from 'react';
import { VerseSuggestion } from '../types.ts'; // Added .ts extension

interface VerseDisplayProps {
  suggestion: VerseSuggestion;
}

const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const SpeakerXMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-4.5 0m4.5 0v.75A2.25 2.25 0 0 1 13.5 21h-3a2.25 2.25 0 0 1-2.25-2.25v-.75m4.5 0c-.616 0-1.198-.056-1.757-.162M7.5 18V7.875c0-1.76.042-3.359.748-4.998M5.25 6H3V4.5h2.25A17.22 17.22 0 0 1 7.5 2.25c0-1.06-.02-2.016-.062-2.911S7.44 0 7.5 0c.06 0 .098.056.148.138.082.133.15.289.203.456.052.167.085.35.109.542s.033.394.033.593c0 .129-.009.255-.026.377-.018.121-.04.24-.065.354-.025.114-.053.226-.085.336a10.02 10.02 0 0 0-.098.32c-.03.097-.063.19-.098.282l-.004.01a11.96 11.96 0 0 1-.224.56C8.84 5.94 8.666 6 8.5 6h-1M7.5 18a7.5 7.5 0 0 0 5.243-2.126M7.5 18a7.5 7.5 0 0 1-5.243-2.126" />
  </svg>
);


const formatReferenceForSpeech = (ref: string): string => {
  if (!ref) return "";

  const lastSpaceIndex = ref.lastIndexOf(' ');
  if (lastSpaceIndex === -1) { 
    const parts = ref.split(':');
    if (parts.length === 2) {
      const chapterStr = parts[0];
      let verseStr = parts[1];
      if (verseStr.includes('-')) {
        const verseParts = verseStr.split('-');
        if (verseParts.length === 2) {
          verseStr = `${verseParts[0]}절에서 ${verseParts[1]}절`;
        } else {
          verseStr = `${verseStr}절`; 
        }
      } else if (verseStr.includes(',')) {
        verseStr = verseStr.split(',').map(s => s.trim() + "절").join(" 그리고 ");
      } else {
        verseStr = `${verseStr}절`;
      }
      return `${chapterStr}장 ${verseStr}`;
    }
    return ref; 
  }

  const bookName = ref.substring(0, lastSpaceIndex);
  const chapterVersePart = ref.substring(lastSpaceIndex + 1);

  const colonIndex = chapterVersePart.indexOf(':');
  if (colonIndex === -1) return ref; 

  const chapterStr = chapterVersePart.substring(0, colonIndex);
  let verseStr = chapterVersePart.substring(colonIndex + 1);

  if (verseStr.includes('-')) {
    const parts = verseStr.split('-');
    if (parts.length === 2) {
      verseStr = `${parts[0].trim()}절에서 ${parts[1].trim()}절`;
    } else {
      verseStr = `${verseStr}절`;
    }
  } else if (verseStr.includes(',')) {
    verseStr = verseStr.split(',').map(s => s.trim() + "절").join(" 그리고 ");
  } else {
    verseStr = `${verseStr.trim()}절`;
  }

  return `${bookName} ${chapterStr}장 ${verseStr}`;
};


export const VerseDisplay: React.FC<VerseDisplayProps> = ({ suggestion }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState<boolean>(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesisSupported(true);
      const u = new SpeechSynthesisUtterance();
      u.lang = 'ko-KR'; 
      u.rate = 0.9; 
      u.pitch = 1;

      const setKoreanVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return; 

        let preferredVoice = null;
        
        const knownGoodVoices = [
          "Google 한국의", 
          "Microsoft Heami Online (Natural) - Korean (Korea)",
          "Microsoft Heami - Korean (Korea)" // Adding another common one
        ];

        for (const name of knownGoodVoices) {
            const voice = voices.find(v => v.name === name && v.lang === 'ko-KR');
            if (voice) {
                preferredVoice = voice;
                break;
            }
        }

        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.lang === 'ko-KR' && !v.localService);
        }
        
        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.lang === 'ko-KR' && v.default);
        }

        if (!preferredVoice) {
            preferredVoice = voices.find(v => v.lang === 'ko-KR');
        }
        
        if (preferredVoice) {
          u.voice = preferredVoice;
        } else {
          console.warn("선호하는 한국어 음성을 찾을 수 없습니다. 브라우저 기본 음성을 사용합니다.");
        }
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            setKoreanVoice();
        };
      } else {
        setKoreanVoice();
      }
      
      setUtterance(u);

      const onSpeechEnd = () => setIsPlaying(false);
      u.onend = onSpeechEnd;
      u.onerror = (event: SpeechSynthesisErrorEvent) => {
        // Log more specific error information
        console.error('SpeechSynthesisUtterance.onerror - Error Code:', event.error, 'Event:', event);
        setIsPlaying(false);
      };
      
      return () => {
        u.onend = null;
        u.onerror = null;
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }
        window.speechSynthesis.onvoiceschanged = null; 
      };
    } else {
      console.warn("이 브라우저에서는 음성 합성을 지원하지 않습니다.");
    }
  }, []);

  useEffect(() => {
    if (utterance) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
    }
    setImageLoaded(false); 
  }, [suggestion.verseText, suggestion.imageUrl, utterance, suggestion.applicationText]);


  const handleToggleSpeech = useCallback(() => {
    if (!speechSynthesisSupported || !utterance) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const readableReference = formatReferenceForSpeech(suggestion.reference);
      let textToSpeak = `${readableReference}. ${suggestion.verseText}.`;
      if (suggestion.applicationText) {
        textToSpeak += ` 오늘의 묵상 포인트. ${suggestion.applicationText}`;
      }
      utterance.text = textToSpeak;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isPlaying, speechSynthesisSupported, utterance, suggestion.verseText, suggestion.reference, suggestion.applicationText]);

  return (
    <div className="mt-8 p-6 bg-sky-50 border-l-4 border-sky-500 rounded-r-lg shadow-md animate-fadeIn">
      {suggestion.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg aspect-video">
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
              <p className="ml-2 text-sm text-gray-500">이미지 로딩 중...</p>
            </div>
          )}
          <img
            src={suggestion.imageUrl}
            alt={`현대 기독교 스타일의 이미지: ${suggestion.reference} 말씀 관련`}
            className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true); 
              console.error("Failed to load generated image.");
            }}
            style={{ display: imageLoaded || !suggestion.imageUrl ? 'block' : 'none' }}
          />
        </div>
      )}
      
      <blockquote className="text-gray-800 text-lg italic leading-relaxed">
        <p>"{suggestion.verseText}"</p>
      </blockquote>
      <p className="mt-4 text-right text-sky-700 font-semibold">{suggestion.reference}</p>

      {suggestion.applicationText && (
        <div className="mt-6 pt-4 border-t border-sky-200">
          <h3 className="text-md font-semibold text-sky-700 mb-2 flex items-center">
            <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
            오늘의 묵상 포인트 ✨
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{suggestion.applicationText}</p>
        </div>
      )}
      
      {speechSynthesisSupported && (
        <div className="mt-6 text-right">
          <button
            onClick={handleToggleSpeech}
            disabled={!utterance}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 transition-colors duration-150"
            aria-label={isPlaying ? "읽기 중지" : "성경 구절 및 묵상 포인트 읽어주기"}
          >
            {isPlaying ? (
              <>
                <SpeakerXMarkIcon className="w-5 h-5 mr-2" />
                읽기 중지
              </>
            ) : (
              <>
                <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                말씀과 묵상 읽기
              </>
            )}
          </button>
        </div>
      )}
       {!speechSynthesisSupported && utterance === null && ( 
        <p className="mt-4 text-sm text-gray-500 text-right">음성 읽기 기능을 지원하지 않는 브라우저입니다.</p>
      )}
    </div>
  );
};

(function addFadeInAnimation() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const animationName = 'fadeIn';
  let animationExists = false;
  
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        // Ensure 'name' property exists before accessing it
        if (rule instanceof CSSKeyframesRule && rule.name === animationName) {
          animationExists = true;
          break;
        }
      }
    } catch (e) { 
        // Silently catch errors, e.g. from accessing cross-origin stylesheets
    }
    if (animationExists) break;
  }

  if (!animationExists) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    const styleSheet = styleEl.sheet;

    if (styleSheet) {
      try {
        styleSheet.insertRule(`@keyframes ${animationName} { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`, styleSheet.cssRules.length);
        
        let classRuleExists = false;
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const sheet = document.styleSheets[i];
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) continue;
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    // Check if it's a CSSStyleRule and if selectorText exists
                    if (rule instanceof CSSStyleRule && rule.selectorText === '.animate-fadeIn') {
                        classRuleExists = true;
                        break;
                    }
                }
            } catch (e) {}
            if (classRuleExists) break;
        }
        if (!classRuleExists) {
            styleSheet.insertRule(`.animate-fadeIn { animation: ${animationName} 0.5s ease-out forwards; }`, styleSheet.cssRules.length);
        }
      } catch (e) { console.error("Failed to insert CSS rules for animation:", e); }
    }
  }
})();