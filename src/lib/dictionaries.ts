
import type en from '@/dictionaries/en.json';
import type { Dictionary as DictionaryType } from './dictionary-types';

export type Locale = 'en' | 'fr' | 'de' | 'es' | 'pt';

// Use both the inferred type from the JSON and our explicit type
export type Dictionary = typeof en & DictionaryType;
