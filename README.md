# ina the nexlear ai

this is ai voice assitance specially design for study platform where it diverge you any question to study related and only focus is to motivate u ...
it work on voice only 

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It includes:
- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Lucide React Icons
- Genkit for AI features

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, set up your environment variables. Create a `.env.local` file in the root directory and add your Google Generative AI API key:

```env
GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

### Genkit Development

To run Genkit flows locally for development and testing, use the Genkit development UI:

```bash
npm run genkit:dev
# or start with watch mode
npm run genkit:watch
```

This will start the Genkit developer UI, usually on [http://localhost:4000](http://localhost:4000).

## Learn More

To learn more about the technologies used, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS utility classes.
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs) - learn about the UI components used.
- [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit features.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
