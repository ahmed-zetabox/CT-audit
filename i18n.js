import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './src/assets/translate/en.json';
import fr from './src/assets/translate/fr.json';
import pt from './src/assets/translate/pt.json';
import es from './src/assets/translate/es.json';
import de from './src/assets/translate/de.json';
import it from './src/assets/translate/it.json';
import {NativeModules, Platform} from 'react-native';
import * as constants from './src/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: en,
  fr: fr,
  de: de,
  es: es,
  it: it,
  pt: pt,
};

function getPreferedLanguageCode() {
  let systemLanguage = 'en';
  if (Platform.OS === constants.PLATFORM_ANDROID) {
    systemLanguage = NativeModules.I18nManager.localeIdentifier;
  } else {
    systemLanguage = NativeModules.SettingsManager.settings.AppleLocale;
  }
  const languageCode = systemLanguage.substring(0, 2);
  return languageCode;
}

const languageDetector = {
  type: 'languageDetector',
  async: true, // flags below detection to be async
  detect: async (callback) => {
    let lang = await AsyncStorage.getItem('i18nextLng');
    try {
      if (lang == null) {
        await AsyncStorage.setItem('i18nextLng', getPreferedLanguageCode());
        lang = getPreferedLanguageCode();
      }
    } catch (error) {
      console.log('Error get Lang storage ', error);
    }

    callback(lang);
  },
  init: async () => {},
  cacheUserLanguage: async (lang) => {
    await AsyncStorage.setItem('i18nextLng', lang);
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(languageDetector)
  .init({
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // Disable suspense to prevent render blocking
    },
  });

export default i18n;
