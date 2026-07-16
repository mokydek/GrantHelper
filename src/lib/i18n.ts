import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/common.json'
import ru from '../locales/ru/common.json'

const STORAGE_KEY = 'granthelper_lang'

export type UiLanguage = 'en' | 'ru'

function getInitialLanguage(): UiLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'ru' || stored === 'en' ? stored : 'en'
}

function syncHtmlLang(lang: UiLanguage) {
  document.documentElement.lang = lang
}

const initialLanguage = getInitialLanguage()

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    ru: { common: ru },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
})

syncHtmlLang(initialLanguage)

export function setLanguage(lang: UiLanguage) {
  i18n.changeLanguage(lang)
  localStorage.setItem(STORAGE_KEY, lang)
  syncHtmlLang(lang)
}

export default i18n
