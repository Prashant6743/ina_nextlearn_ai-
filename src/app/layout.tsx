import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed font for a cleaner look, Geist might be too stylized
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Using Inter as default sans-serif

export const metadata: Metadata = {
  title: 'nextlearn Ai', // Updated title
  description: 'Your personal AI motivation coach', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning for potential browser API mismatches */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Added Toaster for notifications */}
      </body>
    </html>
  );
}
