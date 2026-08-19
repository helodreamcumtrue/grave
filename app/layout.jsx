import './globals.css';

export const metadata = {
  title: 'Project Graveyard',
  description: 'The digital graveyard for abandoned startups. System enforced trust.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
