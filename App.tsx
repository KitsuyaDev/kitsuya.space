
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  Trophy, Layout, Coffee, Settings2, Power,
  ShieldAlert, Star, History, Radio, Link as LinkIcon,
  Info
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

  const playSound = useCallback((type: 'hover' | 'click' | 'xp' | 'parry' | 'glitch') => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      const sources = {
        hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        xp: 'https://www.myinstants.com/media/sounds/levelup.mp3', 
        parry: 'https://www.myinstants.com/media/sounds/ultrakill-parry.mp3',
        glitch: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3'
      };
      audio.src = (sources as any)[type] || sources.click;
      audio.volume = type === 'hover' ? 0.04 : 0.25;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [hasInteracted]);

  const addSecret = useCallback((id: string) => {
    if (!foundSecrets.includes(id)) {
      setFoundSecrets(prev => [...prev, id]);
      playSound('parry');
    }
  }, [foundSecrets, playSound]);

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
          createParticles(window.innerWidth / 2, window.innerHeight / 2, 100, '#ef4444', 8);
        } else {
          setKonamiProgress(next);
        }
      } else {
        setKonamiProgress(key === code[0].toLowerCase() ? [key] : []);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress, addSecret, hasInteracted]);

  const createParticles = (x: number, y: number, count = 8, color = '#ffb7c5', size = 4) => {
    if (performanceMode) return;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const force = 2 + Math.random() * 6;
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - 2,
        color,
        size: Math.random() * size + 2,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15,
          life: p.life - 0.015
        }))
        .filter(p => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (!hasInteracted) setHasInteracted(true);
    playSound('click');
    const color = isUltrakillMode ? '#ef4444' : '#ffb7c5';
    createParticles(e.clientX, e.clientY, 10, color);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasInteracted) setHasInteracted(true);
    const nextClicks = headerClicks + 1;
    setHeaderClicks(nextClicks);
    if (nextClicks === 10) {
      playSound('xp');
      addSecret('xp_egg');
      createParticles(e.clientX, e.clientY, 60, '#4ade80', 6);
    } else {
      playSound('click');
      createParticles(e.clientX, e.clientY, 8, isUltrakillMode ? '#ef4444' : '#ffb7c5');
    }
  };

  const styleRank = (() => {
    const count = foundSecrets.length;
    if (count >= 3) return 'SSS';
    if (count === 2) return 'A';
    if (count === 1) return 'B';
    return 'D';
  })();

  const styleProgress = (foundSecrets.length / 3) * 100;

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

  return (
    <div 
      id="root-container" 
      onMouseDown={handleGlobalClick}
      className={`max-w-[1400px] mx-auto space-y-6 md:space-y-8 relative z-10 py-4 px-3 md:px-6 transition-all duration-700 bg-transparent ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}
    >
      
      {isUltrakillMode && (
        <style dangerouslySetInnerHTML={{ __html: `
          #grid { background-image: linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px) !important; }
          #mouse-glow { background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 75%) !important; }
          #blob-1 { background: radial-gradient(circle, #ef4444 0%, transparent 70%) !important; opacity: 0.15 !important; }
          #blob-2 { background: radial-gradient(circle, #facc15 0%, transparent 70%) !important; opacity: 0.1 !important; }
        `}} />
      )}

      <div className="fixed inset-0 pointer-events-none z-[300]">
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute"
            style={{ 
              left: p.x, 
              top: p.y, 
              width: p.size, 
              height: p.size, 
              backgroundColor: p.color,
              opacity: p.life,
              transform: 'translate(-50%, -50%)',
              imageRendering: 'pixelated',
              boxShadow: `0 0 4px ${p.color}`
            }}
          />
        ))}
      </div>

      <header className={`dimden-panel p-0 overflow-hidden group border-pink-400/10 hover:border-pink-500/30 transition-all ${isUltrakillMode || styleRank === 'SSS' ? 'shadow-[0_0_40px_rgba(239,68,68,0.3)] border-red-500/40' : ''}`}>
        <div className="bg-black/[0.1] dark:bg-white/[0.03] p-2 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-[0.3em] flex items-center gap-2">
            {isUltrakillMode ? <ShieldAlert size={10} className="text-red-500" /> : <Coffee size={10} className="text-pink-500" />}
            {isUltrakillMode ? 'ULTRAKILL_SESSION.v1' : 'user_identity.init()'}
          </h3>
          <Layout size={10} className="text-black/10 dark:text-white/10" />
        </div>
        <div className="p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative z-10 text-center sm:text-left">
            <div 
              className={`relative w-32 h-32 md:w-40 md:h-40 transition-all duration-1000 md:group-hover:scale-105 cursor-crosshair shrink-0 p-1 border-2 rounded-full overflow-visible ${isUltrakillMode ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'border-[#ff4d7a] shadow-[0_0_25px_rgba(255,77,122,0.6)]'}`}
              onMouseEnter={() => playSound('hover')}
              style={{ filter: isUltrakillMode ? 'drop-shadow(0 0 20px #ef4444)' : 'drop-shadow(0 0 15px #ff4d7a)' }}
            >
               <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                    className={`w-full h-full object-cover transition-all duration-1000 rounded-full ${isUltrakillMode || styleRank === 'SSS' ? 'hue-rotate-[320deg] saturate-150' : ''}`} alt="pfp" />
               <div className="absolute inset-0 rounded-full border border-white/10" />
            </div>
            <div onClick={handleHeaderClick} className="cursor-pointer select-none group/name">
              <h1 className="pixel-title text-2xl sm:text-3xl md:text-4xl mb-3 transition-all tracking-tight uppercase flex items-center justify-center sm:justify-start gap-4">
                {isUltrakillMode || styleRank === 'SSS' ? 'ULTRA_KIT' : 'KITSUYA.SPACE'}
                {(headerClicks >= 10 || isUltrakillMode) && <Trophy size={20} className="text-yellow-400 animate-bounce" />}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="relative flex items-center justify-center">
                  <span className={`w-3 h-3 rounded-full ${track?.nowPlaying ? 'bg-green-500' : (isUltrakillMode ? 'bg-red-500' : 'bg-pink-500')}`} />
                  {!performanceMode && <span className={`absolute w-6 h-6 rounded-full animate-ping opacity-30 ${track?.nowPlaying ? 'bg-green-500' : (isUltrakillMode ? 'bg-red-500' : 'bg-pink-500')}`} />}
                </div>
                <p className={`terminal-font text-xl sm:text-2xl opacity-70 uppercase tracking-widest ${isUltrakillMode ? 'text-red-400' : 'text-pink-100'}`}>
                   {isUltrakillMode || styleRank === 'SSS' ? '~ blood_is_fuel: /dev/null' : '~ root@kitsuya: /dev/minecraft'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 md:border-l border-black/5 dark:border-white/5 md:pl-12 lg:pl-16 relative z-10 w-full sm:w-auto">
             <div className="flex items-baseline gap-4 mb-1">
                <div className={`terminal-font font-black italic tracking-tighter transition-all duration-300 ${isUltrakillMode || styleRank === 'SSS' ? 'text-7xl scale-110 text-red-500 animate-pulse' : 'text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}>
                  {styleRank}
                </div>
                <div className="pixel-title text-[9px] opacity-40 uppercase tracking-tighter">{isUltrakillMode ? 'BLOOD_RANK' : 'Style Rank'}</div>
             </div>
             <div className="w-48 sm:w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div className={`h-full transition-all duration-1000 shadow-[0_0_15px_#ef4444] ${isUltrakillMode || styleRank === 'SSS' ? 'bg-red-500' : 'bg-red-600'}`} style={{ width: `${styleProgress}%` }} />
             </div>
             <div className="flex justify-between w-48 sm:w-64 terminal-font text-xs opacity-40 uppercase italic tracking-widest mt-1">
                <span>{foundSecrets.length}/3 Secrets</span>
                <span className="text-red-500 animate-pulse">{(isUltrakillMode || styleRank === 'SSS') ? 'MAXIMUM' : ''}</span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        <aside className="md:col-span-3 space-y-8 order-2 md:order-1">
          <div className={`dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5 ${isUltrakillMode ? 'border-red-500/20' : ''}`}>
            <div className="bg-black/[0.05] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">{isUltrakillMode ? 'ACCESS_NODES' : 'Links'}</h3>
              <LinkIcon size={12} className="text-black/20 dark:text-white/10" />
            </div>
            <nav className="flex flex-col p-2 gap-1">
              {[
                { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
              ].map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" className={`sidebar-link group/link !text-2xl !py-3 px-4 rounded-lg flex items-center gap-4 terminal-font ${isUltrakillMode ? 'text-red-400 hover:text-red-500' : 'text-white'}`}>
                  <link.icon size={18} className={`${isUltrakillMode ? 'text-red-500' : 'text-pink-400'} transition-all`} />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div 
            className={`dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5 cursor-pointer ${isUltrakillMode ? 'border-red-500/20' : ''}`}
            onClick={(e) => {
              addSecret('profile');
              playSound('glitch');
              createParticles(e.clientX, e.clientY, 15, '#ff00ff', 6);
            }}
          >
            <div className="bg-black/[0.05] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">{isUltrakillMode ? 'SUBJECT_DATA' : 'Profile'}</h3>
              <User size={12} className="text-black/20 dark:text-white/10" />
            </div>
            <div className="p-5 space-y-2">
                {[
                  { label: 'Name', value: 'Kit' },
                  { label: 'Age', value: '20' },
                  { label: 'Pronouns', value: 'They/Them' },
                  { label: 'Timezone', value: 'GMT' }
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center py-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 hover:${isUltrakillMode ? 'bg-red-500/5' : 'bg-pink-500/5'} transition-all px-2 rounded`}>
                    <span className="terminal-font text-black/40 dark:text-white/30 text-base uppercase tracking-widest">{item.label}</span>
                    <span className={`terminal-font text-xl ${isUltrakillMode ? 'text-red-400' : 'text-pink-100'}`}>{item.value}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Moved Track Info to left sidebar */}
          <div className={`dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5 ${isUltrakillMode ? 'border-red-500/20' : ''}`}>
             <div className="bg-black/[0.05] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest flex items-center gap-2">
                 {track?.nowPlaying ? <><Radio size={12} className="text-green-400" /> Now Playing</> : <><History size={12} className="text-pink-400/60" /> Last Track</>}
               </h3>
             </div>
             <div className="p-4">
               {track ? (
                 <a href={track.url} target="_blank" className="flex items-center gap-4 group/track">
                    <div className="w-14 h-14 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden shrink-0 shadow-lg">
                      <img src={track.image || ''} className={`w-full h-full object-cover ${isUltrakillMode ? 'sepia hue-rotate-[320deg]' : ''}`} alt="Art" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`terminal-font text-lg leading-tight truncate font-bold ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>{track.name}</p>
                      <p className="terminal-font text-sm text-black/50 dark:text-white/40 truncate uppercase mt-0.5">{track.artist}</p>
                    </div>
                 </a>
               ) : (
                 <div className="text-center py-4 opacity-10 terminal-font text-sm uppercase tracking-widest">No Signal</div>
               )}
             </div>
          </div>
        </aside>

        <main className="md:col-span-6 space-y-8 order-1 md:order-2">
          <section className={`dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5 ${isUltrakillMode ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : ''}`}>
            <div 
              className={`bg-black/[0.05] dark:bg-white/[0.02] p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between ${isUltrakillMode ? 'bg-red-950/20' : ''}`}
            >
              <h3 className="pixel-title text-[8px] opacity-40 uppercase tracking-[0.3em] flex items-center gap-2">
                {isUltrakillMode ? <Terminal size={14} className="text-red-500" /> : <Sparkles size={14} className="text-pink-300" />}
                {isUltrakillMode ? 'MANIFEST_LOG.txt' : 'About_Me.txt'}
              </h3>
              <Activity size={14} className="text-black/10 dark:text-white/10" />
            </div>
            <div className="p-5 sm:p-6 relative overflow-hidden flex flex-col justify-start">
              <div className={`terminal-font text-xl sm:text-2xl space-y-6 relative z-10 ${isUltrakillMode ? 'text-red-100' : 'text-pink-50'}`}>
                <p className={`text-3xl sm:text-4xl ${isUltrakillMode ? 'text-red-500 uppercase italic font-black' : 'text-pink-400 font-bold'} tracking-tight drop-shadow-md`}>
                  hihi :3 im kit
                </p>
                <p className="opacity-90 leading-relaxed">
                  i’ve been doing minecraft dev stuff for around <span className={`${isUltrakillMode ? 'text-red-500' : 'text-pink-300'} font-bold border-b border-red-500/30`}>7–8 years</span>, mostly focused on performance and systems. i mainly work with fabric and neoforge.
                </p>
                <p className="opacity-90 leading-relaxed">
                  i spend a lot of time fixing tps issues, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                </p>
                <p className="opacity-90 leading-relaxed">
                  i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are under nda, so i can’t say much about them. i also make modpacks and help optimize higher-end networks.
                </p>
              </div>
            </div>
          </section>

          <section className={`dimden-panel p-0 overflow-hidden group/hosting border-pink-500/20 hover:border-pink-500/40 relative ${isUltrakillMode ? 'border-red-500/40 bg-red-950/5' : ''}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isUltrakillMode ? 'bg-red-500/10 border-red-500/20' : 'bg-pink-500/[0.04] border-pink-500/10'}`}>
               <h2 className={`pixel-title text-[8px] uppercase tracking-[0.4em] flex items-center gap-2 ${isUltrakillMode ? 'text-red-500' : 'text-pink-300/40'}`}>
                 <Star size={16} className={`${isUltrakillMode ? 'text-red-500 fill-red-500/20' : 'text-pink-300 fill-pink-500/10'}`} />
                 {isUltrakillMode ? 'OPTIMIZED_INFRASTRUCTURE' : 'Recommended Host'}
               </h2>
               <ShieldCheck size={18} className="text-black/10 dark:text-white/10" />
            </div>
            <div className="p-8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className={`w-28 h-28 p-3 shadow-2xl relative shrink-0 group-hover/hosting:scale-105 transition-all border-2 ${isUltrakillMode ? 'bg-red-500/10 border-red-500/40' : 'bg-pink-500/10 border-pink-500/20'}`}>
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={`w-full h-full object-cover ${isUltrakillMode ? 'grayscale saturate-200' : ''}`} alt="Pyro" />
                </div>
                <div className="flex-1">
                  <h3 className={`terminal-font text-4xl uppercase tracking-[0.2em] mb-2 font-bold ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>Pyro</h3>
                  <p className={`terminal-font text-xl leading-tight ${isUltrakillMode ? 'text-red-200/60' : 'text-pink-200/60'}`}>
                    High end game servers with super fast connections. Powerful AMD Ryzen processors.
                  </p>
                  
                  {/* Styled Disclaimer Box */}
                  <div className={`mt-4 p-4 rounded border terminal-font text-base text-left flex gap-3 ${isUltrakillMode ? 'bg-red-950/30 border-red-500/20 text-red-300' : 'bg-pink-950/20 border-pink-400/10 text-pink-100/60'}`}>
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <p>
                      kitsuya.space is not affiliated or partnered with Pyro, but the above link does support them. It's the only server host i use for my projects because of their outstanding quality and price.
                    </p>
                  </div>
                </div>
              </div>
              <a href="https://pyro.host/?a=41" target="_blank" className={`w-full sm:w-auto inline-flex items-center justify-center gap-4 terminal-font text-3xl transition-all border-2 rounded-lg py-5 px-12 ${isUltrakillMode ? 'bg-red-900/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-900/40' : 'bg-pink-950/30 border-pink-400/40 text-pink-200 shadow-[0_0_25px_rgba(255,77,122,0.1)] hover:border-pink-400 hover:shadow-[0_0_40px_rgba(255,77,122,0.3)]'}`}>
                <span>{isUltrakillMode ? 'SECURE_LINK' : 'Visit Pyro'}</span>
                <ExternalLink size={20} />
              </a>
            </div>
          </section>
        </main>

        <aside className="md:col-span-3 space-y-8 order-3">
          <div className={`dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5 ${isUltrakillMode ? 'border-red-500/20' : ''}`}>
             <div className="bg-black/[0.05] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">{isUltrakillMode ? 'HARDWARE_SPECS' : 'Hardware'}</h3>
               <Cpu size={14} className="text-black/20 dark:text-white/10" />
             </div>
             <div className="p-5 terminal-font space-y-4 relative z-10">
                {[
                  { label: 'CPU', value: 'Epyc 7543P' },
                  { label: 'MEM', value: '28GB DDR4' },
                  { label: 'SSD', value: '2tb NVMe' }
                ].map((spec, idx) => (
                  <div key={idx} className={`flex justify-between items-center py-3 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 hover:${isUltrakillMode ? 'bg-red-500/5' : 'bg-pink-500/5'} px-3 rounded-lg`}>
                    <span className="text-black/50 dark:text-white/40 uppercase text-sm tracking-[0.2em] font-bold">{spec.label}</span>
                    <span className={`text-right text-2xl font-bold ${isUltrakillMode ? 'text-red-500' : 'text-pink-100'}`}>{spec.value}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Discovery Log is in the right sidebar */}
          <div className={`dimden-panel p-4 border-red-500/10 bg-red-500/[0.01] overflow-hidden relative group/secret ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
             <div className="pixel-title text-[8px] opacity-20 uppercase tracking-[0.2em] mb-3">{isUltrakillMode ? 'MEMORY_FRAGMENT_LOG' : 'Discovery Log'}</div>
             <div className="space-y-2">
                {['xp_egg', 'konami', 'profile'].map((s) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${foundSecrets.includes(s) ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-white/5'}`} />
                    <span className={`terminal-font text-xs uppercase tracking-widest ${foundSecrets.includes(s) ? (isUltrakillMode ? 'text-red-500/80' : 'text-white/60') : 'text-white/10'}`}>
                      {foundSecrets.includes(s) ? s.replace('_', ' ') : '??????'}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </aside>
      </div>

      {isUltrakillMode && (
        <button 
          onClick={() => setIsUltrakillMode(false)}
          className="fixed top-6 right-6 z-[100] dimden-panel px-6 py-2 bg-red-600/20 border-red-500/40 text-red-500 terminal-font text-xl hover:bg-red-600/40 flex items-center gap-3 animate-pulse"
        >
          <Power size={18} />
          <span>EXIT_PROTOCOL</span>
        </button>
      )}

      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
         <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`dimden-panel p-4 rounded-full transition-all shadow-xl bg-black/80 backdrop-blur-md ${isUltrakillMode ? 'text-red-500 border-red-500/40' : 'text-pink-500'}`}
        >
          <Settings2 size={24} className={showSettings ? 'rotate-90' : ''} />
        </button>
        {showSettings && (
          <div className={`absolute bottom-16 left-0 dimden-panel p-4 w-64 space-y-2 animate-in slide-in-from-bottom-2 shadow-2xl bg-black/90 backdrop-blur-xl border-pink-500/20 ${isUltrakillMode ? 'border-red-500/40' : ''}`}>
            <button onClick={() => setPerformanceMode(!performanceMode)} className="w-full text-left p-2 hover:bg-pink-500/10 rounded terminal-font flex justify-between items-center text-white">
              <span>Performance FX</span>
              <span className={`text-[10px] ${performanceMode ? 'text-red-500' : 'text-green-500'}`}>{performanceMode ? 'OFF' : 'ON'}</span>
            </button>
          </div>
        )}
      </div>

      <footer className={`py-20 text-center terminal-font text-2xl tracking-[0.6em] uppercase hover:text-red-500 transition-all duration-1000 ${isUltrakillMode ? 'text-red-950/40' : 'text-white/5 footer-glow'}`}>
        ~ 2026 - the end of time ~
      </footer>
    </div>
  );
};

export default App;
