// import './globals.css'; // NOTE: Uncomment this line when running in your local Next.js environment!

export const metadata = {
  title: 'Project Graveyard',
  description: 'The digital graveyard for abandoned startups. System enforced trust.',
};

export default function RootLayout({ children }) {
  return (
    <div lang="en" className="min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-purple-500/30 selection:text-purple-200">
      {/* 
        NOTE: For deployment to Next.js on Vercel, you MUST change the outer <div> above to an <html> tag, 
        and wrap {children} in a <body> tag. 
        This is modified to a <div> solely to prevent DOM nesting errors in the sandbox preview. 
      */}
      {children}
    </div>
  );
}
