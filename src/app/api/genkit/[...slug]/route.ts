
import { genkit } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with Google AI plugin
genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Import flows to be exposed via the API. IMPORTANT: Make sure flows are imported.
import '@/ai/flows/summarize-progress';
import '@/ai/flows/generate-motivation-response';

import { defineFlow } from 'genkit';
import { z } from 'zod';

// Example Flow definition (can be removed if not needed directly in this file)
// defineFlow(
//   {
//     name: 'helloWorldFlow',
//     inputSchema: z.string(),
//     outputSchema: z.string(),
//   },
//   async (name) => {
//     return `Hello, ${name}!`;
//   }
// );


// Export Genkit API route handlers
export { genkitAPIRoutes as GET, genkitAPIRoutes as POST };
