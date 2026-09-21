// Speech Synthesis & Speech Recognition Utilities with Indian Language Locale Support

const LOCALE_MAP = {
  kn: 'kn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-US'
};

export const getLanguageLocale = (langCode) => {
  const normalizedCode = String(langCode || 'en').toLowerCase();
  const languageCode = normalizedCode.split('-')[0];
  return LOCALE_MAP[languageCode] || normalizedCode;
};

export const speakText = (text, langCode = 'en', slow = false) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  if (!text) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const utterance = new window.SpeechSynthesisUtterance(String(text));
  const locale = getLanguageLocale(langCode);
  utterance.lang = locale;
  utterance.rate = slow ? 0.62 : 0.88; // 0.62x for slow syllable pronunciation, 0.88x for normal

  // Attempt to select best matching voice
  const voices = window.speechSynthesis.getVoices();
  const languageCode = locale.split('-')[0].toLowerCase();
  const matchingVoice = voices.find(v => v.lang.toLowerCase().split('-')[0] === languageCode);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const listenForSpeech = (langCode = 'en', onResult, onError) => {
  if (typeof window === 'undefined') {
    if (onError) onError(new Error('Speech recognition is only available in a browser.'));
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition not supported in this browser.');
    if (onError) onError(new Error('Speech recognition not supported in your browser.'));
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = getLanguageLocale(langCode);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      }
    };

    recognition.onerror = (err) => {
      if (onError) onError(err);
    };

    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
};
