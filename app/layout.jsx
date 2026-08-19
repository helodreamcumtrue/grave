// NOTE: Make sure globals.css is actually imported!
// Removed import './globals.css'; since esbuild in this environment cannot resolve it and tailwind is assumed to be available.

export const metadata = {
  title: 'Project Graveyard',
  description: 'The digital graveyard for abandoned startups. System enforced trust.',
};

export default function RootLayout({ children }) {
  return (
    /* NOTE FOR VERCEL: Change the two <div> tags below back to <html> and <body> before pushing to GitHub! */
    <div lang="en" className="scroll-smooth w-full min-h-screen">
      <div className="min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </div>
    </div>
  );
}
