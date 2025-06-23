import 'server-only'
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';

export type Locale = 'en' | 'fr';

const dictionaries = { en, fr };

export const getDictionary = async (locale: Locale) => {
    return dictionaries[locale] ?? dictionaries.en;
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
