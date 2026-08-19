"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ghost, Spade, Lock, Unlock, CheckCircle2, Clock, 
  ShieldAlert, Search, Plus, ChevronRight, Activity,
  Skull, AlertTriangle, ArrowRight, Pickaxe, Flame,
  Trophy, UserX, Info, Check, XCircle, ArrowLeft,
  FileCode2, UserCheck, CheckSquare, FastForward
} from 'lucide-react';

const INITIAL_DB = {
  currentUser: {
    alias: 'Digger-9902',
    reputation: 85,
    credits: 2400,
    ghostStrikes: 0,
  },
  projects: [
    {
      id: 'prj-1',
      slug: 'defi-portfolio-tracker',
      title: 'DeFi Portfolio Tracker',
      epitaph: 'Ran out of runway before the bull market. Core tracking logic is solid, UI is halfway done.',
      ownerAlias: 'Digger-4912',
      stack: ['React', 'Node.js', 'Web3.js'],
      completion: 65,
      effortHours: 120,
      escrowMode: 'milestone',
      status: 'buried',
      milestones: [
        { id: 'm1', title: 'Smart Contract Integration', status: 'verified', payout: '20%' },
        { id: 'm2', title: 'Dashboard UI', status: 'locked', payout: '40%' },
        { id: 'm3', title: 'Notification System', status: 'locked', payout: '40%' },
      ]
    },
    {
      id: 'prj-2',
      slug: 'loreforge-ai',
      title: 'LoreForge AI',
      epitaph: 'GPT wrapper that got too expensive. Needs localized LLM integration to survive.',
      ownerAlias: 'Digger-8831',
      stack: ['Python', 'FastAPI', 'Vue'],
      completion: 80,
      effortHours: 45,
      escrowMode: 'stake',
      stakeAmount: '500 CRED',
      status: 'buried',
      milestones: []
    },
    {
      id: 'prj-3',
      slug: 'habitchain',
      title: 'HabitChain',
      epitaph: 'Cofounder ghosted. I cannot look at this codebase anymore. Take it.',
      ownerAlias: 'Digger-9902',
      stack: ['React Native', 'Firebase'],
      completion: 40,
      effortHours: 200,
      escrowMode: 'milestone',
      status: 'active',
      milestones: [
        { id: 'm1', title: 'Auth & Onboarding', status: 'locked', payout: '33%' },
        { id: 'm2', title: 'Habit Engine', status: 'locked', payout: '33%' },
      ]
    },
    {
      id: 'prj-4',
      slug: 'stealth-startup-code',
      title: 'Stealth SaaS',
      epitaph: 'Got a real job. No time.',
      ownerAlias: 'Digger-1123',
      stack: ['Next.js', 'PostgreSQL'],
      completion: 90,
      effortHours: 350,
      escrowMode: 'stake',
      stakeAmount: '1000 CRED',
      status: 'ghosted',
      milestones: []
    }
  ],
  handovers: [
    {
      id: 'ho-1',
      projectId: 'prj-3',
      projectTitle: 'HabitChain',
      ownerAlias: 'Digger-9902',
      takerAlias: 'Digger-4451',
      status: 'pending',
      stake: 'Milestone',
      daysLeft: 14,
      currentStep: 0,
      timeline: ['pending', 'matched', 'released', 'completed']
    },
    {
      id: 'ho-2',
      projectId: 'prj-4',
      projectTitle: 'Stealth SaaS',
      ownerAlias: 'Digger-1123',
      takerAlias: 'Digger-9902',
      status: 'ghosted',
      stake: '1000 CRED',
      daysLeft: 0,
      currentStep: 2,
      timeline: ['pending', 'matched', 'released', 'completed']
    }
  ]
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="w-full min-h-screen pb-20"
  >
    {children}
  </motion.div>
);

