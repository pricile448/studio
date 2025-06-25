import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

const plugins: GenkitPlugin[] = [];
let defaultModel: string | undefined = undefined;

if (googleApiKey) {
  // The googleAI() plugin will automatically find the API key 
  // from the environment variables.
  plugins.push(googleAI());
  defaultModel = 'googleai/gemini-2.0-flash';
} else {
  // This warning will be logged on the server when the application starts.
  console.warn(
    "\n********************************************************************************************************\n" +
    "WARN: La clé API Google n'est pas configurée (GOOGLE_API_KEY).\n" +
    "Les fonctionnalités d'IA (comme l'assistant financier) ne fonctionneront pas.\n" +
    "Pour les activer, veuillez obtenir une clé API depuis Google AI Studio et l'ajouter à votre fichier .env\n" +
    "********************************************************************************************************\n"
  );
}

export const ai = genkit({
  plugins: plugins,
  model: defaultModel,
});
