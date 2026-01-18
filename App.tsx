
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, Heart, Zap, Music, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  AlertCircle, Disc, Clock, Play, Trophy,
  List, Layout, Coffee, Settings2, Sun, Moon,
  Cpu as CpuIcon, Eye
} from 'lucide-react';

// Using your provided "Stats spice" Last.fm API Key
const LASTFM_USER = 'IvanPurr'; 
const LASTFM_API_KEY = '52f25787af57e73404ef01ba7a400fac';

interface Track {
  name: string;
  artist: string;
  album: string;
  image: string;
  nowPlaying: boolean;
  url: string;
  lastSeen?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color?: string;
}

const App: React.FC = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isOverload, setIsOverload] = useState(false);
  const [headerClicks, setHeaderClicks] = useState(0);
  const [liveMem, setLiveMem] = useState(24.50);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const particleIdCounter = useRef(0);
  const konamiIndex = useRef(0);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  const togglePerformance = () => {
    setPerformanceMode(!performanceMode);
    document.body.classList.toggle('performance-mode');
    playSound('click');
  };

  const toggleLightMode = () => {
    setLightMode(!lightMode);
    document.body.classList.toggle('light-mode');
    playSound('xp');
  };

  const playSound = useCallback((type: 'hover' | 'click' | 'xp' | 'secret') => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      const sources = {
        hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        xp: 'https://www.myinstants.com/media/sounds/levelup.mp3',
        secret: 'https://assets.mixkit.co/active_storage/sfx/2534/2534-preview.mp3'
      };
      audio.src = sources[type as keyof typeof sources];
      audio.volume = type === 'hover' ? 0.04 : 0.12;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [hasInteracted]);

  const createParticles = (e: React.MouseEvent | { clientX: number, clientY: number }, count = 12, color = '#ffb7c5') => {
    if (performanceMode) return;
    const centerX = e.clientX;
    const centerY = e.clientY;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x: centerX,
        y: centerY,
        angle: (Math.PI * 2 / count) * i + (Math.random() * 0.5),
        velocity: 2 + Math.random() * 4,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    playSound('click');
    createParticles(e);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const targetKey = konamiCode[konamiIndex.current].toLowerCase();
      if (key === targetKey || e.key === konamiCode[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === konamiCode.length) {
          setIsOverload(true);
          playSound('secret');
          setTimeout(() => setIsOverload(false), 5000);
          konamiIndex.current = 0;
        }
      } else {
        konamiIndex.current = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMem(16 + (Math.random() * 12));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  const fetchLastFm = async () => {
    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
      );
      const data = await response.json();
      if (data?.recenttracks?.track?.length > 0) {
        const latest = data.recenttracks.track[0];
        setTrack({
          name: latest.name,
          artist: latest.artist['#text'],
          album: latest.album['#text'],
          image: latest.image[2]['#text'] || '',
          nowPlaying: latest['@attr']?.nowplaying === 'true',
          url: latest.url,
          lastSeen: latest.date?.['#text'] || 'Recently'
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchLastFm();
    const interval = setInterval(fetchLastFm, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleHeaderClick = (e: React.MouseEvent) => {
    setHeaderClicks(prev => {
      const next = prev + 1;
      if (next > 0 && next % 10 === 0) {
        playSound('xp');
        createParticles(e, 30, lightMode ? '#ff0055' : '#4ade80');
      } else {
        playSound('click');
        createParticles(e, 5);
      }
      return next;
    });
  };

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 md:space-y-8 relative z-10 py-4 px-3 md:px-6 transition-all duration-1000 ${isOverload ? 'bg-red-950/40' : ''}`}>
      
      {/* Settings Menu Popup */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3">
        {showSettings && (
          <div className="dimden-panel p-4 w-56 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h4 className="pixel-title text-[8px] opacity-70 border-b border-pink-400/10 pb-2 mb-2 uppercase">Configuration</h4>
            
            <button 
              onClick={togglePerformance}
              className={`w-full flex items-center justify-between p-2 rounded terminal-font text-base transition-colors ${performanceMode ? 'bg-pink-500/20 text-pink-200' : 'hover:bg-pink-500/10 text-pink-400/60'}`}
            >
              <div className="flex items-center gap-2">
                <CpuIcon size={14} />
                <span>FX: {performanceMode ? 'OFF' : 'ON'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 border border-pink-400/30 transition-colors ${performanceMode ? 'bg-pink-500' : 'bg-transparent'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${performanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <button 
              onClick={toggleLightMode}
              className={`w-full flex items-center justify-between p-2 rounded terminal-font text-base transition-colors ${lightMode ? 'bg-pink-500/20 text-pink-600' : 'hover:bg-pink-500/10 text-pink-400/60'}`}
            >
              <div className="flex items-center gap-2">
                {lightMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>Luminescence</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 border border-pink-400/30 transition-colors ${lightMode ? 'bg-pink-500' : 'bg-transparent'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${lightMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        )}
        
        <button 
          onClick={() => { setShowSettings(!showSettings); playSound('hover'); }}
          className={`dimden-panel p-3 text-pink-300 hover:text-white flex items-center gap-2 group transition-all rounded-full ${showSettings ? 'border-pink-500 shadow-[0_0_15px_rgba(255,183,197,0.4)]' : ''}`}
        >
          <Settings2 size={24} className={`transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[100]">
        {!performanceMode && particles.map(p => (
          <div 
            key={p.id}
            className="absolute w-1 h-1 shadow-[0_0_12px_currentColor] animate-particle-fade"
            style={{ 
              left: p.x, 
              top: p.y, 
              '--angle': `${p.angle}rad`, 
              '--vel': `${p.velocity * 50}px`,
              color: p.color || (lightMode ? '#ff0055' : '#ffb7c5'),
              backgroundColor: 'currentColor'
            } as any}
          />
        ))}
      </div>

      <header className="dimden-panel p-0 overflow-hidden group border-pink-400/20 hover:border-pink-400/40">
        <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
          <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-[0.2em] flex items-center gap-2">
            <Coffee size={10} className="text-pink-300" /> Me :3
          </h3>
          <Layout size={10} className="text-pink-400/30" />
        </div>
        <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6 md:gap-0">
          {!performanceMode && isOverload && <div className="absolute inset-0 bg-red-600/15 animate-flicker pointer-events-none" />}
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative z-10 text-center sm:text-left">
            <div 
              className="relative w-28 h-28 md:w-32 md:h-32 transition-all duration-700 md:group-hover:rotate-6 md:group-hover:scale-105 cursor-crosshair shrink-0 p-1 border-2 border-pink-400/20 rounded-full shadow-[0_0_15px_rgba(255,183,197,0.2)]"
              onMouseEnter={() => playSound('hover')}
            >
               <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                    className={`w-full h-full object-cover transition-all duration-700 rounded-full drop-shadow-[0_0_10px_rgba(255,183,197,0.3)] ${isOverload ? 'sepia hue-rotate-180 brightness-150 scale-125' : ''}`} alt="pfp" />
            </div>
            <div className="cursor-pointer select-none" onClick={handleHeaderClick}>
              <h1 className="pixel-title text-xl sm:text-2xl md:text-3xl mb-2 transition-all md:group-hover:tracking-[0.15em] uppercase flex items-center justify-center sm:justify-start gap-3">
                KITSUYA.SPACE
                {headerClicks >= 50 && <Trophy size={18} className="text-yellow-400 animate-bounce drop-shadow-[0_0_10px_gold]" />}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="relative flex items-center justify-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOverload ? 'bg-red-500' : track?.nowPlaying ? (lightMode ? 'bg-pink-600' : 'bg-green-400') : 'bg-pink-400'}`} />
                  {!performanceMode && <span className={`absolute w-4 h-4 rounded-full animate-ping opacity-75 ${isOverload ? 'bg-red-500' : track?.nowPlaying ? (lightMode ? 'bg-pink-600' : 'bg-green-400') : 'bg-pink-400'}`} />}
                </div>
                <p className={`terminal-font text-lg sm:text-xl opacity-70 uppercase tracking-widest ${lightMode ? 'text-pink-600' : 'text-pink-300'}`}>~ root@kitsuya: /dev/minecraft</p>
              </div>
            </div>
          </div>

          <div className="flex md:flex lg:flex gap-6 sm:gap-12 md:border-l border-pink-400/10 md:pl-8 lg:pl-12 relative z-10">
             <div className="flex flex-col items-center group/stat">
               <span className="text-[8px] text-pink-400/60 font-bold uppercase tracking-[0.3em] mb-1 md:mb-2">MEM_ALLOC</span>
               <span className={`terminal-font text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-700 ${isOverload ? 'text-red-500' : (lightMode ? 'text-pink-700' : 'text-pink-50')}`}>
                {liveMem.toFixed(2)}GB <span className="text-pink-400/30 text-xs sm:text-sm">/ 28GB</span>
               </span>
             </div>
             <div className="flex flex-col items-center group/stat">
               <span className="text-[8px] text-pink-400/60 font-bold uppercase tracking-[0.3em] mb-1 md:mb-2">TPS_SYNC</span>
               <span className={`terminal-font text-3xl sm:text-4xl drop-shadow-[0_0_12px_rgba(74,222,128,0.3)] transition-colors duration-500 ${isOverload ? 'text-red-600 animate-pulse' : (lightMode ? 'text-pink-600' : 'text-green-400')}`}>
                {isOverload ? '0.00' : '20.00'}
               </span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Side (Desktop) / Top Order (Mobile) */}
        <aside className="md:col-span-3 space-y-6 md:space-y-8 order-2 md:order-1">
          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/20">
            <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Links</h3>
              <List size={10} className="text-pink-400/30" />
            </div>
            <nav className="flex flex-col p-2 gap-1">
              {[
                { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
              ].map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" className="sidebar-link group/link" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                  <link.icon size={18} className="text-pink-400/40 group-hover/link:text-pink-500 transition-all" />
                  <span className="text-xl">{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group/id border-pink-400/20">
            <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Info</h3>
              <User size={10} className="text-pink-400/30" />
            </div>
            <div className="p-4 sm:p-5 space-y-2">
                {[
                  { label: 'Name', value: 'Kit' },
                  { label: 'Age', value: '20' },
                  { label: 'Pronouns', value: 'They/Them' },
                  { label: 'Time-zone', value: 'GMT' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-pink-400/5 last:border-0 hover:bg-pink-400/5 transition-colors px-2 rounded">
                    <span className="terminal-font text-pink-400/40 text-base uppercase tracking-widest">{item.label}:</span>
                    <span className={`terminal-font text-xl sm:text-2xl tracking-wider ${lightMode ? 'text-pink-700' : 'text-pink-100'}`}>{item.value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/20">
            <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Audio_Stream</h3>
              <Music size={10} className="text-pink-400/30" />
            </div>
            <div className="p-4 sm:p-5">
              {track ? (
                <a 
                  href={track.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block space-y-4 no-underline group/track"
                  onClick={handleLinkClick}
                  onMouseEnter={() => playSound('hover')}
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 border border-pink-400/15 p-1 shrink-0 relative overflow-hidden shadow-inner group-hover/track:shadow-[0_0_15px_rgba(255,183,197,0.2)] transition-all">
                      {track.image ? (
                        <img src={track.image} className="w-full h-full object-cover grayscale brightness-90 group-hover/track:grayscale-0 transition-all duration-500" alt="Cover" />
                      ) : (
                        <div className="w-full h-full bg-pink-900/20 flex items-center justify-center">
                          <Disc size={24} className="text-pink-400/20 animate-spin-slow" />
                        </div>
                      )}
                      {!performanceMode && track.nowPlaying && <div className="absolute inset-0 bg-pink-400/10 animate-pulse pointer-events-none" />}
                    </div>
                    <div className="terminal-font overflow-hidden flex flex-col justify-center gap-1">
                      <div className={`text-lg sm:text-xl truncate leading-tight group-hover/track:text-pink-600 transition-colors ${lightMode ? 'text-pink-900' : 'text-pink-100'}`}>
                        {track.name}
                      </div>
                      <div className="text-pink-400/50 text-sm sm:text-base truncate uppercase tracking-tighter">
                        {track.artist}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-pink-400/30 uppercase tracking-[0.2em] pt-3 border-t border-pink-400/10">
                    <div className="flex items-center gap-2">
                      {track.nowPlaying ? <Play size={10} className={`fill-green-400 text-green-400 ${lightMode ? 'text-pink-600 fill-pink-600' : ''}`} /> : <Clock size={10} />}
                      <span className={track.nowPlaying ? (lightMode ? 'text-pink-600' : 'text-green-400/60') : ''}>{track.nowPlaying ? 'NOW PLAYING' : track.lastSeen}</span>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="terminal-font text-pink-400/20 text-base italic uppercase tracking-[0.2em] flex items-center gap-3 py-6 justify-center">
                  <Disc size={18} className="animate-spin-slow opacity-30" />
                  Searching for signal...
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Center Main (Desktop) / Middle Order (Mobile) */}
        <main className="md:col-span-6 space-y-6 md:space-y-8 order-1 md:order-2">
          <section className="dimden-panel p-0 overflow-hidden group border-pink-400/20 min-h-[350px] md:min-h-[420px]">
            <div className="bg-pink-900/10 p-3 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[8px] opacity-70 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={12} className="text-pink-300" /> About me
              </h3>
              <Terminal size={12} className="text-pink-400/30" />
            </div>
            <div className="p-6 sm:p-10 md:p-16 relative overflow-hidden flex flex-col justify-center min-h-[300px] md:min-h-[380px]">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-opacity duration-700">
                <Terminal size={240} className="text-pink-200" />
              </div>
              <div className={`terminal-font text-xl sm:text-2xl md:text-3xl leading-relaxed space-y-6 md:space-y-10 relative z-10 ${lightMode ? 'text-pink-900' : 'text-pink-50'}`}>
                <p className="md:hover:translate-x-2 transition-transform duration-500">
                  my work revolves around <span className="text-pink-500 md:text-pink-300 font-bold decoration-dotted underline underline-offset-8 drop-shadow-[0_0_10px_rgba(255,183,197,0.3)]">server optimisation</span>, 
                  debloating and debugging. 
                </p>
                <p className="md:hover:translate-x-2 transition-transform duration-500 delay-75">
                  i make <span className={`${lightMode ? 'text-pink-400' : 'text-pink-200'} italic`}>mod-packs</span> of all shapes and sizes 
                  and work on high-traffic networks too!
                </p>
                <p className="text-lg sm:text-xl md:text-2xl opacity-40 italic">
                  i specialize in squeezing performance out of potato servers / pcs and writing custom 
                  <span className="text-pink-500 md:text-pink-300 font-medium"> Minecraft Mods</span>.
                </p>
              </div>
            </div>
          </section>

          <section className="dimden-panel p-0 overflow-hidden group/hosting border-pink-500/10 hover:border-pink-400/30">
            <div className="bg-pink-900/10 p-3 border-b border-pink-400/10 flex items-center justify-between">
               <h2 className="pixel-title text-[8px] uppercase tracking-[0.3em] text-pink-300/60">Recommended Host</h2>
               <ShieldCheck size={18} className="text-pink-400/40" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8">
                <div className="w-24 h-24 bg-pink-900/10 border border-pink-400/15 p-1.5 transition-all duration-500 shadow-lg relative shrink-0">
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={`w-full h-full object-cover transition-all duration-700 ${lightMode ? '' : 'grayscale brightness-110 group-hover/hosting:grayscale-0'}`} alt="Pyro" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-3">
                    <h3 className={`terminal-font text-2xl sm:text-3xl uppercase tracking-widest ${lightMode ? 'text-pink-600' : 'text-white'}`}>Pyro</h3>
                    <span className="text-[10px] terminal-font text-pink-400/40 hidden sm:inline tracking-[0.2em]">[ STATUS: OPTIMAL ]</span>
                  </div>
                  <p className={`terminal-font text-base sm:text-lg leading-snug mb-6 max-w-lg ${lightMode ? 'text-pink-800/70' : 'text-pink-200/60'}`}>
                    Superior performance for modded Minecraft. Enterprise-grade hardware and global low-latency nodes.
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                     <a href="https://pyro.host/?a=41" target="_blank" className="dimden-panel px-6 py-2.5 flex items-center gap-3 terminal-font text-xl text-white hover:text-pink-100 bg-pink-500/10 border-pink-400/30 hover:bg-pink-500/20 transition-all group/btn" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                       <span className={lightMode ? 'text-pink-600' : ''}>Visit Website</span>
                       <ExternalLink size={16} className="text-pink-400" />
                     </a>
                  </div>
                </div>
              </div>
              <div className="bg-pink-900/5 border border-pink-400/10 p-4 flex items-start gap-4 rounded-lg">
                 <AlertCircle size={16} className="text-pink-400/50 mt-1 shrink-0" />
                 <p className="terminal-font text-pink-300/50 text-xs sm:text-sm leading-relaxed tracking-wide">
                  This is the only server host I recommend. I am not directly partnered with them, but if you would like to support me, you can use the affiliate link above.
                 </p>
              </div>
            </div>
          </section>
        </main>

        {/* Right Side (Desktop) / Bottom Order (Mobile) */}
        <aside className="md:col-span-3 space-y-6 md:space-y-8 order-3">
          <div className="dimden-panel p-0 overflow-hidden group/heart border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Heartbeat</h3>
               <Activity size={12} className="text-pink-400/30" />
             </div>
             <div className="p-4 sm:p-5 terminal-font space-y-5">
                <div className="flex justify-between items-end border-b border-pink-400/10 pb-3">
                  <span className="text-pink-400/50 text-base tracking-widest uppercase">UPTIME:</span> 
                  <span className={`text-xl sm:text-2xl transition-colors ${isOverload ? 'text-red-600' : (lightMode ? 'text-pink-600' : 'text-pink-100')}`}>
                    {isOverload ? '0.00%' : '99.9%'}
                  </span>
                </div>
                <div className="flex gap-1 h-12 items-end">
                   {[40, 70, 30, 90, 50, 80, 20, 60, 45, 75, 55, 85].map((h, i) => (
                     <div key={i} className={`w-full transition-all duration-700 rounded-t-sm ${isOverload ? 'bg-red-600' : 'bg-pink-400/15 hover:bg-pink-500'}`} style={{height: `${isOverload ? Math.random() * 15 : h}%`}} />
                   ))}
                </div>
             </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group/specs border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Specs</h3>
               <Cpu size={12} className="text-pink-400/30" />
             </div>
             <div className="p-4 sm:p-5 terminal-font space-y-2 relative z-10">
                {[
                  { label: 'CPU', value: 'Epyc 7543P', overload: 'ERR_HALT' },
                  { label: 'MEM', value: '28GB DDR4', overload: 'CRITICAL' },
                  { label: 'SSD', value: '2tb NVMe', overload: 'OFFLINE' },
                  { label: 'OS', value: 'Win 11', overload: 'BSOD' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-pink-400/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded">
                    <span className="text-pink-400/40 uppercase text-xs sm:text-sm tracking-[0.2em]">{spec.label}</span>
                    <span className={`text-right text-base sm:text-lg transition-colors duration-500 ${isOverload ? 'text-red-400' : (lightMode ? 'text-pink-700' : 'text-pink-100')}`}>
                      {isOverload ? spec.overload : spec.value}
                    </span>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="flex justify-center gap-6 opacity-60 hover:opacity-100 transition-all duration-700 py-4 bg-pink-900/5 border border-pink-400/10 rounded-lg backdrop-blur-sm">
            <Zap size={20} className="text-pink-400 hover:scale-125 cursor-pointer transition-all" onClick={handleLinkClick} />
            <Heart size={20} className="text-pink-400 hover:scale-125 cursor-pointer animate-pulse transition-all" onClick={handleLinkClick} />
            <Sparkles size={20} className="text-pink-400 hover:scale-125 cursor-pointer transition-all" onClick={handleLinkClick} />
          </div>
        </aside>
      </div>

      <footer className="py-16 sm:py-24 text-center terminal-font text-pink-400/15 text-xl sm:text-2xl tracking-[0.6em] uppercase hover:text-pink-300/50 transition-all duration-1000 cursor-default select-none" onMouseEnter={() => playSound('hover')} onClick={handleLinkClick}>
        {isOverload ? 'SYSTEM_OVERLOAD_HALT' : '~ 2026 - the end of time ~'}
      </footer>
    </div>
  );
};

export default App;
