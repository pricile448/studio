import 'server-only'

export type Locale = 'en' | 'fr';

// This is a map of locales to functions that dynamically import the dictionary.
const dictionaryLoaders = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    // Ensure we have a valid loader, defaulting to 'en'.
    const loader = dictionaryLoaders[locale] || dictionaryLoaders.en;
    return loader();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;