const EscrowBadge = ({ mode, size = 'sm' }) => {
  const isStake = mode === 'stake';
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
    } ${
      isStake 
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
    }`}>
      <ShieldAlert size={size === 'sm' ? 12 : 16} />
      {isStake ? 'Stake Required' : 'Milestone Escrow'}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    matched: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    released: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
    ghosted: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    buried: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {status}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 text-center">
    <div className="w-16 h-16 rounded-full bg-zinc-950 flex items-center justify-center mb-4 border border-zinc-800 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
      <Icon size={24} className="text-zinc-500" />
    </div>
    <h3 className="text-lg font-semibold text-zinc-200 mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 max-w-md mb-6">{message}</p>
    {actionText && onAction && (
      <button 
        onClick={onAction}
        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
      >
        {actionText}
      </button>
    )}
  </div>
);

const GhostWarningBanner = ({ daysLeft, status }) => {
  if (status === 'completed') return null;
  
  const isGhosted = status === 'ghosted' || daysLeft <= 0;
  
  return (
    <div className={`w-full p-4 rounded-lg border mb-8 flex items-start gap-4 ${
      isGhosted 
        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    }`}>
      {isGhosted ? <Skull className="mt-0.5 shrink-0" /> : <Flame className="mt-0.5 shrink-0" />}
      <div>
        <h4 className="font-bold mb-1">
          {isGhosted ? 'SYSTEM INTERVENTION: GHOST STRIKE' : `GHOST WARNING: ${daysLeft} DAYS LEFT`}
        </h4>
        <p className="text-sm opacity-80">
          {isGhosted 
            ? 'Action was not taken in the required timeframe. The system has closed this handover and strikes have been applied.'
            : 'If no action is taken before the countdown ends, a ghost strike will be applied and stakes may be forfeited.'}
        </p>
      </div>
    </div>
  );
};

const Navbar = ({ currentPath, navigate, user }) => {
  const isHome = currentPath === '/';
  
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isHome ? 'bg-zinc-950/50 absolute w-full' : 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
              <Spade size={20} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Project<span className="text-zinc-500 font-normal">Graveyard</span></span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4">
            <button onClick={() => navigate('/browse')} className={`px-4 py-2 text-sm font-medium transition-colors ${currentPath === '/browse' ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
              Browse
            </button>
            <button onClick={() => navigate('/dashboard')} className={`px-4 py-2 text-sm font-medium transition-colors ${currentPath === '/dashboard' ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
              Dashboard
            </button>
            
            <div className="w-px h-6 bg-zinc-800 mx-2 hidden md:block"></div>
            
            <button onClick={() => navigate('/new-project')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium transition-all">
              <Plus size={16} />
              Bury Project
            </button>
            
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-400 ml-2">
                <UserX size={14} className="text-purple-500" />
                {user.alias}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = ({ navigate }) => {
  return (
    <PageTransition>
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono mb-8">
                <Lock size={12} /> System Enforced Trust Protocol Active
              </div>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
              Bury your code. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Let others resurrect it.
              </span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              The digital graveyard for abandoned startups. Hand over your unfinished projects anonymously. Trust is enforced by escrow, stakes, and system penalties. No negotiations.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/browse')} className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold transition-colors text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Browse the Graveyard <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/new-project')} className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-purple-500 text-white rounded-lg font-bold transition-all text-lg flex items-center justify-center gap-2">
                <Skull size={20} /> Bury a Project
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border-y border-zinc-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">The System Cannot Be Cheated</h2>
            <p className="text-zinc-400">Direct communication is blocked. Only actions matter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent hidden md:block -translate-y-1/2"></div>
            
            {[
              { icon: Spade, title: "1. Bury", desc: "Owners deposit code, specs, and set escrow terms (Stake or Milestone)." },
              { icon: Pickaxe, title: "2. Adopt", desc: "Takers commit to the project, locking their stake into the system." },
              { icon: CheckCircle2, title: "3. Complete", desc: "System tracks deliverables. Verification triggers automatic payout." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-purple-500/30 transition-colors shadow-xl">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-purple-400 mb-6 shadow-inner">
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-3">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const BrowsePage = ({ navigate, db }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const projects = db.projects.filter(p => 
    p.status === 'buried' &&
    (filter === 'all' || p.escrowMode === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.stack.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Skull className="text-zinc-500" size={32} />
              The Graveyard
            </h1>
            <p className="text-zinc-400 text-lg">Resurrect abandoned projects. System enforces the trust.</p>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search projects, stack..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Escrows</option>
              <option value="milestone">Milestone Only</option>
              <option value="stake">Stake Only</option>
            </select>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                className="bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/30 rounded-xl p-5 cursor-pointer transition-all duration-300 group shadow-lg flex flex-col"
                onClick={() => navigate(`/projects/${project.slug}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">{project.title}</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-1 flex items-center gap-1"><UserX size={12}/> {project.ownerAlias}</p>
                  </div>
                  <EscrowBadge mode={project.escrowMode} />
                </div>
                
                <p className="text-sm text-zinc-400 mb-6 line-clamp-2 h-10 italic border-l-2 border-zinc-700 pl-3 flex-1">
                  "{project.epitaph}"
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.stack.slice(0, 3).map(tech => (
                    <span key={tech} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300">
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 3 && (
                    <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-500">
                      +{project.stack.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-zinc-500" />
                      {project.completion}% built
                    </div>
                  </div>
                  <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300 flex items-center gap-1 text-sm font-medium">
                    View <ArrowRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Ghost}
            title="No projects found"
            message="The graveyard is quiet based on your filters."
            actionText="Clear Filters"
            onAction={() => { setFilter('all'); setSearch(''); }}
          />
        )}
      </div>
    </PageTransition>
  );
};

const ProjectDetailPage = ({ slug, db, navigate, dispatch }) => {
  const project = db.projects.find(p => p.slug === slug);
  
  if (!project) {
    return <EmptyState icon={XCircle} title="Project Not Found" message="This soul has already been claimed or does not exist." actionText="Back to Browse" onAction={() => navigate('/browse')} />;
  }

  const isOwner = project.ownerAlias === db.currentUser.alias;

  const handleCommit = () => {
    dispatch({ type: 'COMMIT_PROJECT', payload: { project, takerAlias: db.currentUser.alias } });
    navigate('/success?type=commit');
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <button 
          onClick={() => navigate('/browse')}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Graveyard
        </button>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-zinc-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <StatusBadge status={project.status} />
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                    <UserX size={12} /> Buried by {project.ownerAlias}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{project.title}</h1>
                <div className="bg-zinc-950 border-l-2 border-purple-500/50 p-4 rounded-r-lg shadow-inner max-w-2xl">
                  <p className="text-zinc-300 italic">"{project.epitaph}"</p>
                </div>
              </div>
              
              <div className="shrink-0 pt-2">
                 <EscrowBadge mode={project.escrowMode} size="lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/50 border-b border-zinc-800/50">
            {[
              { icon: CheckCircle2, label: 'Completion', value: `${project.completion}%` },
              { icon: Clock, label: 'Effort Logged', value: `${project.effortHours}h` },
              { icon: FileCode2, label: 'Stack Size', value: `${project.stack.length} tech` },
              { icon: ShieldAlert, label: 'System Trust', value: project.escrowMode === 'stake' ? project.stakeAmount : 'Milestones', highlight: true }
            ].map((stat, idx) => (
              <div key={idx} className="bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
                <stat.icon className={`${stat.highlight ? 'text-purple-400' : 'text-zinc-500'} mb-2`} size={20} />
                <div className={`text-xl font-bold ${stat.highlight ? 'text-purple-300' : 'text-zinc-200'}`}>{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="p-8 border-b border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.stack.map(tech => (
                <span key={tech} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 rounded text-sm text-zinc-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
              <Lock size={18} className="text-zinc-500" /> Terms of Resurrection
            </h3>
            
            {project.escrowMode === 'milestone' ? (
              <div className="space-y-3">
                {project.milestones.map((m, idx) => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-zinc-300">{m.title}</span>
                    </div>
                    <div className="text-sm font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                      Payout: {m.payout}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 flex items-start gap-4">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-yellow-500 font-medium mb-2">Stake Required: {project.stakeAmount}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    To adopt this project, you must commit this stake into the system escrow. It will be held until the original owner verifies completion. Abandoning the project (Ghost Strike) results in total loss of stake.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-zinc-950 border-t border-zinc-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-zinc-500 max-w-sm flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5" />
              By committing, you enter a system-enforced contract. Direct communication is blocked.
            </p>
            
            {isOwner ? (
              <button disabled className="px-6 py-3 bg-zinc-900 text-zinc-500 rounded-lg font-medium cursor-not-allowed border border-zinc-800">
                You own this project
              </button>
            ) : project.status === 'buried' ? (
              <button onClick={handleCommit} className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2">
                <Pickaxe size={18} /> Commit & Resurrect
              </button>
            ) : (
              <button disabled className="px-6 py-3 bg-zinc-900 text-zinc-500 rounded-lg font-medium cursor-not-allowed border border-zinc-800 flex items-center gap-2">
                <Lock size={16}/> Claimed
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const DashboardPage = ({ navigate, db }) => {
  const user = db.currentUser;
  const myBuried = db.projects.filter(p => p.ownerAlias === user.alias);
  const myAdoptions = db.handovers.filter(h => h.takerAlias === user.alias);
  const myHandovers = db.handovers.filter(h => h.ownerAlias === user.alias || h.takerAlias === user.alias);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-purple-500" /> Basecamp
          </h1>
          <button onClick={() => navigate('/handovers')} className="text-sm text-purple-400 hover:text-purple-300 font-medium bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
            View All Handovers ({myHandovers.length})
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Alias', value: user.alias, icon: UserX, color: 'text-zinc-400' },
            { label: 'Reputation', value: `${user.reputation}/100`, icon: ShieldAlert, color: 'text-blue-400' },
            { label: 'Platform Credits', value: user.credits, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Ghost Strikes', value: user.ghostStrikes, icon: Ghost, color: 'text-red-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-zinc-200 font-mono">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Pickaxe className="text-purple-400" size={20} /> My Active Digs
            </h2>
            <div className="space-y-4">
              {myAdoptions.length > 0 ? (
                myAdoptions.map(ho => (
                  <div key={ho.id} onClick={() => navigate(`/handovers/${ho.id}`)} className="bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/30 p-5 rounded-xl cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-zinc-100 group-hover:text-purple-300">{ho.projectTitle}</h3>
                      <StatusBadge status={ho.status} />
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-zinc-500">
                      <span className="font-mono bg-zinc-950 px-2 py-1 rounded">Owner: {ho.ownerAlias}</span>
                      <span className="flex items-center gap-1 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Action Required <ArrowRight size={14}/></span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={Spade} title="No Active Digs" message="You haven't adopted any projects yet." actionText="Find Projects" onAction={() => navigate('/browse')} />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <Skull className="text-zinc-500" size={20} /> My Buried Projects
            </h2>
            <div className="space-y-4">
              {myBuried.length > 0 ? (
                myBuried.map(p => (
                  <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-zinc-100 mb-1">{p.title}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    {p.status === 'active' || p.status === 'pending' ? (
                       <button onClick={() => {
                          const ho = db.handovers.find(h => h.projectId === p.id);
                          if(ho) navigate(`/handovers/${ho.id}`);
                       }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
                         Manage Handover
                       </button>
                    ) : (
                      <button onClick={() => navigate(`/projects/${p.slug}`)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700">
                         View Details
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState icon={Ghost} title="Clean Slate" message="You haven't abandoned any projects." actionText="Bury Project" onAction={() => navigate('/new-project')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const HandoversPage = ({ navigate, db }) => {
  const handovers = db.handovers.filter(h => h.ownerAlias === db.currentUser.alias || h.takerAlias === db.currentUser.alias);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-white mb-2">Active Handovers</h1>
        <p className="text-zinc-400 mb-8">System-enforced project transfers. Watch your deadlines.</p>

        <div className="space-y-6">
          {handovers.length > 0 ? (
            handovers.map((ho) => (
              <div key={ho.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors group cursor-pointer" onClick={() => navigate(`/handovers/${ho.id}`)}>
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-purple-300 transition-colors">{ho.projectTitle}</h3>
                    <div className="flex gap-4 text-sm font-mono text-zinc-500">
                      <span>Owner: {ho.ownerAlias}</span>
                      <span>Taker: {ho.takerAlias}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-zinc-500 uppercase">Status</div>
                      <StatusBadge status={ho.status} />
                    </div>
                    <div className="h-10 w-px bg-zinc-800 hidden md:block"></div>
                    <div className={`flex flex-col items-center px-4 py-2 rounded-lg border w-full md:w-32 ${ho.daysLeft <= 3 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`}>
                       <div className="text-xs uppercase font-bold flex items-center gap-1 opacity-80">
                         {ho.daysLeft <= 3 && <Flame size={12} />}
                         Deadline
                       </div>
                       <div className="text-lg font-bold">{ho.daysLeft} Days</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={ShieldAlert} title="No Active Handovers" message="You have no ongoing project transfers." actionText="Dashboard" onAction={() => navigate('/dashboard')} />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

const HandoverDetailPage = ({ id, db, navigate, dispatch }) => {
  const ho = db.handovers.find(h => h.id === id);
  if (!ho) return <EmptyState icon={XCircle} title="Handover Not Found" message="Invalid system record." actionText="Back" onAction={() => navigate('/handovers')} />;

  const isOwner = ho.ownerAlias === db.currentUser.alias;
  const isTaker = ho.takerAlias === db.currentUser.alias;

  const handleApprove = () => dispatch({ type: 'UPDATE_HANDOVER', payload: { id, status: 'matched', step: 1 } });
  const handleRelease = () => dispatch({ type: 'UPDATE_HANDOVER', payload: { id, status: 'released', step: 2 } });
  const handleCompleteTaker = () => dispatch({ type: 'UPDATE_HANDOVER', payload: { id, status: 'released', step: 2, note: 'Taker marked ready' } });
  const handleVerify = () => {
    dispatch({ type: 'UPDATE_HANDOVER', payload: { id, status: 'completed', step: 3 } });
    navigate('/success?type=complete');
  };
  const triggerGhost = () => dispatch({ type: 'UPDATE_HANDOVER', payload: { id, status: 'ghosted', daysLeft: 0 } });

  const steps = ho.timeline;
  const stepLabels = ['Pending Match', 'Matched & Escrowed', 'Code Released', 'Verified & Complete'];
  
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <button onClick={() => navigate('/handovers')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Handovers
        </button>

        <GhostWarningBanner daysLeft={ho.daysLeft} status={ho.status} />

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-zinc-800 bg-zinc-950/50">
             <div className="flex justify-between items-start mb-6">
               <div>
                 <h1 className="text-2xl font-bold text-white mb-2">{ho.projectTitle} Transfer</h1>
                 <p className="text-zinc-400 text-sm">System ID: {ho.id.toUpperCase()}</p>
               </div>
               <StatusBadge status={ho.status} />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className={`p-4 rounded-xl border ${isOwner ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
                 <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Owner (Buryer)</div>
                 <div className={`font-mono flex items-center gap-2 ${isOwner ? 'text-purple-400 font-bold' : 'text-zinc-300'}`}>
                   <UserCheck size={16} /> {ho.ownerAlias} {isOwner && '(You)'}
                 </div>
               </div>
               <div className={`p-4 rounded-xl border ${isTaker ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
                 <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Taker (Digger)</div>
                 <div className={`font-mono flex items-center gap-2 ${isTaker ? 'text-purple-400 font-bold' : 'text-zinc-300'}`}>
                   <Pickaxe size={16} /> {ho.takerAlias} {isTaker && '(You)'}
                 </div>
               </div>
             </div>
          </div>

          <div className="p-12 border-b border-zinc-800 overflow-x-auto">
            <div className="relative flex items-center justify-between min-w-[600px] w-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 z-0 rounded"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-500 z-0 transition-all duration-700 ease-out rounded shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${ho.status === 'ghosted' ? 100 : (ho.currentStep / (steps.length - 1)) * 100}%`, backgroundColor: ho.status === 'ghosted' ? '#ef4444' : '' }}
              ></div>

              {steps.map((step, idx) => {
                const isCompleted = idx <= ho.currentStep && ho.status !== 'ghosted';
                const isCurrent = idx === ho.currentStep && ho.status !== 'ghosted';
                const isGhosted = ho.status === 'ghosted';
                
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-3 bg-zinc-900/40 px-2 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      isGhosted ? 'bg-zinc-900 border-red-500 text-red-500' :
                      isCompleted ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                      'bg-zinc-900 border-zinc-700 text-zinc-600'
                    }`}>
                      {isGhosted ? <Skull size={18} /> : isCompleted ? <CheckCircle2 size={20} /> : <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                    </div>
                    <div className="text-center">
                      <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                         isGhosted ? 'text-red-400' : isCurrent ? 'text-purple-300' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
                      }`}>
                        {stepLabels[idx]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-zinc-950 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-3 max-w-md">
              <Lock size={24} className="text-zinc-500 shrink-0" />
              <p className="text-sm text-zinc-400">
                {ho.status === 'pending' && "Awaiting Owner approval. Stakes are locked in system escrow."}
                {ho.status === 'matched' && "Taker approved. Owner must now release code repository access via platform."}
                {ho.status === 'released' && "Code released. Taker is working. Awaiting final verification."}
                {ho.status === 'completed' && "Handover complete. Stakes and payouts have been processed."}
                {ho.status === 'ghosted' && "This handover was terminated by the system due to inactivity."}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
               {isOwner && ho.status === 'pending' && (
                 <button onClick={handleApprove} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                   Approve Taker
                 </button>
               )}
               {isOwner && ho.status === 'matched' && (
                 <button onClick={handleRelease} className="w-full md:w-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors flex gap-2 justify-center">
                   <Unlock size={18}/> Release Code Access
                 </button>
               )}
               {isOwner && ho.status === 'released' && (
                 <button onClick={handleVerify} className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex gap-2 justify-center">
                   <CheckSquare size={18}/> Verify Completion
                 </button>
               )}

               {isTaker && ho.status === 'pending' && (
                 <button disabled className="w-full md:w-auto px-6 py-3 bg-zinc-800 text-zinc-500 cursor-not-allowed rounded-lg font-medium">
                   Awaiting Owner
                 </button>
               )}
               {isTaker && ho.status === 'released' && (
                 <button onClick={handleCompleteTaker} className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                   Mark Ready for Verification
                 </button>
               )}

               {ho.status !== 'completed' && ho.status !== 'ghosted' && (
                 <button onClick={triggerGhost} className="px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors" title="Dev Tool: Simulate Timeout">
                   <FastForward size={14}/> Ghost
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const NewProjectPage = ({ navigate, db, dispatch }) => {
  const [escrowMode, setEscrowMode] = useState('stake');
  const [milestones, setMilestones] = useState([{ id: '1', title: '', payout: '' }, { id: '2', title: '', payout: '' }]);
  
  const handleBury = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    
    const newProject = {
      id: `prj-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: title,
      epitaph: formData.get('epitaph'),
      ownerAlias: db.currentUser.alias,
      stack: formData.get('stack').split(',').map(s => s.trim()),
      completion: parseInt(formData.get('completion')),
      effortHours: parseInt(formData.get('effort')),
      escrowMode: escrowMode,
      stakeAmount: escrowMode === 'stake' ? formData.get('stakeAmount') : null,
      status: 'buried',
      milestones: escrowMode === 'milestone' ? milestones.filter(m => m.title) : []
    };
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    navigate('/success?type=bury');
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Skull className="text-purple-500" size={28} /> Bury a Project
        </h1>
        <p className="text-zinc-400 mb-8">Surrender your code to the graveyard. The system will handle its resurrection safely.</p>

        <form onSubmit={handleBury} className="space-y-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl">
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Title</label>
              <input name="title" required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-purple-500/50 outline-none transition-all" placeholder="e.g. NextGen CRM" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Epitaph (Why did it die?)</label>
              <textarea name="epitaph" required rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-purple-500/50 outline-none italic transition-all" placeholder="e.g. Cofounder left, out of money..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Completion %</label>
                <input name="completion" required type="number" min="1" max="99" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-purple-500/50 outline-none transition-all" placeholder="60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Effort Logged (Hours)</label>
                <input name="effort" required type="number" min="1" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-purple-500/50 outline-none transition-all" placeholder="150" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tech Stack (comma separated)</label>
              <input name="stack" required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-purple-500/50 outline-none transition-all" placeholder="React, Node.js, PostgreSQL" />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 mt-8">
            <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-zinc-500" /> System Trust Protocol
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div 
                onClick={() => setEscrowMode('stake')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  escrowMode === 'stake' 
                    ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`font-bold ${escrowMode === 'stake' ? 'text-yellow-400' : 'text-zinc-300'}`}>Stake Lock</div>
                  {escrowMode === 'stake' && <CheckCircle2 size={16} className="text-yellow-500" />}
                </div>
                <div className="text-sm text-zinc-500">Taker deposits a fixed sum held by system until completion.</div>
              </div>
              
              <div 
                onClick={() => setEscrowMode('milestone')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  escrowMode === 'milestone' 
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                 <div className="flex justify-between items-center mb-2">
                  <div className={`font-bold ${escrowMode === 'milestone' ? 'text-blue-400' : 'text-zinc-300'}`}>Milestone Escrow</div>
                  {escrowMode === 'milestone' && <CheckCircle2 size={16} className="text-blue-500" />}
                </div>
                <div className="text-sm text-zinc-500">Define stages. System verifies partial progress.</div>
              </div>
            </div>

            {escrowMode === 'stake' && (
               <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 mb-6">
                 <label className="block text-sm font-medium text-yellow-400 mb-1.5">Required System Stake</label>
                 <input name="stakeAmount" required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:border-yellow-500/50 outline-none transition-all font-mono" placeholder="e.g. 500 CRED or $250" />
                 <p className="text-xs text-zinc-500 mt-2">This is the amount the taker risks losing if they ghost.</p>
               </div>
            )}

            {escrowMode === 'milestone' && (
              <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800 mb-6">
                <label className="block text-sm font-medium text-blue-400 mb-2">Define Milestones (2-5)</label>
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input 
                        required 
                        type="text" 
                        placeholder={`Milestone ${idx + 1} Name`} 
                        value={m.title}
                        onChange={(e) => {
                          const newM = [...milestones];
                          newM[idx].title = e.target.value;
                          setMilestones(newM);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 outline-none" 
                      />
                    </div>
                    <div className="w-24">
                      <input 
                        required 
                        type="text" 
                        placeholder="Payout %"
                        value={m.payout}
                        onChange={(e) => {
                          const newM = [...milestones];
                          newM[idx].payout = e.target.value;
                          setMilestones(newM);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 outline-none font-mono" 
                      />
                    </div>
                  </div>
                ))}
                {milestones.length < 5 && (
                  <button type="button" onClick={() => setMilestones([...milestones, {id: Date.now().toString(), title:'', payout:''}])} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2">
                    <Plus size={14} /> Add Stage
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-800">
            <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
              <Skull size={18} /> Bury Project in System
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

const StatePage = ({ type, navigate }) => {
  const isSuccess = type === 'commit' || type === 'bury' || type === 'complete';
  const Icon = isSuccess ? Check : XCircle;
  const color = isSuccess ? 'text-green-400' : 'text-red-400';
  const glow = isSuccess ? 'shadow-[0_0_50px_rgba(34,197,94,0.2)]' : 'shadow-[0_0_50px_rgba(239,68,68,0.2)]';

  const config = {
    commit: { title: 'Stake Committed', msg: 'You have claimed this soul. System has locked your stake. Awaiting owner release.' },
    bury: { title: 'Project Buried', msg: 'Your project is now in the graveyard. Escrow terms are active.' },
    complete: { title: 'System Verified', msg: 'Handover complete. Stakes released. Code belongs to the new owner.' },
    error: { title: 'System Error', msg: 'An invalid operation occurred.' }
  };
  
  const current = config[type] || config.error;

  return (
    <PageTransition>
       <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }} 
           animate={{ scale: 1, opacity: 1 }} 
           transition={{ type: "spring" }}
           className={`w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 ${color} ${glow}`}
         >
           <Icon size={40} />
         </motion.div>
         <h1 className="text-3xl font-bold text-white mb-4">{current.title}</h1>
         <p className="text-zinc-400 max-w-md mx-auto mb-10">{current.msg}</p>
         
         <div className="flex gap-4">
           <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
             Go to Dashboard
           </button>
           <button onClick={() => navigate('/browse')} className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors">
             Keep Browsing
           </button>
         </div>
       </div>
    </PageTransition>
  );
};


export default function Page() {
  const [currentPath, setCurrentPath] = useState('/');
  const [db, setDb] = useState(INITIAL_DB);

  const dispatch = (action) => {
    switch(action.type) {
      case 'ADD_PROJECT':
        setDb(prev => ({ ...prev, projects: [action.payload, ...prev.projects] }));
        break;
      case 'COMMIT_PROJECT': {
        const { project, takerAlias } = action.payload;
        const updatedProjects = db.projects.map(p => p.id === project.id ? { ...p, status: 'pending' } : p);
        const newHandover = {
          id: `ho-${Date.now()}`,
          projectId: project.id,
          projectTitle: project.title,
          ownerAlias: project.ownerAlias,
          takerAlias: takerAlias,
          status: 'pending',
          stake: project.escrowMode === 'stake' ? project.stakeAmount : 'Milestone Escrow',
          daysLeft: 14,
          currentStep: 0,
          timeline: ['pending', 'matched', 'released', 'completed']
        };
        setDb(prev => ({ ...prev, projects: updatedProjects, handovers: [newHandover, ...prev.handovers] }));
        break;
      }
      case 'UPDATE_HANDOVER': {
        const { id, status, step, daysLeft } = action.payload;
        const updatedHandovers = db.handovers.map(h => 
          h.id === id ? { ...h, status, currentStep: step !== undefined ? step : h.currentStep, daysLeft: daysLeft !== undefined ? daysLeft : h.daysLeft } : h
        );
        const ho = db.handovers.find(h=>h.id === id);
        let updatedProjects = db.projects;
        if(status === 'completed' || status === 'ghosted') {
           updatedProjects = db.projects.map(p => p.id === ho.projectId ? { ...p, status: status } : p);
        } else if (status === 'released') {
           updatedProjects = db.projects.map(p => p.id === ho.projectId ? { ...p, status: 'active' } : p);
        }
        setDb(prev => ({ ...prev, handovers: updatedHandovers, projects: updatedProjects }));
        break;
      }
      default: break;
    }
  };

  const renderRoute = () => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);

    if (currentPath === '/') return <LandingPage navigate={setCurrentPath} />;
    if (currentPath === '/browse') return <BrowsePage navigate={setCurrentPath} db={db} />;
    if (currentPath === '/dashboard') return <DashboardPage navigate={setCurrentPath} db={db} />;
    if (currentPath === '/handovers') return <HandoversPage navigate={setCurrentPath} db={db} />;
    if (currentPath === '/new-project') return <NewProjectPage navigate={setCurrentPath} db={db} dispatch={dispatch} />;
    
    if (currentPath.startsWith('/projects/')) {
      const slug = currentPath.split('/')[2];
      return <ProjectDetailPage slug={slug} db={db} navigate={setCurrentPath} dispatch={dispatch} />;
    }
    
    if (currentPath.startsWith('/handovers/')) {
      const id = currentPath.split('/')[2];
      return <HandoverDetailPage id={id} db={db} navigate={setCurrentPath} dispatch={dispatch} />;
    }

    if (currentPath.startsWith('/success')) {
      const params = new URLSearchParams(currentPath.split('?')[1]);
      return <StatePage type={params.get('type')} navigate={setCurrentPath} />;
    }
    
    return <StatePage type="error" navigate={setCurrentPath} />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-purple-500/30 selection:text-purple-200 font-sans flex flex-col">
      <Navbar currentPath={currentPath} navigate={setCurrentPath} user={db.currentUser} />
      
      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          <div key={currentPath}>
            {renderRoute()}
          </div>
        </AnimatePresence>
      </main>
      
      <div className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 p-2 text-center text-[10px] sm:text-xs text-zinc-600 font-mono flex flex-wrap items-center justify-center gap-2 sm:gap-4 z-40">
        <div className="flex items-center gap-1.5"><Lock size={12} className="text-purple-500/70" /> System-Enforced Trust Enabled</div>
        <div className="hidden sm:block h-3 w-px bg-zinc-800"></div>
        <div className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-zinc-500" /> Direct Communication Blocked</div>
      </div>
    </div>
  );
}
