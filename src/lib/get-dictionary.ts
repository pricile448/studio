
import type { Locale, Dictionary } from './dictionaries'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
  de: () => import('@/dictionaries/de.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
  pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Fallback to 'fr' if the locale is not found or invalid
  const loadDict = dictionaries[locale] ?? dictionaries.fr;
  return loadDict();
}
