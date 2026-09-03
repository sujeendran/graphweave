import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GraphWeave | Agentic Architecture & Real-Time Threat-Modeling Canvas',
  description:
    'Intelligent reactive architecture canvas powered by the W3C WebMCP Standard. AI agents directly manipulate, traverse, analyze, and heal distributed software topologies live in the browser DOM.',
  keywords: [
    'WebMCP',
    'AI Agents',
    'Software Architecture',
    'Threat Modeling',
    'STRIDE',
    'React Flow',
    'OpenAI WebMCP Challenge',
    'Vercel',
  ],
  authors: [{ name: 'GraphWeave Team' }],
  creator: 'GraphWeave',
  publisher: 'GraphWeave',
  openGraph: {
    title: 'GraphWeave | Agentic Architecture & Threat-Modeling Canvas',
    description:
      'Co-create, stress-test, and auto-remediate cloud architectures live in your browser using W3C WebMCP AI tools.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GraphWeave',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GraphWeave | Agentic Architecture Canvas',
    description:
      'Intelligent reactive architecture canvas powered by the W3C WebMCP Standard.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-700 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
