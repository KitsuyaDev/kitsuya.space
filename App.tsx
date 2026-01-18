
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, Heart, Zap, Music, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  AlertCircle, Disc, Clock, Play, Trophy,
  List, Layout, Eye, Flame
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
  lastSeen?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color?: string;
  isFlame?: boolean;
}

const App: React.FC = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isOverload, setIsOverload] = useState(false);
  const [headerClicks, setHeaderClicks] = useState(0);
  const [showHud, setShowHud] = useState(false);
  const [tailCount, setTailCount] = useState(1);
  
  const particleIdCounter = useRef(0);
  const konamiIndex = useRef(0);
  const kitsuyaIndex = useRef(0);
  
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  const kitsuyaCode = ['k', 'i', 't', 's', 'u', 'y', 'a'];

  const playSound = useCallback((type: string) => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      const sources: Record<string, string> = {
        hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        xp: 'https://www.myinstants.com/media/sounds/levelup.mp3',
        secret: 'https://assets.mixkit.co/active_storage/sfx/2534/2534-preview.mp3',
        glitch: 'https://assets.mixkit.co/active_storage/sfx/2556/2556-preview.mp3',
        fire: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3'
      };
      if (sources[type]) {
        audio.src = sources[type];
        audio.volume = type === 'hover' ? 0.05 : 0.15;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }, [hasInteracted]);

  const createParticles = (e: { clientX: number, clientY: number }, count = 12, color = '#ffb7c5', isFlame = false) => {
    const centerX = e.clientX;
    const centerY = e.clientY;
    const newParticles: Particle[] = [];
    const actualCount = isOverload ? count * 2 : count;
    
    for (let i = 0; i < actualCount; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x: centerX,
        y: centerY,
        angle: (Math.PI * 2 / actualCount) * i + (Math.random() * 0.5),
        velocity: isFlame ? 1 + Math.random() * 2 : 2 + Math.random() * 4,
        color: isOverload ? '#60a5fa' : color,
        isFlame
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, isFlame ? 500 : 1000);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    playSound('click');
    createParticles({ clientX: e.clientX, clientY: e.clientY }, 8, isOverload ? '#60a5fa' : '#ffb7c5');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (showHud && Math.random() > 0.9) {
        createParticles({ clientX: e.clientX, clientY: e.clientY }, 1, '#60a5fa', true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showHud, isOverload]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      const targetKonamiKey = konamiCode[konamiIndex.current].toLowerCase();
      if (key === targetKonamiKey || e.key === konamiCode[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === konamiCode.length) {
          setIsOverload(true);
          playSound('secret');
          setTimeout(() => setIsOverload(false), 12000);
          konamiIndex.current = 0;
        }
      } else {
        konamiIndex.current = 0;
      }

      if (key === kitsuyaCode[kitsuyaIndex.current]) {
        kitsuyaIndex.current++;
        if (kitsuyaIndex.current === kitsuyaCode.length) {
          setShowHud(true);
          playSound('glitch');
          setTimeout(() => setShowHud(false), 15000);
          kitsuyaIndex.current = 0;
        }
      } else {
        kitsuyaIndex.current = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

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

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 relative z-10 py-4 px-2 md:px-6 transition-all duration-1000 ${isOverload ? 'bg-blue-950/20' : ''}`}>
      <div className="fixed inset-0 pointer-events-none z-[100]">
        {particles.map(p => (
          <div 
            key={p.id}
            className={`absolute ${p.isFlame ? 'w-2 h-2 rounded-full blur-[2px]' : 'w-1 h-1 shadow-[0_0_8px_currentColor]'} animate-particle-fade`}
            style={{ 
              left: p.x, 
              top: p.y, 
              '--angle': `${p.angle}rad`, 
              '--vel': `${p.velocity * 50}px`,
              color: p.color || '#ffb7c5',
              backgroundColor: 'currentColor'
            } as any}
          />
        ))}
      </div>

      {showHud && (
        <div className="fixed top-4 right-4 z-[200] dimden-panel p-4 border-blue-500/50 bg-black/90 animate-pulse">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Eye size={16} />
            <h4 className="pixel-title text-[10px]">KITSUNE_REVELATION</h4>
          </div>
          <div className="terminal-font text-xs text-blue-200/80 space-y-1">
            <p>> Code: kitsuya (UNLOCKED)</p>
            <p>> Realm: Blue Spirit Mode</p>
            <p>> Tails: {tailCount}/9</p>
          </div>
        </div>
      )}

      <header className={`dimden-panel p-0 overflow-hidden group border-pink-400/30 transition-all duration-500 ${isOverload ? 'border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : showHud ? 'border-blue-500/50' : ''}`}>
        <div className={`${isOverload ? 'bg-blue-900/20' : 'bg-pink-900/20'} p-2 border-b border-pink-400/10 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <h3 className={`pixel-title text-[8px] opacity-70 uppercase tracking-[0.2em] ${isOverload ? 'text-blue-300' : ''}`}>System</h3>
            {tailCount === 9 && <Sparkles size={10} className="text-blue-300 animate-spin-slow" />}
            {headerClicks >= 25 && <Trophy size={10} className="text-yellow-400 animate-bounce" />}
          </div>
          <div className="flex items-center gap-2">
            <Layout size={10} className="text-pink-400/50" />
          </div>
        </div>
        
        <div className="p-6 flex items-center justify-between relative">
          {(isOverload || showHud) && <div className={`absolute inset-0 ${isOverload ? 'bg-blue-600/10' : 'bg-blue-400/5'} animate-flicker pointer-events-none`} />}
          <div className="flex items-center gap-6 relative z-10">
            <div 
              className={`relative w-16 h-16 bg-pink-900/10 border ${isOverload ? 'border-blue-400' : 'border-pink-400/30'} p-1 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 overflow-hidden cursor-pointer shadow-lg`}
              onMouseEnter={() => playSound('hover')}
              onClick={(e) => {
                setTailCount(prev => (prev >= 9 ? 1 : prev + 1));
                playSound('fire');
                createParticles({ clientX: e.clientX, clientY: e.clientY }, 10, '#60a5fa');
              }}
            >
               <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                    className={`w-full h-full object-cover transition-all ${isOverload ? 'brightness-125 hue-rotate-[180deg] saturate-150' : ''}`} alt="pfp" />
               {tailCount > 1 && (
                 <div className="absolute bottom-0 right-0 bg-blue-500 text-[8px] px-1 font-bold terminal-font text-white">
                   x{tailCount}
                 </div>
               )}
            </div>
            <div className="cursor-pointer select-none" onClick={(e) => {
                setHeaderClicks(prev => {
                  const next = prev + 1;
                  if (next % 10 === 0) {
                    playSound('xp');
                    createParticles({ clientX: e.clientX, clientY: e.clientY }, 30, '#4ade80');
                  } else {
                    playSound('click');
                    createParticles({ clientX: e.clientX, clientY: e.clientY }, 5);
                  }
                  return next;
                });
            }}>
              <h1 className={`pixel-title text-xl md:text-3xl mb-1 transition-all group-hover:tracking-widest uppercase ${isOverload ? 'text-blue-300' : showHud ? 'text-blue-400' : ''}`}>
                KITSUYA.SPACE
              </h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isOverload ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : track?.nowPlaying ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-pink-400 shadow-[0_0_8px_#ffb7c5]'}`} />
                <p className={`terminal-font ${isOverload ? 'text-blue-300' : 'text-pink-300'} text-lg md:text-xl opacity-80 uppercase tracking-widest`}>~ root@kitsuya: /dev/minecraft</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 space-y-6">
          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/30">
            <div className="bg-pink-900/20 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase">Links</h3>
              <List size={10} className="text-pink-400/50" />
            </div>
            <div className="p-4">
              <nav className="w-full flex flex-col gap-2">
                {[
                  { icon: <Github size={16} />, label: 'GitHub', url: 'https://github.com/KitsuyaDev' },
                  { icon: <Monitor size={16} />, label: 'Twitch', url: 'https://twitch.tv/kitsuyatv' },
                  { icon: <Cloud size={16} />, label: 'BlueSky', url: 'https://bsky.app/profile/kitsuya.space' }
                ].map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="sidebar-link flex items-center gap-3 p-2 rounded hover:bg-pink-400/5" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                    <span className={`transition-colors ${isOverload ? 'text-blue-300' : 'text-pink-300'} opacity-60`}>{link.icon}</span>
                    <span className="terminal-font text-xl">{link.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group/id border-pink-400/30">
            <div className="bg-pink-900/20 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase">DATA_STRING_KIT</h3>
              <User size={10} className="text-pink-400/50" />
            </div>
            <div className="p-4">
              <div className="w-full space-y-1">
                {[
                  { label: 'Name', value: 'Kit' },
                  { label: 'Age', value: '20' },
                  { label: 'Pronouns', value: 'They/Them' },
                  { label: 'Time-zone', value: 'GMT' }
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between items-center py-1 ${i !== 0 ? 'border-t border-pink-400/10' : ''}`}>
                    <span className="terminal-font text-pink-400/50 text-base uppercase">{item.label}:</span>
                    <span className={`terminal-font text-xl tracking-wider ${isOverload ? 'text-blue-300' : 'text-pink-100'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/30">
            <div className="bg-pink-900/20 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase">{track?.nowPlaying ? 'Listening' : 'LAST_SCROBBLE'}</h3>
              <Music size={10} className="text-pink-400/50" />
            </div>
            <div className="p-4">
              {track ? (
                <a href={track.url} target="_blank" rel="noopener noreferrer" className="w-full block no-underline group/track" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 border border-pink-400/20 p-1 shrink-0 bg-black/40 relative">
                      {track.image && <img src={track.image} className="w-full h-full object-cover grayscale group-hover/track:grayscale-0 transition-all" alt="Cover" />}
                      {!track.image && <Disc size={20} className="text-pink-400/20 m-auto" />}
                      {track.nowPlaying && <div className="absolute inset-0 bg-pink-500/10 animate-pulse" />}
                    </div>
                    <div className="terminal-font overflow-hidden flex flex-col justify-center">
                      <div className="text-pink-100 text-lg truncate leading-tight group-hover/track:text-white transition-colors">{track.name}</div>
                      <div className="text-pink-400/60 text-sm truncate uppercase tracking-tighter mt-1">{track.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border-t border-pink-400/10 pt-2 text-[10px] text-pink-400/40 uppercase tracking-widest">
                    {track.nowPlaying ? <Play size={8} className="fill-green-400 text-green-400" /> : <Clock size={8} />}
                    <span>{track.nowPlaying ? 'NOW PLAYING' : track.lastSeen}</span>
                  </div>
                </a>
              ) : (
                <div className="terminal-font text-pink-400/30 text-sm italic uppercase tracking-widest flex items-center justify-center gap-2 py-6">
                  <Disc size={14} className="animate-spin-slow" />
                  Polling signal...
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="md:col-span-6 space-y-6">
          <section className="dimden-panel p-0 overflow-hidden group border-pink-400/30">
            <div className="bg-pink-900/20 p-3 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[8px] opacity-70 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} /> About Me
              </h3>
              <Terminal size={12} className="text-pink-400/50" />
            </div>
            <div className="p-6 md:p-10 relative overflow-hidden min-h-[300px]">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                 <Terminal size={200} className={isOverload ? 'text-blue-300' : 'text-pink-300'} />
              </div>
              <div className="terminal-font text-lg md:text-xl text-pink-50/90 leading-relaxed space-y-6 relative z-10">
                <p>
                  my work revolves around <span className="text-pink-300 font-bold border-b border-dotted border-pink-300/40 pb-0.5">server optimisation</span>, debloating and debugging. 
                </p>
                <p>
                  i make <span className="text-pink-200 italic">mod-packs</span> of all shapes and sizes and work on high-traffic networks too!
                </p>
                <p className="text-base md:text-lg text-pink-100/40 uppercase tracking-wide">
                  i specialize in squeezing performance out of potato servers and writing custom 
                  <span className={isOverload ? 'text-blue-300' : 'text-pink-300'}> Minecraft Mods</span>.
                </p>
              </div>
            </div>
          </section>

          <section className="dimden-panel p-0 overflow-hidden group/hosting border-pink-400/30">
            <div className="bg-pink-900/20 p-3 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[8px] opacity-70 uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} /> recommended_host
              </h3>
              <ShieldCheck size={12} className="text-pink-400/50" />
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-pink-900/20 border border-pink-400/20 p-1 group-hover/hosting:rotate-3 transition-all overflow-hidden relative shadow-md">
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className="w-full h-full object-cover grayscale brightness-125 group-hover/hosting:grayscale-0 transition-all" alt="Pyro Hosting" />
                  {isOverload && <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                    <h3 className={`terminal-font text-2xl uppercase tracking-wider ${isOverload ? 'text-blue-200' : 'text-pink-100'}`}>Pyro Hosting</h3>
                    <span className="text-[10px] terminal-font text-pink-400/40 hidden sm:inline">[ STATUS: ONLINE ]</span>
                  </div>
                  <p className="terminal-font text-pink-300/70 text-base leading-tight mb-4 max-w-md">Superior performance for modded Minecraft. High-end hardware and global low-latency nodes.</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                     <a href="https://pyro.host/games" target="_blank" rel="noopener noreferrer" className="dimden-panel px-3 py-1 flex items-center gap-2 terminal-font text-lg text-pink-300/80 hover:text-white" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                       Website <ExternalLink size={14} />
                     </a>
                     <a href="https://portal.pyro.host/aff.php?aff=41" target="_blank" rel="noopener noreferrer" className={`dimden-panel px-3 py-1 flex items-center gap-2 terminal-font text-lg text-white ${isOverload ? 'bg-blue-500/10 border-blue-400/40' : 'bg-pink-500/10 border-pink-400/40'}`} onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                       <span>Support Kit</span>
                       <Heart size={14} className={isOverload ? 'text-blue-400' : 'text-pink-400'} />
                     </a>
                  </div>
                </div>
              </div>
              <div className="bg-pink-900/10 border-t border-pink-400/5 p-3 flex items-start gap-3 rounded">
                 <AlertCircle size={14} className="text-pink-400/40 mt-1 shrink-0" />
                 <p className="terminal-font text-pink-400/40 text-[11px] leading-tight">Disclaimer: This is the ONLY host I recommend. Trust their hardware for my own projects.</p>
              </div>
            </div>
          </section>
        </main>

        <aside className="md:col-span-3 space-y-6">
          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/30">
            <div className="bg-pink-900/20 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase">Heartbeat</h3>
              <Activity size={10} className="text-pink-400/50" />
            </div>
            <div className="p-4">
              <div className="w-full terminal-font space-y-4">
                <div className="flex justify-between items-end border-b border-pink-400/10 pb-2 px-1">
                  <span className="text-pink-400/50 uppercase text-sm">Uptime:</span> 
                  <span className={`text-pink-100 text-lg transition-colors ${isOverload ? 'text-blue-400' : ''}`}>
                    {isOverload ? '999%' : '99.9%'}
                  </span>
                </div>
                <div className="flex gap-1 h-8 items-end px-1">
                   {[40, 70, 30, 90, 50, 80, 20, 60, 45, 75, 55, 85].map((h, i) => (
                     <div key={i} className={`w-full transition-all duration-300 ${isOverload ? 'bg-blue-400 shadow-[0_0_5px_blue]' : 'bg-pink-400/20 hover:bg-pink-400'}`} style={{height: `${isOverload ? (Math.random() * 100) : h}%`}} />
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dimden-panel p-0 overflow-hidden group border-pink-400/30">
            <div className="bg-pink-900/20 p-2 border-b border-pink-400/10 flex items-center justify-between">
              <h3 className="pixel-title text-[7px] opacity-70 uppercase">Specs</h3>
              <Cpu size={10} className="text-pink-400/50" />
            </div>
            <div className="p-4">
              <div className="w-full space-y-1">
                {[
                  { k: 'CPU', v: 'Epyc 7543P' },
                  { k: 'MEM', v: '32GB' },
                  { k: 'SSD', v: '2tb NVMe' },
                  { k: 'OS', v: 'Windows 11' }
                ].map((spec, idx) => (
                  <div key={idx} className={`flex justify-between items-center py-1 ${idx !== 0 ? 'border-t border-pink-400/10' : ''}`}>
                    <span className="terminal-font text-pink-400/50 text-base uppercase">{spec.k}:</span>
                    <span className="terminal-font text-pink-100 text-xl tracking-wider">{spec.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 opacity-40 hover:opacity-100 transition-all duration-500 py-2">
            <Flame size={16} className={`hover:scale-125 cursor-pointer transition-colors ${isOverload ? 'text-blue-400' : 'text-pink-300'}`} onClick={handleLinkClick} />
            <Heart size={16} className={`hover:scale-125 cursor-pointer animate-pulse transition-colors ${isOverload ? 'text-blue-400' : 'text-pink-300'}`} onClick={handleLinkClick} />
            <Sparkles size={16} className={`hover:scale-125 cursor-pointer transition-colors ${isOverload ? 'text-blue-400' : 'text-pink-300'}`} onClick={handleLinkClick} />
          </div>
        </aside>
      </div>

      <footer className="py-20 text-center terminal-font text-pink-400/20 text-xl tracking-[0.5em] uppercase hover:text-pink-300/60 transition-all duration-700 cursor-default" onMouseEnter={() => playSound('hover')}>
        {isOverload ? 'SPIRIT_REALM_STABLE - SEALS_OK' : '~ 2026 - the end of time ~'}
      </footer>
    </div>
  );
};

export default App;
