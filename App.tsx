import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  Trophy, Layout, Coffee, Settings2, Power,
  ShieldAlert, Star, History, Radio, Link as LinkIcon,
  Info, Heart
} from 'lucide-react';

const LASTFM_USER = 'IvanPurr'; 
const LASTFM_API_KEY = '52f25787af57e73404ef01ba7a400fac';

interface Track {
  name: string;
  artist: string;
  album: string;
  image: string;
  nowPlaying: boolean;
  url: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  isSparkle?: boolean;
}

const App: React.FC = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [headerClicks, setHeaderClicks] = useState(0);
  const [foundSecrets, setFoundSecrets] = useState<string[]>([]);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [isUltrakillMode, setIsUltrakillMode] = useState(false);
  
  const particleIdCounter = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const createParticles = useCallback((x: number, y: number, count = 8, color = '#ffb7c5', size = 4, isSparkle = false) => {
    if (performanceMode) return;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const force = isSparkle ? Math.random() * 1.5 + 0.5 : 2 + Math.random() * 5;
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: isSparkle ? Math.sin(angle) * force : Math.sin(angle) * force - 1.5,
        color,
        size: isSparkle ? Math.random() * 1.8 + 0.8 : Math.random() * size + 2,
        life: 1.0,
        isSparkle
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, [performanceMode]);

  const playSound = useCallback((type: 'hover' | 'click' | 'xp' | 'glitch') => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      const sources = {
        hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        xp: 'https://www.myinstants.com/media/sounds/levelup.mp3', 
        glitch: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3'
      };
      audio.src = (sources as any)[type] || sources.click;
      audio.volume = type === 'hover' ? 0.03 : 0.2;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [hasInteracted]);

  const addSecret = useCallback((id: string) => {
    if (!foundSecrets.includes(id)) {
      setFoundSecrets(prev => [...prev, id]);
    }
  }, [foundSecrets]);

  useEffect(() => {
    if (performanceMode) return;
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      if (Math.random() > 0.8) {
        const color = isUltrakillMode ? '#ef4444' : (Math.random() > 0.6 ? '#ffffff' : '#ffb7c5');
        createParticles(e.clientX, e.clientY, 1, color, 1.2, true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [createParticles, isUltrakillMode, performanceMode]);

  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasInteracted) setHasInteracted(true);
      const key = e.key.toLowerCase();
      const expectedKey = code[konamiProgress.length].toLowerCase();
      
      if (key === expectedKey) {
        const next = [...konamiProgress, key];
        if (next.length === code.length) {
          addSecret('konami');
          setIsUltrakillMode(true);
          setKonamiProgress([]);
          createParticles(window.innerWidth / 2, window.innerHeight / 2, 120, '#ef4444', 10);
        } else {
          setKonamiProgress(next);
        }
      } else {
        setKonamiProgress(key === code[0].toLowerCase() ? [key] : []);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress, addSecret, hasInteracted, createParticles]);

  useEffect(() => {
    if (particles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.isSparkle ? p.vy + 0.01 : p.vy + 0.1,
          life: p.isSparkle ? p.life - 0.015 : p.life - 0.02
        }))
        .filter(p => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (!hasInteracted) setHasInteracted(true);
    playSound('click');
    const color = isUltrakillMode ? '#ef4444' : (Math.random() > 0.4 ? '#ffffff' : '#ffb7c5');
    createParticles(e.clientX, e.clientY, 12, color);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasInteracted) setHasInteracted(true);
    const nextClicks = headerClicks + 1;
    setHeaderClicks(nextClicks);
    if (nextClicks === 10) {
      playSound('xp');
      addSecret('xp_egg');
      createParticles(e.clientX, e.clientY, 80, '#4ade80', 8);
    } else {
      playSound('click');
      createParticles(e.clientX, e.clientY, 10, isUltrakillMode ? '#ef4444' : '#ffb7c5');
    }
  };

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`);
        const data = await response.json();
        const latest = data?.recenttracks?.track?.[0];
        if (latest) {
          setTrack({
            name: latest.name,
            artist: latest.artist['#text'],
            album: latest.album['#text'],
            image: latest.image[3]['#text'],
            nowPlaying: latest['@attr']?.nowplaying === 'true',
            url: latest.url
          });
        }
      } catch (e) {}
    };
    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use framer-motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  return (
    <div 
      id="root-container" 
      onMouseDown={handleGlobalClick}
      className={`min-h-screen py-8 px-4 md:px-8 transition-colors duration-700 font-retro ${isUltrakillMode ? 'ultrakill-theme text-red-500' : 'text-white'}`}
    >
      <div className="fixed inset-0 pointer-events-none z-[300]">
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute"
            style={{ 
              left: p.x, 
              top: p.y, 
              width: p.size * 1.5, 
              height: p.size * 1.5, 
              backgroundColor: p.color,
              opacity: p.life,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${p.isSparkle ? '10px' : '0px'} ${p.color}`,
              filter: p.isSparkle ? 'brightness(1.5)' : 'none',
              borderRadius: '0px'
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-6xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Hero */}
        <motion.header 
          variants={itemVariants}
          className={`dimden-panel p-0 overflow-hidden relative group transition-all duration-500 ${isUltrakillMode ? 'border-red-500/40 shadow-[8px_8px_0px_rgba(239,68,68,0.5)] bg-red-950/10' : 'hover:border-sakura-400/20'}`}
        >
          <div className="bg-black/40 p-3 border-b-2 border-white/10 flex items-center justify-between">
            <h3 className="font-mono text-[10px] opacity-60 uppercase tracking-widest flex items-center gap-2">
              {isUltrakillMode ? <ShieldAlert size={12} className="text-red-500" /> : <Coffee size={12} className="text-sakura-400" />}
              {isUltrakillMode ? 'ULTRAKILL_SESSION.v1' : 'user_identity.init()'}
            </h3>
            <Layout size={12} className="text-white/20" />
          </div>
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 text-center sm:text-left">
              <div 
                className={`relative w-32 h-32 md:w-36 md:h-36 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:rotate-3 cursor-crosshair shrink-0 ${isUltrakillMode ? 'shadow-[8px_8px_0px_rgba(239,68,68,0.6)]' : 'shadow-[8px_8px_0px_rgba(0,0,0,0.8)]'}`}
                onMouseEnter={() => playSound('hover')}
              >
                 <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isUltrakillMode ? 'hue-rotate-[320deg] saturate-150' : ''}`} alt="Profile Avatar" />
                 <div className="absolute inset-0 pointer-events-none" />
              </div>
              
              <div onClick={handleHeaderClick} className="cursor-pointer select-none">
                <h1 className={`font-pixel text-2xl sm:text-3xl md:text-4xl mb-4 leading-relaxed tracking-tight flex items-center justify-center sm:justify-start gap-4 ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>
                  {isUltrakillMode ? 'ULTRA_KIT' : 'KITSUYA.SPACE'}
                  {(headerClicks >= 10 || isUltrakillMode) && <Trophy size={32} className="text-yellow-400 animate-bounce drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-3 opacity-80 mt-3 relative">
                  <span className="relative flex items-center justify-center">
                    <span className={`w-2.5 h-2.5 rounded-none border border-black ${track?.nowPlaying ? 'bg-green-400' : (isUltrakillMode ? 'bg-red-500' : 'bg-sakura-400')}`} />
                    {!performanceMode && <span className={`absolute w-6 h-6 rounded-none border border-current animate-ping opacity-30 ${track?.nowPlaying ? 'text-green-400' : (isUltrakillMode ? 'text-red-500' : 'text-sakura-400')}`} />}
                  </span>
                  <p className={`font-mono text-sm uppercase tracking-widest ${isUltrakillMode ? 'text-red-400' : 'text-sakura-200'}`}>
                     {isUltrakillMode ? '~ blood_is_fuel: /dev/null' : '~ root@kitsuya: /dev/minecraft'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Content Area */}
          <motion.div variants={containerVariants} className="lg:col-span-8 space-y-6 flex flex-col">
            
            <motion.section variants={itemVariants} className={`dimden-panel p-0 overflow-hidden group ${isUltrakillMode ? 'border-red-500/50' : ''}`}>
              <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                <h3 className="font-mono text-xs opacity-60 uppercase tracking-widest flex items-center gap-2">
                  {isUltrakillMode ? <Terminal size={14} className="text-red-500" /> : <Sparkles size={14} className="text-sakura-400" />}
                  {isUltrakillMode ? 'MANIFEST_LOG.txt' : 'About_Me.txt'}
                </h3>
                <Activity size={14} className="text-white/20" />
              </div>
              <div className="p-8 md:p-10 flex flex-col gap-6 text-xl leading-relaxed text-white/90">
                <p className={`font-pixel text-xl md:text-2xl ${isUltrakillMode ? 'text-red-500 font-bold' : 'text-sakura-200'} tracking-tighter leading-normal`}>
                  hihi :3 im kit
                </p>
                <p>
                  i’ve been doing minecraft dev stuff for around <span className={`${isUltrakillMode ? 'text-red-400' : 'text-sakura-300'} font-semibold border-b-2 border-sakura-400/20`}>7–8 years</span>, mostly focused on performance and systems. i mainly work with fabric and neoforge.
                </p>
                <p>
                  i spend a lot of time fixing tps issues, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                </p>
                <p>
                  i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are under nda, so i can’t say much about them. i also make modpacks and help optimize higher-end networks.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className={`dimden-panel p-0 overflow-hidden group relative ${isUltrakillMode ? 'border-red-500/50' : ''}`}>
              <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                 <h2 className="font-mono text-xs uppercase tracking-widest flex items-center gap-2 text-white/60">
                   <Star size={14} className={`${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'} opacity-80`} />
                   {isUltrakillMode ? 'OPTIMIZED_INFRASTRUCTURE' : 'Recommended Host'}
                 </h2>
                 <ShieldCheck size={16} className="text-white/20" />
              </div>
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className={`w-32 h-32 overflow-hidden shrink-0 shadow-[8px_8px_0px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3 ${isUltrakillMode ? 'shadow-[8px_8px_0px_rgba(239,68,68,0.5)]' : ''}`}>
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={`w-full h-full object-cover ${isUltrakillMode ? 'grayscale saturate-200' : ''}`} alt="Pyro" />
                </div>
                <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-4">
                  <div>
                    <h3 className={`font-pixel text-2xl mb-4 leading-normal ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>Pyro</h3>
                    <p className={`text-xl ${isUltrakillMode ? 'text-red-200/80' : 'text-white/80'}`}>
                      High end game servers with super fast connections. Powerful AMD Ryzen processors.
                    </p>
                  </div>
                  
                  <div className={`mt-2 p-5 border-2 flex gap-4 text-left ${isUltrakillMode ? 'bg-red-950/40 border-red-500/40 text-red-100/80' : 'bg-black/40 border-white/10 text-white/80'}`}>
                    <Info size={20} className="shrink-0 mt-0.5 opacity-60" />
                    <p className="text-[17px] leading-relaxed">
                      <span className="font-bold text-white">Disclaimer:</span> Kit is not partnered with Pyro, but the link below does support them. It's the only server host i use for my projects because of their outstanding quality and price.
                    </p>
                  </div>

                  <a href="https://pyro.host/?a=41" target="_blank" rel="noreferrer" className={`mt-4 inline-flex items-center gap-3 text-lg font-bold transition-all border-2 py-3 px-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none ${isUltrakillMode ? 'bg-red-900/60 hover:bg-red-800 border-red-500 text-white' : 'bg-white/10 border-white text-white hover:bg-sakura-300 hover:text-black hover:border-sakura-500'}`}>
                    <span className="font-pixel text-[10px] md:text-xs">
                      {isUltrakillMode ? 'SECURE_LINK' : 'Visit Pyro'}
                    </span>
                    <ExternalLink size={16} className={isUltrakillMode ? '' : 'text-current'} />
                  </a>
                </div>
              </div>
            </motion.section>

          </motion.div>

          {/* Sidebar */}
          <motion.aside variants={containerVariants} className="lg:col-span-4 space-y-6 flex flex-col">
            
            <motion.div variants={itemVariants} className={`dimden-panel p-0 overflow-hidden group ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
              <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                <h3 className="font-mono text-xs opacity-60 uppercase tracking-widest">{isUltrakillMode ? 'ACCESS_NODES' : 'Links'}</h3>
                <LinkIcon size={14} className="text-white/20" />
              </div>
              <nav className="p-3 space-y-1">
                {[
                  { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                  { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                  { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
                ].map((link, idx) => (
                  <a key={idx} href={link.href} target="_blank" rel="noreferrer" className={`group/link py-3 px-4 flex items-center justify-between transition-all duration-300 border-2 border-transparent hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.8)] ${isUltrakillMode ? 'text-red-400 hover:bg-red-950/40 hover:border-red-500 hover:text-red-300' : 'text-white/80 hover:text-white hover:bg-black/40 hover:border-sakura-400'}`}>
                    <div className="flex items-center gap-4 text-lg">
                      <link.icon size={20} className={`${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'} opacity-80`} />
                      <span className="font-pixel text-[10px] mt-1">{link.label}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-50 transition-opacity" />
                  </a>
                ))}
              </nav>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className={`dimden-panel p-0 overflow-hidden cursor-pointer select-none transition-colors ${isUltrakillMode ? 'border-red-500/40' : 'hover:border-sakura-400/40'}`}
              onClick={(e) => {
                addSecret('profile');
                playSound('glitch');
                createParticles(e.clientX, e.clientY, 25, '#ffffff', 6, true);
              }}
            >
              <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                <h3 className="font-mono text-xs opacity-60 uppercase tracking-widest">{isUltrakillMode ? 'SUBJECT_DATA' : 'Profile'}</h3>
                <User size={14} className="text-white/20" />
              </div>
              <div className="p-5 flex flex-col gap-3">
                  {[
                    { label: 'Name', value: 'Kit' },
                    { label: 'Age', value: '20' },
                    { label: 'Pronouns', value: 'They/Them' },
                    { label: 'Timezone', value: 'GMT' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 border-2 border-white/5 bg-black/20">
                      <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{item.label}</span>
                      <span className={`text-[17px] tracking-tight ${isUltrakillMode ? 'text-red-400' : 'text-white/90'}`}>{item.value}</span>
                    </div>
                  ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`dimden-panel p-0 overflow-hidden ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
               <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                 <h3 className="font-mono text-xs opacity-60 uppercase tracking-widest">{isUltrakillMode ? 'HARDWARE_SPECS' : 'Hardware'}</h3>
                 <Cpu size={14} className="text-white/20" />
               </div>
               <div className="p-5 flex flex-col gap-2">
                  {[
                    { label: 'CPU', value: 'Epyc 7543P' },
                    { label: 'MEM', value: '28GB DDR4' },
                    { label: 'SSD', value: '2tb NVMe' }
                  ].map((spec, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 px-3 border-b-2 border-white/5 last:border-0 hover:bg-white/10 transition-all hover:pl-5">
                      <span className="font-mono text-xs text-white/50 uppercase tracking-widest">{spec.label}</span>
                      <span className={`font-mono text-sm font-bold ${isUltrakillMode ? 'text-red-500' : 'text-sakura-200'}`}>{spec.value}</span>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`dimden-panel p-0 overflow-hidden ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
               <div className="bg-black/40 p-4 border-b-2 border-white/10 flex items-center justify-between">
                 <h3 className="font-mono text-xs opacity-60 uppercase tracking-widest flex items-center gap-2">
                   {track?.nowPlaying ? <><Radio size={12} className="text-green-400" /> Now Playing</> : <><History size={12} className="text-white/60" /> Last Track</>}
                 </h3>
                 <Star size={14} className="text-white/20" />
               </div>
               <div className="p-5">
                 {track ? (
                   <a href={track.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 group/track">
                      <div className="w-14 h-14 overflow-hidden shrink-0 relative">
                        <img src={track.image || ''} className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 ${isUltrakillMode ? 'sepia hue-rotate-[320deg]' : ''}`} alt="Art" />
                        {track.nowPlaying && <div className="absolute inset-0 border-2 border-green-400/50 animate-pulse pointer-events-none" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-base font-bold truncate ${isUltrakillMode ? 'text-red-400' : 'text-white/90'}`}>{track.name}</p>
                        <p className="font-mono text-xs text-white/50 truncate uppercase mt-1">{track.artist}</p>
                      </div>
                   </a>
                 ) : (
                   <div className="text-center py-4 text-xs font-mono opacity-40 uppercase tracking-widest">No Signal</div>
                 )}
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className={`dimden-panel p-0 overflow-hidden group/support ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
               <a 
                href="https://ko-fi.com/kitsuyadev" 
                target="_blank" 
                rel="noreferrer"
                className={`p-5 flex items-center justify-center gap-3 transition-colors text-lg ${isUltrakillMode ? 'hover:bg-red-950/40 text-red-500' : 'hover:bg-black/40 text-sakura-300'}`}
               >
                 <Coffee size={20} className="group-hover/support:rotate-12 transition-transform" />
                 <span className="font-bold">Support on Ko-fi</span>
               </a>
            </motion.div>

            <motion.div variants={itemVariants} className={`dimden-panel p-5 overflow-hidden relative ${isUltrakillMode ? 'border-red-500/40 bg-red-950/20' : ''}`}>
               <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-4">
                 {isUltrakillMode ? 'MEMORY_FRAGMENT_LOG' : 'Discovery Log'}
               </div>
               <div className="space-y-3">
                   {['xp_egg', 'konami', 'profile'].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className={`w-2 h-2 ${foundSecrets.includes(s) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/10'}`} />
                      <span className={`font-mono text-xs uppercase tracking-widest ${foundSecrets.includes(s) ? (isUltrakillMode ? 'text-red-400' : 'text-white') : 'text-white/20'}`}>
                        {foundSecrets.includes(s) ? s.replace('_', ' ') : '??????'}
                      </span>
                    </div>
                  ))}
               </div>
            </motion.div>

          </motion.aside>

        </div>
        
        <motion.footer variants={itemVariants} className="py-12 text-center">
            <p className="font-mono text-xs text-white/20 uppercase tracking-[0.4em]">
                ~ 2026 - the end of time ~
            </p>
        </motion.footer>

      </motion.div>

      {/* OVERLAYS */}
      {isUltrakillMode && (
        <button 
          onClick={() => setIsUltrakillMode(false)}
          className="fixed top-6 right-6 z-[100] dimden-panel px-6 py-3 border-red-500/50 bg-red-950/40 text-red-500 font-pixel text-[10px] tracking-widest uppercase hover:bg-red-900/60 flex items-center gap-3 animate-pulse shadow-[4px_4px_0_rgba(239,68,68,1)] transition-all"
        >
          <Power size={16} />
          <span>EXIT_PROTOCOL</span>
        </button>
      )}

      {/* SETTINGS */}
      <div className="fixed bottom-6 left-6 z-[1000] flex flex-col gap-4">
         <button 
          onClick={() => {
            playSound('click');
            setShowSettings(!showSettings);
          }}
          className={`dimden-panel p-4 transition-transform active:scale-95 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] hover:bg-black/40 ${isUltrakillMode ? 'text-red-500 border-red-500/50 shadow-[4px_4px_0px_rgba(239,68,68,0.5)]' : 'text-white/80'}`}
          aria-label="Open Settings"
        >
          <Settings2 size={24} className={`${showSettings ? 'rotate-90' : ''} transition-transform duration-500`} />
        </button>
        {showSettings && (
          <div className="absolute bottom-20 left-0 dimden-panel p-5 w-64 space-y-4 animate-in fade-in slide-in-from-bottom-4 shadow-[8px_8px_0_rgba(0,0,0,0.8)]">
            <h4 className="font-mono text-[10px] text-white/40 uppercase mb-3 tracking-widest">Internal_Config</h4>
            <button 
              onClick={() => setPerformanceMode(!performanceMode)} 
              className="w-full text-left p-3 border-2 border-white/10 hover:bg-white/10 flex justify-between items-center transition-colors"
            >
              <span className="text-sm font-pixel text-[10px]">PerfFX</span>
              <span className={`font-mono text-xs font-bold ${performanceMode ? 'text-red-400' : 'text-green-400'}`}>{performanceMode ? '[OFF]' : '[ON]'}</span>
            </button>
            <div className="font-mono text-[9px] text-white/30 uppercase text-center mt-3 tracking-widest">Build: 2026.02.revB-Pixel</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default App;
