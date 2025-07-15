// src/ai/genkit.ts
import {genkit, type GenkitError} from 'genkit';
import {firebase, googleAI} from '@genkit-ai/firebase';

const firebaseOptions = {
  firestore: {
    collection: 'genkit-traces',
  },
};

export const ai = genkit({
  plugins: [
    firebase(firebaseOptions),
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  enableTracingAndMetrics: true,
});
