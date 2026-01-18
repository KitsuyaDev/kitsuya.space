
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, Heart, Zap, Music, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  AlertCircle, Disc, Clock, Play, Trophy,
  List, Layout, Coffee, Settings2, Sun, Moon,
  Cpu as CpuIcon, ShieldAlert, ShoppingCart,
  Server, Info, Shield, ThumbsUp, Star,
  History, Radio, Link as LinkIcon
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
  }, [rainbowMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMem(prev => isPanic ? Math.random() * 999.99 : 16 + (Math.random() * 12));
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
        
        // Format relative time if not now playing
        let relativeTime = 'Recently';
        if (latest.date && latest.date.uts) {
          const diff = Math.floor(Date.now() / 1000) - parseInt(latest.date.uts);
          if (diff < 60) relativeTime = 'Just now';
          else if (diff < 3600) relativeTime = `${Math.floor(diff / 60)}m ago`;
          else if (diff < 86400) relativeTime = `${Math.floor(diff / 3600)}h ago`;
          else relativeTime = `${Math.floor(diff / 86400)}d ago`;
        }

        setTrack({
          name: latest.name,
          artist: latest.artist['#text'],
          album: latest.album['#text'],
          image: latest.image[3]['#text'] || latest.image[2]['#text'] || '',
          nowPlaying: latest['@attr']?.nowplaying === 'true',
          url: latest.url,
          lastSeen: relativeTime
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
      
      {/* Settings FAB */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {showSettings && (
          <div className="dimden-panel p-4 w-64 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-2xl">
            <h4 className="pixel-title text-[8px] opacity-40 border-b border-pink-400/10 pb-3 mb-2 uppercase tracking-widest">System Control</h4>
            
            <button 
              onClick={togglePerformance}
              className={`w-full flex items-center justify-between p-3 rounded terminal-font text-lg transition-all ${!performanceMode ? 'bg-pink-500/15 text-pink-200' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className="flex items-center gap-3">
                <CpuIcon size={16} />
                <span>FX Rendering</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 border border-white/20 transition-all ${!performanceMode ? 'bg-pink-500' : 'bg-white/10'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${!performanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <button 
              onClick={toggleLightMode}
              className={`w-full flex items-center justify-between p-3 rounded terminal-font text-lg transition-all ${lightMode ? 'bg-pink-500/15 text-pink-600' : 'hover:bg-white/5 text-white/40'}`}
            >
              <div className="flex items-center gap-3">
                {lightMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>Luminance</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 border border-white/20 transition-all ${lightMode ? 'bg-pink-500' : 'bg-white/10'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${lightMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        )}
        
        <button 
          onClick={() => { setShowSettings(!showSettings); playSound('hover'); }}
          className={`dimden-panel p-4 text-pink-600 dark:text-pink-300 hover:text-black dark:hover:text-white flex items-center gap-2 group transition-all rounded-full ${showSettings ? 'border-pink-500 ring-4 ring-pink-500/10' : ''}`}
        >
          <Settings2 size={24} className={`transition-transform duration-700 ${showSettings ? 'rotate-180' : ''}`} />
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

      <header className={`dimden-panel p-0 overflow-hidden group border-pink-400/10 hover:border-pink-400/30 ${rainbowMode ? 'shadow-[0_0_40px_rgba(255,255,255,0.2)]' : ''}`}>
        <div className="bg-black/[0.03] dark:bg-white/[0.03] p-2 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-[0.3em] flex items-center gap-2">
            <Coffee size={10} className="text-pink-500 dark:text-pink-300" /> user_identity.init()
          </h3>
          <Layout size={10} className="text-black/10 dark:text-white/10" />
        </div>
        <div className="p-4 sm:p-6 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative z-10 text-center sm:text-left">
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 transition-all duration-1000 md:group-hover:scale-105 cursor-crosshair shrink-0 p-1.5 border border-black/10 dark:border-white/10 rounded-full shadow-2xl"
              onMouseEnter={() => playSound('hover')}
            >
               <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                    className={`w-full h-full object-cover transition-all duration-1000 rounded-full ${isPanic ? 'sepia invert' : ''}`} alt="pfp" />
               <div className="absolute inset-0 rounded-full border border-pink-500/20 group-hover:border-pink-500/40 transition-colors duration-1000" />
            </div>
            <div className="cursor-pointer select-none" onClick={handleHeaderClick}>
              <h1 className="pixel-title text-2xl sm:text-3xl md:text-4xl mb-3 transition-all tracking-tight uppercase flex items-center justify-center sm:justify-start gap-4">
                {isPanic ? 'SYS_CRITICAL' : 'KITSUYA.SPACE'}
                {headerClicks >= 50 && !isPanic && <Trophy size={20} className="text-yellow-400 animate-bounce" />}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="relative flex items-center justify-center">
                  <span className={`w-3 h-3 rounded-full ${isPanic ? 'bg-red-600 animate-pulse' : track?.nowPlaying ? 'bg-green-500' : 'bg-pink-500'}`} />
                  {!performanceMode && <span className={`absolute w-6 h-6 rounded-full animate-ping opacity-30 ${isPanic ? 'bg-red-600' : track?.nowPlaying ? 'bg-green-500' : 'bg-pink-500'}`} />}
                </div>
                <p className={`terminal-font text-xl sm:text-2xl opacity-70 uppercase tracking-widest ${lightMode ? 'text-pink-700' : 'text-pink-100'}`}>
                  {isPanic ? 'LOGGING_FAIL_0x0' : '~ root@kitsuya: /dev/minecraft'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-10 sm:gap-16 md:border-l border-black/5 dark:border-white/5 md:pl-12 lg:pl-16 relative z-10">
             <div className="flex flex-col items-center">
               <span className="text-black/30 dark:text-white/20 font-bold uppercase tracking-[0.4em] mb-2 text-[8px]">ALLOC_RAM</span>
               <span className={`terminal-font text-2xl sm:text-3xl transition-all duration-700 ${isPanic ? 'text-red-600' : 'text-pink-900 dark:text-pink-100'}`}>
                {liveMem.toFixed(2)}GB <span className="text-black/20 dark:text-white/10 text-sm">/ 28GB</span>
               </span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-black/30 dark:text-white/20 font-bold uppercase tracking-[0.4em] mb-2 text-[8px]">SYNC_TPS</span>
               <span className={`terminal-font text-4xl sm:text-5xl drop-shadow-[0_0_15px_rgba(74,222,128,0.2)] ${isPanic ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
                {isPanic ? (Math.random() * 5).toFixed(2) : '20.00'}
               </span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        <aside className="md:col-span-3 space-y-8 order-2 md:order-1">
          {/* Identity Panel */}
          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">Profile</h3>
              <User size={12} className="text-black/20 dark:text-white/10" />
            </div>
            <div className="p-5 space-y-2">
                {[
                  { label: 'Name', value: 'Kit' },
                  { label: 'Age', value: '20' },
                  { label: 'Pronouns', value: 'They/Them' },
                  { label: 'Timezone', value: 'GMT' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 hover:bg-pink-500/5 transition-all px-2 rounded">
                    <span className="terminal-font text-black/40 dark:text-white/30 text-base uppercase tracking-widest">{item.label}</span>
                    <span className="terminal-font text-xl text-pink-900 dark:text-pink-100">{isPanic ? '???' : item.value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">Links</h3>
              <LinkIcon size={12} className="text-black/20 dark:text-white/10" />
            </div>
            <nav className="flex flex-col p-2 gap-1">
              {[
                { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
              ].map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" className={`sidebar-link group/link !text-xl !py-3 px-4 rounded-lg flex items-center gap-4 ${lightMode ? 'text-pink-800 hover:text-pink-600' : 'text-white'}`} onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                  <link.icon size={18} className="text-black/20 dark:text-white/20 group-hover/link:text-pink-500 transition-all" />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Dynamic Listening Status */}
          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
             <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest flex items-center gap-2">
                 {track?.nowPlaying ? (
                   <><Radio size={12} className="text-green-600 dark:text-green-400" /> Currently Listening</>
                 ) : (
                   <><History size={12} className="text-pink-600/60 dark:text-pink-400/60" /> Last Played</>
                 )}
               </h3>
               {track?.nowPlaying ? (
                 <span className="flex items-center gap-1.5">
                   <span className="text-[8px] terminal-font text-green-600 dark:text-green-400 font-bold opacity-60">LIVE</span>
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                 </span>
               ) : (
                 <span className="flex items-center gap-1.5">
                    <span className="text-[8px] terminal-font text-black/30 dark:text-white/20 font-bold">HISTORY</span>
                    <span className="w-2 h-2 bg-pink-500/30 rounded-full" />
                 </span>
               )}
             </div>
             <div className="p-4">
               {track ? (
                 <a href={track.url} target="_blank" className="flex items-center gap-4 group/track">
                    <div className="w-14 h-14 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden shrink-0 shadow-lg group-hover/track:border-pink-500/40 transition-all">
                      <img src={track.image || ''} className="w-full h-full object-cover" alt="Art" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="terminal-font text-lg leading-tight truncate text-black dark:text-white">{track.name}</p>
                      <p className="terminal-font text-sm text-black/50 dark:text-white/40 truncate uppercase tracking-tight mt-0.5">{track.artist}</p>
                      {!track.nowPlaying && track.lastSeen && (
                        <p className="text-[9px] terminal-font text-pink-700 dark:text-pink-400/40 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <Clock size={8} /> {track.lastSeen}
                        </p>
                      )}
                    </div>
                 </a>
               ) : (
                 <div className="text-center py-4 opacity-10 terminal-font text-sm uppercase tracking-widest">Waiting for signal</div>
               )}
             </div>
          </div>
        </aside>

        <main className="md:col-span-6 space-y-8 order-1 md:order-2">
          {/* About Me Section - Formatted with Highlights */}
          <section className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="pixel-title text-[8px] opacity-40 uppercase tracking-[0.3em] flex items-center gap-2">
                <Sparkles size={14} className="text-pink-600 dark:text-pink-300" /> About_Me.txt
              </h3>
              <Terminal size={14} className="text-black/10 dark:text-white/10" />
            </div>
            <div className="p-5 sm:p-6 relative overflow-hidden flex flex-col justify-start">
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">
                <Terminal size={120} className="text-black dark:text-white" />
              </div>
              <div className={`terminal-font text-xl sm:text-2xl space-y-3 relative z-10 ${lightMode ? 'text-black' : 'text-pink-50'}`}>
                {isPanic ? (
                  <div className="space-y-4 text-red-600">
                    <p className="text-3xl font-bold">CORE_MEMORY_CORRUPT</p>
                    <p className="text-xl opacity-50">0x82883311</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl sm:text-4xl text-pink-700 dark:text-pink-400 font-bold tracking-tight">hihi :3 im kit</p>
                    <p className="opacity-90 leading-relaxed">
                      i’ve been doing minecraft dev stuff for around <span className="text-pink-800 dark:text-pink-300 font-bold border-b border-pink-500/30">7–8 years</span>, mostly focused on <span className="text-pink-700 dark:text-pink-400 font-bold italic">performance and systems</span>. i mainly work with <span className="text-pink-700 dark:text-pink-400 font-bold">fabric</span> and <span className="text-pink-700 dark:text-pink-400 font-bold">neoforge</span>.
                    </p>
                    <p className="opacity-90 leading-relaxed">
                      i spend a lot of time fixing <span className="text-pink-700 dark:text-pink-400 border-b border-pink-500/20">tps issues</span>, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                    </p>
                    <p className="opacity-90 leading-relaxed">
                      i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are under <span className="opacity-60 italic">nda</span>, so i can’t say much about them. i also make modpacks and help <span className="text-pink-800 dark:text-pink-300 font-bold">optimize higher-end networks</span>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Recommended Host Section - Updated Bio */}
          <section className="dimden-panel p-0 overflow-hidden group/hosting border-pink-500/20 hover:border-pink-500/40 relative">
            <div className="bg-pink-500/[0.04] p-4 border-b border-pink-500/10 flex items-center justify-between">
               <h2 className="pixel-title text-[8px] uppercase tracking-[0.4em] text-pink-700 dark:text-pink-300/40 flex items-center gap-2">
                 <Star size={16} className="text-pink-600 dark:text-pink-300 fill-pink-500/10" /> Recommended Host
               </h2>
               <ShieldCheck size={18} className="text-pink-600/30 dark:text-pink-400/20" />
            </div>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="w-28 h-28 bg-pink-500/10 border-2 border-pink-500/20 p-3 shadow-2xl relative shrink-0 group-hover/hosting:scale-105 transition-all duration-700">
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className="w-full h-full object-cover" alt="Pyro" />
                  <div className="absolute inset-0 ring-4 ring-pink-500/5" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="terminal-font text-4xl uppercase tracking-[0.2em] mb-2 text-black dark:text-white">Pyro</h3>
                  <p className="terminal-font text-xl text-pink-900 dark:text-pink-200/60 leading-tight">
                    High end game servers with super fast connections and compatibility with every game you love. Powered by Powerful AMD Ryzen processors.
                  </p>
                </div>
              </div>

              <div className="dimden-panel border-pink-500/20 bg-pink-500/[0.05] p-6 mb-8 relative rounded-xl backdrop-blur-3xl">
                <div className="flex gap-5 items-start">
                   <ThumbsUp size={28} className="text-pink-700 dark:text-pink-400 shrink-0 mt-1 opacity-70" />
                   <p className="terminal-font text-2xl italic leading-relaxed text-pink-950 dark:text-white/90">
                    "Honestly the only host I trust for my own projects. Their hardware handles heavily modded environments like a dream. If you want something that actually stays up, this is it."
                   </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <a href="https://pyro.host/?a=41" target="_blank" className="w-full sm:w-auto inline-flex dimden-panel px-16 py-4 items-center justify-center gap-4 terminal-font text-3xl text-white bg-pink-600 dark:bg-pink-500/10 border-pink-500/40 hover:bg-pink-700 dark:hover:bg-pink-500/20 hover:shadow-[0_0_40px_rgba(255,183,197,0.2)] transition-all group/btn rounded-lg" onClick={handleLinkClick}>
                  <span>Visit</span>
                  <ExternalLink size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
                
                <div className="flex items-center gap-4 text-black/40 dark:text-white/20 terminal-font text-base uppercase tracking-[0.2em] border-l border-black/10 dark:border-white/5 pl-8 h-10">
                  <Shield size={20} className="opacity-40" />
                  <span>Trust_Verified</span>
                </div>
              </div>

              <div className="mt-8 p-4 border-t border-black/5 dark:border-white/5 flex items-start gap-5 text-black/50 dark:text-white/30 terminal-font text-sm uppercase tracking-widest leading-relaxed">
                <Info size={18} className="shrink-0 mt-0.5 opacity-30" />
                <p>
                  <span className="text-pink-700 dark:text-pink-400/50 font-bold">Disclaimer:</span> I'm not partnered with Pyro Hosting—I just personally use and love their service for my own work. Note: using my link supports me directly!
                </p>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
               <div className="w-full h-1 bg-pink-500 absolute animate-[scan_10s_linear_infinite]" />
            </div>
          </section>
        </main>

        <aside className="md:col-span-3 space-y-8 order-3">
          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
             <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">Heartbeat</h3>
               <Activity size={14} className="text-black/20 dark:text-white/10" />
             </div>
             <div className="p-5 terminal-font space-y-6">
                <div className="flex justify-between items-end border-b border-black/5 dark:border-white/5 pb-3">
                  <span className="text-black/40 dark:text-white/20 text-sm tracking-[0.2em] uppercase">UPTIME</span> 
                  <span className={`text-2xl ${isPanic ? 'text-red-600' : 'text-pink-900 dark:text-pink-100'}`}>99.9%</span>
                </div>
                <div className="flex gap-1.5 h-10 items-end">
                   {[40, 70, 30, 90, 50, 80, 20, 60, 45, 75, 55, 85].map((h, i) => (
                     <div key={i} className="w-full transition-all duration-1000 rounded-t-sm bg-pink-500/20 dark:bg-pink-500/10 group-hover:bg-pink-500/40" style={{height: `${h}%`}} />
                   ))}
                </div>
             </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
             <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">Hardware</h3>
               <Cpu size={14} className="text-black/20 dark:text-white/10" />
             </div>
             <div className="p-5 terminal-font space-y-4 relative z-10">
                {[
                  { label: 'CPU', value: 'Epyc 7543P' },
                  { label: 'MEM', value: '28GB DDR4' },
                  { label: 'SSD', value: '2tb NVMe' },
                  { label: 'OS', value: 'Win 11' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 hover:bg-pink-500/5 px-3 rounded-lg transition-all group/item border-l-2 border-transparent hover:border-pink-500/30">
                    <span className="text-black/50 dark:text-white/40 uppercase text-sm tracking-[0.2em] font-bold">{spec.label}</span>
                    <span className="text-right text-2xl text-pink-900 dark:text-pink-100 group-hover/item:text-pink-700 dark:group-hover/item:text-pink-300 transition-colors">{spec.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-black/5 dark:border-white/5">
             <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
               <h3 className="pixel-title text-[7px] opacity-40 uppercase tracking-widest">Shop</h3>
               <ShoppingCart size={14} className="text-black/20 dark:text-white/10" />
             </div>
             <div className="p-8 text-center">
                <div className="terminal-font text-2xl text-pink-700 dark:text-pink-400 opacity-40">Coming soon</div>
                <div className="text-[10px] terminal-font opacity-20 uppercase tracking-[0.3em] mt-2 animate-pulse">Waiting for inventory</div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="py-20 text-center terminal-font text-black/5 dark:text-white/5 text-2xl tracking-[0.6em] uppercase hover:text-black/20 dark:hover:text-white/20 transition-all duration-1000">
        ~ 2026 - the end of time ~
      </footer>
    </div>
  );
};

export default App;
