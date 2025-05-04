// src/ai/flows/generate-motivation-response.ts
'use server';

/**
 * @fileOverview An AI agent that generates personalized motivational messages for students.
 *
 * - generateMotivationResponse - A function that generates motivational responses.
 * - GenerateMotivationResponseInput - The input type for the generateMotivationResponse function.
 * - GenerateMotivationResponseOutput - The return type for the generateMotivationResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateMotivationResponseInputSchema = z.object({
  query: z
    .string()
    .describe('The query from the user requesting a motivational message.'),
});
export type GenerateMotivationResponseInput = z.infer<
  typeof GenerateMotivationResponseInputSchema
>;

const GenerateMotivationResponseOutputSchema = z.object({
  response: z.string().describe('The personalized motivational message.'),
});
export type GenerateMotivationResponseOutput = z.infer<
  typeof GenerateMotivationResponseOutputSchema
>;

export async function generateMotivationResponse(
  input: GenerateMotivationResponseInput
): Promise<GenerateMotivationResponseOutput> {
  return generateMotivationResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationResponsePrompt',
  input: {
    schema: z.object({
      query: z
        .string()
        .describe('The query from the user requesting a motivational message.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The personalized motivational message.'),
    }),
  },
  prompt: `You are a motivational chatbot designed to provide personalized encouragement to students. A student has requested a motivational message, here is their request:

Request: {{{query}}}

Please generate a personalized and encouraging response based on the user's input. The response should be positive, supportive, and focused on helping the student stay motivated in their studies. Keep the response concise and easy to understand.`,
});

const generateMotivationResponseFlow = ai.defineFlow<
  typeof GenerateMotivationResponseInputSchema,
  typeof GenerateMotivationResponseOutputSchema
>({
  name: 'generateMotivationResponseFlow',
  inputSchema: GenerateMotivationResponseInputSchema,
  outputSchema: GenerateMotivationResponseOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
