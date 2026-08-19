export const metadata = {
  title: 'Project Graveyard',
  description: 'The digital graveyard for abandoned startups. System enforced trust.',
};

export default function RootLayout({ children }) {
  return (
    <div lang="en" className="scroll-smooth w-full min-h-screen">
      <div>
        <style dangerouslySetInnerHTML={{__html: `
          /* Custom scrollbar to match the dark graveyard aesthetic */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #09090b; /* zinc-950 */
          }

          ::-webkit-scrollbar-thumb {
            background: #27272a; /* zinc-800 */
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #3f3f46; /* zinc-700 */
          }

          /* Ensure smooth scrolling across the app */
          html {
            scroll-behavior: smooth;
          }
        `}} />
      </div>
      <div className="min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </div>
    </div>
  );
}
