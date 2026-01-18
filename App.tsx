
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, Heart, Zap, Music, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  AlertCircle, Disc, Clock, Play, Trophy,
  List, Layout, Coffee, Settings2, Sun, Moon,
  Cpu as CpuIcon, ShieldAlert, ShoppingCart,
  Server, Info, Shield, ThumbsUp, Star
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
  const [isPanic, setIsPanic] = useState(false);
  const [rainbowMode, setRainbowMode] = useState(false);
  const [headerClicks, setHeaderClicks] = useState(0);
  const [liveMem, setLiveMem] = useState(24.50);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const particleIdCounter = useRef(0);
  const konamiIndex = useRef(0);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  const rainbowInput = useRef("");

  const togglePerformance = () => {
    setPerformanceMode(!performanceMode);
    document.body.classList.toggle('performance-mode');
    playSound('click');
  };

  const toggleLightMode = () => {
    setLightMode(!lightMode);
    document.body.classList.toggle('light-mode');
    playSound('click'); 
  };

  const playSound = useCallback((type: 'hover' | 'click' | 'xp' | 'secret' | 'rainbow') => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      const sources = {
        hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        xp: 'https://www.myinstants.com/media/sounds/levelup.mp3', 
        secret: 'https://www.myinstants.com/media/sounds/siren.mp3',
        rainbow: 'https://www.myinstants.com/media/sounds/shooting-stars-meme.mp3'
      };
      audio.src = sources[type as keyof typeof sources];
      audio.volume = type === 'hover' ? 0.04 : (type === 'rainbow' ? 0.15 : (type === 'secret' ? 0.2 : 0.4));
      audio.play().catch((err) => {
        console.warn(`Audio playback failed for ${type}:`, err.message);
      });
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
        color: rainbowMode ? `hsl(${Math.random() * 360}, 100%, 70%)` : color
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
      
      rainbowInput.current += key;
      if (rainbowInput.current.endsWith("rainbow")) {
        setRainbowMode(prev => !prev);
        playSound('rainbow');
        rainbowInput.current = "";
      } else if (rainbowInput.current.length > 10) {
        rainbowInput.current = rainbowInput.current.slice(-7);
      }

      const targetKey = konamiCode[konamiIndex.current].toLowerCase();
      if (key === targetKey || e.key === konamiCode[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === konamiCode.length) {
          setIsPanic(true);
          document.body.classList.add('panic-mode');
          playSound('secret');
          
          setTimeout(() => {
            setIsPanic(false);
            document.body.classList.remove('panic-mode');
          }, 8000);
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
    document.body.classList.toggle('rainbow-mode', rainbowMode);
    if (rainbowMode) {
      document.documentElement.style.setProperty('--rainbow-speed', '2s');
    } else {
      document.documentElement.style.setProperty('--rainbow-speed', '5s');
    }
  }, [rainbowMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPanic) {
        setLiveMem(Math.random() * 999.99);
      } else {
        setLiveMem(16 + (Math.random() * 12));
      }
    }, isPanic ? 50 : 3000);
    return () => clearInterval(interval);
  }, [isPanic]);

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
        createParticles(e, 40, lightMode ? '#ff0055' : '#4ade80');
      } else {
        playSound('click');
        createParticles(e, 5);
      }
      return next;
    });
  };

  return (
    <div id="root-container" className={`max-w-[1400px] mx-auto space-y-6 md:space-y-8 relative z-10 py-4 px-3 md:px-6 transition-all duration-1000 ${isPanic ? 'bg-red-950/40' : ''}`}>
      
      {/* Settings Menu Popup */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3">
        {showSettings && (
          <div className="dimden-panel p-4 w-56 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h4 className="pixel-title text-[8px] opacity-70 border-b border-pink-400/10 pb-2 mb-2 uppercase">Configuration</h4>
            
            <button 
              onClick={togglePerformance}
              className={`w-full flex items-center justify-between p-2 rounded terminal-font text-base transition-colors ${!performanceMode ? 'bg-pink-500/20 text-pink-200' : 'hover:bg-pink-500/10 text-pink-400/60'}`}
            >
              <div className="flex items-center gap-2">
                <CpuIcon size={14} />
                <span>FX: {performanceMode ? 'OFF' : 'ON'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 border border-pink-400/30 transition-colors ${!performanceMode ? 'bg-pink-500' : 'bg-transparent'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${!performanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
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
            className={`absolute w-1.5 h-1.5 shadow-[0_0_12px_currentColor] animate-particle-fade ${rainbowMode ? 'chroma-particle' : ''}`}
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

      <header className={`dimden-panel p-0 overflow-hidden group border-pink-400/20 hover:border-pink-400/40 ${rainbowMode ? 'shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}`}>
        <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
          <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-[0.2em] flex items-center gap-2">
            <Coffee size={10} className="text-pink-300" /> Me :3
          </h3>
          <Layout size={10} className="text-pink-400/30" />
        </div>
        <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6 md:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative z-10 text-center sm:text-left">
            <div 
              className="relative w-28 h-28 md:w-32 md:h-32 transition-all duration-700 md:group-hover:rotate-6 md:group-hover:scale-105 cursor-crosshair shrink-0 p-1 border-2 border-pink-400/20 rounded-full shadow-[0_0_15px_rgba(255,183,197,0.2)]"
              onMouseEnter={() => playSound('hover')}
            >
               <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                    className={`w-full h-full object-cover transition-all duration-700 rounded-full drop-shadow-[0_0_10px_rgba(255,183,197,0.3)] ${isPanic ? 'sepia hue-rotate-180 brightness-150 scale-125 invert' : ''} ${rainbowMode ? 'brightness-125 saturate-150' : ''}`} alt="pfp" />
            </div>
            <div className="cursor-pointer select-none" onClick={handleHeaderClick}>
              <h1 className="pixel-title text-xl sm:text-2xl md:text-3xl mb-2 transition-all md:group-hover:tracking-[0.15em] uppercase flex items-center justify-center sm:justify-start gap-3">
                {isPanic ? 'SYSTEM_FAIL_0x' : 'KITSUYA.SPACE'}
                {headerClicks >= 50 && !isPanic && <Trophy size={18} className="text-yellow-400 animate-bounce drop-shadow-[0_0_10px_gold]" />}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="relative flex items-center justify-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPanic ? 'bg-red-500 animate-pulse' : track?.nowPlaying ? (lightMode ? 'bg-pink-600' : 'bg-green-400') : 'bg-pink-400'}`} />
                  {!performanceMode && <span className={`absolute w-4 h-4 rounded-full animate-ping opacity-75 ${isPanic ? 'bg-red-500' : track?.nowPlaying ? (lightMode ? 'bg-pink-600' : 'bg-green-400') : 'bg-pink-400'}`} />}
                </div>
                <p className={`terminal-font text-lg sm:text-xl opacity-70 uppercase tracking-widest ${lightMode ? 'text-pink-600' : 'text-pink-300'} ${rainbowMode ? 'text-white' : ''}`}>
                  {isPanic ? 'CRITICAL_ERROR_LOGGED' : '~ root@kitsuya: /dev/minecraft'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex md:flex lg:flex gap-6 sm:gap-12 md:border-l border-pink-400/10 md:pl-8 lg:pl-12 relative z-10">
             <div className="flex flex-col items-center group/stat">
               <span className="text-pink-400/60 font-bold uppercase tracking-[0.3em] mb-1 md:mb-2" style={{fontSize: '8px'}}>MEM_ALLOC</span>
               <span className={`terminal-font text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-700 ${isPanic ? 'text-red-500 font-bold underline' : (lightMode ? 'text-pink-700' : 'text-pink-100')}`}>
                {liveMem.toFixed(2)}GB <span className="text-pink-400/30 text-xs sm:text-sm">{isPanic ? '!! ERROR !!' : '/ 28GB'}</span>
               </span>
             </div>
             <div className="flex flex-col items-center group/stat">
               <span className="text-pink-400/60 font-bold uppercase tracking-[0.3em] mb-1 md:mb-2" style={{fontSize: '8px'}}>TPS_SYNC</span>
               <span className={`terminal-font text-3xl sm:text-4xl drop-shadow-[0_0_12px_rgba(74,222,128,0.3)] transition-colors duration-500 ${isPanic ? 'text-red-600 animate-bounce' : (lightMode ? 'text-pink-600' : 'text-green-400')}`}>
                {isPanic ? (Math.random() * 5).toFixed(2) : '20.00'}
               </span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <aside className="md:col-span-3 space-y-6 md:space-y-8 order-2 md:order-1">
          {/* Identity Panel */}
          <div className="dimden-panel p-0 overflow-hidden group/id border-pink-400/20">
            <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Identity</h3>
              <User size={10} className="text-pink-400/30" />
            </div>
            <div className="p-4 sm:p-5 space-y-1">
                {[
                  { label: 'Name', value: 'Kit' },
                  { label: 'Age', value: '20' },
                  { label: 'Pronouns', value: 'They/Them' },
                  { label: 'Time-zone', value: 'GMT' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-pink-400/5 last:border-0 hover:bg-pink-400/5 transition-colors px-1 rounded">
                    <span className="terminal-font text-pink-400/40 text-sm uppercase tracking-widest">{item.label}:</span>
                    <span className={`terminal-font text-lg sm:text-xl tracking-wider ${lightMode ? 'text-pink-700' : 'text-pink-100'} ${rainbowMode ? 'text-white' : ''}`}>
                      {isPanic ? 'UNDEFINED' : item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/20">
            <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">{isPanic ? 'NULL_PTR' : 'Links'}</h3>
              <List size={10} className="text-pink-400/30" />
            </div>
            <nav className="flex flex-col p-1.5 gap-0.5">
              {[
                { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
              ].map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" className="sidebar-link group/link !text-lg !py-2" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                  <link.icon size={16} className="text-pink-400/40 group-hover/link:text-pink-500 transition-all" />
                  <span>{isPanic ? 'SEG_FAULT' : link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Minimal Listening Status */}
          <div className="dimden-panel p-0 overflow-hidden group/music border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest flex items-center gap-2">
                 <Music size={10} className="text-pink-300" /> {isPanic ? 'SIG_ERR' : 'Music'}
               </h3>
               {track?.nowPlaying && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_green]" />}
             </div>
             <div className="p-3">
               {track ? (
                 <a href={track.url} target="_blank" className="flex items-center gap-3 group/track">
                    <div className="w-8 h-8 rounded border border-pink-400/20 overflow-hidden shrink-0">
                      <img src={track.image || ''} className="w-full h-full object-cover" alt="Art" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`terminal-font text-sm leading-tight truncate ${lightMode ? 'text-pink-600' : 'text-pink-100'}`}>{track.name}</p>
                      <p className="terminal-font text-[10px] text-pink-400/50 truncate uppercase tracking-tighter">{track.artist}</p>
                    </div>
                 </a>
               ) : (
                 <div className="text-center py-2 opacity-30 terminal-font text-xs uppercase tracking-widest">Standby</div>
               )}
             </div>
          </div>
        </aside>

        <main className="md:col-span-6 space-y-6 md:space-y-8 order-1 md:order-2">
          {/* Main About Me - Content Fully Restored */}
          <section className="dimden-panel p-0 overflow-hidden group border-pink-400/20 min-h-[400px]">
            <div className="bg-pink-900/10 p-3 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[8px] opacity-70 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={12} className="text-pink-300" /> {isPanic ? 'SYSTEM_OVERRIDE' : 'About me'}
              </h3>
              <Terminal size={12} className="text-pink-400/30" />
            </div>
            <div className="p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-start">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Terminal size={260} className="text-pink-200" />
              </div>
              <div className={`terminal-font text-lg sm:text-xl leading-relaxed space-y-5 relative z-10 ${lightMode ? 'text-pink-900' : 'text-pink-50'} ${rainbowMode ? 'text-white' : ''}`}>
                {isPanic ? (
                  <div className="space-y-6">
                    <p className="text-3xl">CORE_DUMP: [FF, AA, 01, 00, EB, 42]</p>
                    <p className="text-2xl">ALERT: HEURISTIC_THREAT_DETECTED</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-2xl sm:text-3xl text-pink-500 md:text-pink-300 font-bold">hihi :3 im kit</p>
                    <p>
                      i’ve been doing minecraft dev stuff for around <span className="font-bold border-b border-pink-500/30">7–8 years</span>, mostly focused on performance and systems. i mainly work with <span className="text-pink-400 underline decoration-pink-500/50">fabric</span> and <span className="text-pink-400 underline decoration-pink-500/50">neoforge</span>.
                    </p>
                    <p>
                      i spend a lot of time fixing tps issues, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                    </p>
                    <p className="opacity-80">
                      i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are <span className="italic">under nda</span>, so i can’t say much about them. i also make modpacks and help optimize higher-end networks.
                    </p>
                    <p>i usually work alone, but working with a team is fun when it lines up.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recommended Host Section - Personal & Detailed */}
          <section className="dimden-panel p-0 overflow-hidden group/hosting border-pink-500/20 hover:border-pink-400/40 relative">
            <div className="bg-pink-900/10 p-3 border-b border-pink-400/10 flex items-center justify-between">
               <h2 className="pixel-title text-[8px] uppercase tracking-[0.3em] text-pink-300/60 flex items-center gap-2">
                 <Star size={14} className="text-pink-300 animate-pulse fill-pink-300/20" /> Recommended Host
               </h2>
               <ShieldCheck size={16} className="text-pink-400/40" />
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-pink-900/20 border-2 border-pink-400/20 p-2 shadow-2xl relative shrink-0 group-hover/hosting:border-pink-400/50 transition-all duration-500">
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={`w-full h-full object-cover transition-all duration-500 group-hover/hosting:scale-105 ${isPanic ? 'grayscale invert' : ''}`} alt="Pyro" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className={`terminal-font text-3xl uppercase tracking-widest mb-1 ${lightMode ? 'text-pink-600' : 'text-white'}`}>Pyro</h3>
                  <p className={`terminal-font text-lg leading-snug mb-4 ${lightMode ? 'text-pink-800/80' : 'text-pink-200/70'}`}>
                    Superior performance and hardware stability for modded environments and high-traffic networks.
                  </p>
                </div>
              </div>

              <div className="dimden-panel border-pink-400/20 bg-pink-400/5 p-4 mb-6 relative overflow-hidden">
                <div className="flex gap-4 items-start">
                   <ThumbsUp size={24} className="text-pink-300 shrink-0 mt-1" />
                   <p className={`terminal-font text-xl italic leading-relaxed ${lightMode ? 'text-pink-900' : 'text-pink-50'}`}>
                    "Honestly the only host I trust for my own projects. Their hardware handles heavily modded environments like a dream. If you want something that actually stays up, this is it."
                   </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <a href="https://pyro.host/?a=41" target="_blank" className="w-full sm:w-auto inline-flex dimden-panel px-12 py-3 items-center justify-center gap-3 terminal-font text-2xl text-white bg-pink-500/10 border-pink-400/60 hover:bg-pink-500/30 hover:shadow-[0_0_25px_rgba(255,183,197,0.3)] transition-all group/btn" onClick={handleLinkClick}>
                  <span>Visit</span>
                  <ExternalLink size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
                
                <div className="flex items-center gap-3 text-pink-400/40 terminal-font text-sm uppercase tracking-[0.15em] border-l border-pink-400/10 pl-6 h-full">
                  <Shield size={16} />
                  <span>Verified reliable</span>
                </div>
              </div>

              <div className="mt-8 p-3 border-t border-pink-400/10 flex items-start sm:items-center gap-4 text-pink-400/50 terminal-font text-xs sm:text-sm uppercase tracking-wider leading-relaxed">
                <Info size={16} className="shrink-0 text-pink-400/30" />
                <span>
                  <span className="text-pink-400/70 font-bold">Disclaimer:</span> I'm not partnered with Pyro Hosting—I just personally use and love their service for my own work. Note: using my link supports me directly!
                </span>
              </div>
            </div>
            {/* Themed scanning effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
               <div className="w-full h-1 bg-pink-400 absolute animate-[scan_8s_linear_infinite]" />
            </div>
          </section>
        </main>

        <aside className="md:col-span-3 space-y-6 md:space-y-8 order-3">
          <div className="dimden-panel p-0 overflow-hidden group/heart border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Heartbeat</h3>
               <Activity size={12} className="text-pink-400/30" />
             </div>
             <div className="p-4 terminal-font space-y-4">
                <div className="flex justify-between items-end border-b border-pink-400/10 pb-2">
                  <span className="text-pink-400/50 text-sm tracking-widest uppercase">UPTIME:</span> 
                  <span className={`text-xl ${isPanic ? 'text-red-600' : (lightMode ? 'text-pink-600' : 'text-pink-100')}`}>99.9%</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                   {[40, 70, 30, 90, 50, 80, 20, 60, 45, 75, 55, 85].map((h, i) => (
                     <div key={i} className={`w-full transition-all duration-700 rounded-t-sm bg-pink-400/15 hover:bg-pink-500`} style={{height: `${h}%`}} />
                   ))}
                </div>
             </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group/specs border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Specs</h3>
               <Cpu size={12} className="text-pink-400/30" />
             </div>
             <div className="p-4 terminal-font space-y-1.5 relative z-10">
                {[
                  { label: 'CPU', value: 'Epyc 7543P' },
                  { label: 'MEM', value: '28GB DDR4' },
                  { label: 'SSD', value: '2tb NVMe' },
                  { label: 'OS', value: 'Win 11' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-pink-400/5 last:border-0 hover:bg-white/5 px-1 rounded transition-colors">
                    <span className="text-pink-400/40 uppercase text-xs tracking-widest">{spec.label}</span>
                    <span className={`text-right text-base ${lightMode ? 'text-pink-700' : 'text-pink-100'}`}>{spec.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group/commissions border-pink-400/20">
             <div className="bg-pink-900/10 p-2 border-b border-pink-400/10 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-70 uppercase tracking-widest">Commissions</h3>
               <ShoppingCart size={12} className="text-pink-400/30" />
             </div>
             <div className="p-5 text-center">
                <div className="terminal-font text-xl text-pink-400">Coming soon</div>
                <div className="text-[9px] terminal-font opacity-30 uppercase tracking-[0.2em] mt-1 animate-pulse">Wait: active</div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="py-12 text-center terminal-font text-pink-400/10 text-xl tracking-[0.5em] uppercase hover:text-pink-300/30 transition-all duration-1000">
        ~ 2026 - the end of time ~
      </footer>
    </div>
  );
};

export default App;
