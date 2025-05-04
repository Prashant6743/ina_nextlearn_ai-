'use server';

/**
 * @fileOverview A progress summarization AI agent.
 *
 * - summarizeProgress - A function that handles the summarization of progress on a goal or subject.
 * - SummarizeProgressInput - The input type for the summarizeProgress function.
 * - SummarizeProgressOutput - The return type for the summarizeProgress function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeProgressInputSchema = z.object({
  progressDescription: z
    .string()
    .describe("A description of the progress the student has made on a particular goal or subject."),
});
export type SummarizeProgressInput = z.infer<typeof SummarizeProgressInputSchema>;

const SummarizeProgressOutputSchema = z.object({
  summary: z.string().describe("A summary of the student's progress."),
  areasForImprovement: z
    .string()
    .describe("Areas where the student can improve, based on their progress description."),
});
export type SummarizeProgressOutput = z.infer<typeof SummarizeProgressOutputSchema>;

export async function summarizeProgress(input: SummarizeProgressInput): Promise<SummarizeProgressOutput> {
  return summarizeProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProgressPrompt',
  input: {
    schema: z.object({
      progressDescription: z
        .string()
        .describe("A description of the progress the student has made on a particular goal or subject."),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe("A summary of the student's progress."),
      areasForImprovement: z
        .string()
        .describe("Areas where the student can improve, based on their progress description."),
    }),
  },
  prompt: `You are a helpful AI assistant that summarizes a student's progress on a particular goal or subject and highlights areas where they can improve.

  Progress Description: {{{progressDescription}}}

  Summary:
  Areas for Improvement: `,
});

const summarizeProgressFlow = ai.defineFlow<
  typeof SummarizeProgressInputSchema,
  typeof SummarizeProgressOutputSchema
>({
  name: 'summarizeProgressFlow',
  inputSchema: SummarizeProgressInputSchema,
  outputSchema: SummarizeProgressOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
