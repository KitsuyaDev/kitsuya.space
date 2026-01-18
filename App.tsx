
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Github, Sparkles, Activity, 
  Cloud, Monitor, Heart, Zap, Music, User,
  Cpu, HardDrive, Terminal,
  ExternalLink, ShieldCheck,
  AlertCircle, Disc, Clock, Play
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
}

const App: React.FC = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  const playSound = useCallback((type: 'hover' | 'click') => {
    if (!hasInteracted) return;
    try {
      const audio = new Audio();
      audio.src = type === 'hover' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
      audio.volume = type === 'hover' ? 0.05 : 0.1;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [hasInteracted]);

  const createParticles = (e: React.MouseEvent) => {
    const centerX = e.clientX;
    const centerY = e.clientY;
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x: centerX,
        y: centerY,
        angle: (Math.PI * 2 / 12) * i + (Math.random() * 0.5),
        velocity: 2 + Math.random() * 4
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
        const isNowPlaying = latest['@attr']?.nowplaying === 'true';
        
        setTrack({
          name: latest.name,
          artist: latest.artist['#text'],
          album: latest.album['#text'],
          image: latest.image[2]['#text'] || '', // Large image
          nowPlaying: isNowPlaying,
          url: latest.url,
          lastSeen: latest.date?.['#text'] || 'Recently'
        });
      }
    } catch (error) {
      console.error("Error fetching Last.fm:", error);
    }
  };

  useEffect(() => {
    fetchLastFm();
    const interval = setInterval(fetchLastFm, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 relative z-10 py-4 px-2 md:px-6">
      {/* Click Particles */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute w-1 h-1 bg-pink-300 shadow-[0_0_8px_#ffb7c5] animate-particle-fade"
            style={{ left: p.x, top: p.y, '--angle': `${p.angle}rad`, '--vel': `${p.velocity * 50}px` } as any}
          />
        ))}
      </div>

      <header className="dimden-panel p-6 flex items-center justify-between group">
        <div className="flex items-center gap-5">
          <div 
            className="relative w-16 h-16 bg-pink-900/10 border border-pink-400/30 p-1 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 overflow-hidden cursor-crosshair shadow-lg"
            onMouseEnter={() => playSound('hover')}
          >
             <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                  className="w-full h-full object-cover" alt="pfp" />
          </div>
          <div>
            <h1 className="pixel-title text-xl md:text-2xl mb-1 transition-all group-hover:tracking-widest uppercase">KITSUYA.SPACE</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${track?.nowPlaying ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-pink-400 shadow-[0_0_8px_#ffb7c5]'}`} />
              <p className="terminal-font text-pink-300 text-lg opacity-80 uppercase tracking-widest">~ root@kitsuya: /dev/minecraft</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex gap-8 border-l border-pink-400/10 pl-8">
           <div className="flex flex-col items-center">
             <span className="text-[8px] text-pink-400 font-bold uppercase tracking-[0.2em] mb-1">MEM_ALLOC</span>
             <span className="terminal-font text-pink-100 text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">28GB/28GB</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[8px] text-pink-400 font-bold uppercase tracking-[0.2em] mb-1">TPS_SYNC</span>
             <span className="terminal-font text-green-400 text-3xl drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">20.00</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 space-y-6">
          <div className="dimden-panel p-4 overflow-hidden">
            <h2 className="pixel-title text-[8px] mb-4 border-b border-pink-400/20 pb-2 opacity-50 flex items-center justify-between">
              <span>DIRECTORY</span>
              <span className="text-pink-400 animate-pulse">●</span>
            </h2>
            <nav className="flex flex-col gap-1">
              <a href="https://github.com/KitsuyaDev" target="_blank" className="sidebar-link group" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                <Github size={18} className="text-pink-300 opacity-60" />
                <span className="text-xl">GitHub</span>
              </a>
              <a href="https://twitch.tv/kitsuyatv" target="_blank" className="sidebar-link group" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                <Monitor size={18} className="text-pink-300 opacity-60" />
                <span className="text-xl">Twitch</span>
              </a>
              <a href="https://bsky.app/profile/kitsuya.space" target="_blank" className="sidebar-link group" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                <Cloud size={18} className="text-pink-300 opacity-60" />
                <span className="text-xl">BlueSky</span>
              </a>
            </nav>
          </div>

          <div className="dimden-panel p-4 overflow-hidden">
            <h3 className="pixel-title text-[8px] mb-4 border-b border-pink-400/20 pb-2 opacity-50 flex items-center justify-between">
              <span>ID_MODULE</span>
              <User size={12} className="text-pink-300" />
            </h3>
            <div className="terminal-font text-base space-y-1">
              <div className="flex justify-between items-center py-1">
                <span className="text-pink-400/50 uppercase">Name</span>
                <span className="text-pink-100 font-bold">Kit</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-pink-400/5">
                <span className="text-pink-400/50 uppercase">Age</span>
                <span className="text-pink-100">20</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-pink-400/5">
                <span className="text-pink-400/50 uppercase">Prns</span>
                <span className="text-pink-100 text-[10px]">They/Them</span>
              </div>
            </div>
          </div>

          {/* Audio Log / Last.fm with User's Key */}
          <div className={`dimden-panel p-4 overflow-hidden group transition-all duration-500 ${track?.nowPlaying ? 'border-pink-300 ring-1 ring-pink-400/20' : 'border-pink-900/30'}`}>
            <h3 className="pixel-title text-[8px] mb-4 border-b border-pink-400/20 pb-2 opacity-50 flex items-center justify-between">
              <span>{track?.nowPlaying ? 'LIVE_AUDIO' : 'LAST_SCROBBLE'}</span>
              {track?.nowPlaying ? (
                <div className="flex gap-[1px] h-3 items-end">
                   <div className="w-[2px] bg-pink-400 animate-[equalizer_0.8s_infinite]" />
                   <div className="w-[2px] bg-pink-400 animate-[equalizer_0.5s_infinite]" />
                   <div className="w-[2px] bg-pink-400 animate-[equalizer_1.1s_infinite]" />
                </div>
              ) : (
                <Music size={12} className="text-pink-300/40" />
              )}
            </h3>
            {track ? (
              <a 
                href={track.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block space-y-3 no-underline group/track"
                onClick={handleLinkClick}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 border border-pink-400/20 p-1 shrink-0 relative overflow-hidden">
                    {track.image ? (
                      <img src={track.image} className="w-full h-full object-cover grayscale group-hover/track:grayscale-0 transition-all" alt="Cover" />
                    ) : (
                      <div className="w-full h-full bg-pink-900/20 flex items-center justify-center">
                        <Disc size={20} className="text-pink-400/20" />
                      </div>
                    )}
                    {track.nowPlaying && <div className="absolute inset-0 bg-pink-500/10 animate-pulse" />}
                  </div>
                  <div className="terminal-font overflow-hidden flex flex-col justify-center">
                    <div className="text-pink-100 text-lg truncate leading-tight group-hover/track:text-white transition-colors">
                      {track.name}
                    </div>
                    <div className="text-pink-400/60 text-sm truncate uppercase tracking-tighter mt-1">
                      {track.artist}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-pink-400/40 uppercase tracking-widest pt-2 border-t border-pink-400/5">
                  <div className="flex items-center gap-1">
                    {track.nowPlaying ? <Play size={8} className="fill-green-400 text-green-400" /> : <Clock size={8} />}
                    <span>{track.nowPlaying ? 'NOW PLAYING' : track.lastSeen}</span>
                  </div>
                  <ExternalLink size={8} className="opacity-0 group-hover/track:opacity-100 transition-opacity" />
                </div>
              </a>
            ) : (
              <div className="terminal-font text-pink-400/30 text-sm italic uppercase tracking-widest flex items-center gap-2 py-4">
                <Disc size={14} className="animate-spin-slow" />
                Polling signal...
              </div>
            )}
            <style>{`
              @keyframes equalizer {
                0%, 100% { height: 2px; }
                50% { height: 12px; }
              }
            `}</style>
          </div>
        </aside>

        <main className="md:col-span-6 space-y-6">
          <section className="dimden-panel p-8 md:p-12 relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
               <Terminal size={200} className="text-pink-300" />
            </div>
            <div className="flex items-center gap-4 mb-10 text-pink-300/80">
              <Sparkles size={20} className="animate-pulse" />
              <h2 className="pixel-title text-[9px] tracking-widest uppercase">About me!</h2>
            </div>
            <div className="terminal-font text-2xl md:text-3xl text-pink-50 leading-relaxed space-y-8 relative z-10">
              <p>
                my work revolves around <span className="text-pink-300 font-bold decoration-dotted underline underline-offset-8">server optimisation</span>, 
                debloating and debugging. 
              </p>
              <p>
                i make <span className="text-pink-200 italic">mod-packs</span> of all shapes and sizes 
                and work on high-traffic networks too!
              </p>
              <p className="text-xl md:text-2xl text-pink-100/40">
                i specialize in squeezing performance out of potato servers / pcs and writing custom 
                <span className="text-pink-300"> Minecraft Mods</span>.
              </p>
            </div>
          </section>

          <section className="dimden-panel p-6 relative overflow-hidden group/hosting border-pink-500/10">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Zap size={40} className="text-pink-400" />
            </div>
            <div className="flex items-center gap-3 mb-6 border-b border-pink-400/10 pb-3">
               <ShieldCheck size={16} className="text-pink-400" />
               <h2 className="pixel-title text-[8px] uppercase tracking-[0.2em] text-pink-300/70">Recommended Host</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-pink-900/20 border border-pink-400/20 p-1 group-hover/hosting:rotate-3 transition-all">
                <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className="w-full h-full object-cover grayscale brightness-125 group-hover/hosting:grayscale-0 transition-all" alt="Pyro Hosting" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                  <h3 className="terminal-font text-2xl text-pink-100 uppercase tracking-wider">Pyro Hosting</h3>
                  <span className="text-[10px] terminal-font text-pink-400/40 hidden sm:inline">[ STATUS: ONLINE ]</span>
                </div>
                <p className="terminal-font text-pink-300/70 text-base leading-tight mb-4 max-w-md">
                  Superior performance for modded Minecraft. High-end hardware and global low-latency nodes.
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                   <a href="https://pyro.host/games" target="_blank" className="dimden-panel px-3 py-1 flex items-center gap-2 terminal-font text-lg text-pink-300/80 hover:text-white" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                     Website <ExternalLink size={14} />
                   </a>
                   <a href="https://portal.pyro.host/aff.php?aff=41" target="_blank" className="dimden-panel px-3 py-1 flex items-center gap-2 terminal-font text-lg text-white bg-pink-500/10 border-pink-400/40" onClick={handleLinkClick} onMouseEnter={() => playSound('hover')}>
                     <span>Support Kit</span>
                     <Heart size={14} className="text-pink-400" />
                   </a>
                </div>
              </div>
            </div>
            <div className="bg-pink-900/10 border-t border-pink-400/5 p-3 flex items-start gap-3 rounded">
               <AlertCircle size={14} className="text-pink-400/40 mt-1 shrink-0" />
               <p className="terminal-font text-pink-400/40 text-[11px] leading-tight">
                Disclaimer: This is the <span className="text-pink-300/60">ONLY</span> host I recommend. I am not paid to promote them; I simply use and trust their hardware for my own projects. Using the support link helps me out, but is entirely optional.
               </p>
            </div>
          </section>
        </main>

        <aside className="md:col-span-3 space-y-6">
          <div className="dimden-panel p-4 bg-pink-950/10 border-pink-400/5 group/heart">
             <h3 className="pixel-title text-[8px] mb-4 border-b border-pink-400/20 pb-2 opacity-50 flex items-center justify-between">
               <span>HEARTBEAT_V2</span>
               <Activity size={12} className="text-pink-300 group-hover/heart:animate-bounce" />
             </h3>
             <div className="terminal-font space-y-4">
                <div className="flex justify-between items-end border-b border-pink-400/10 pb-2">
                  <span className="text-pink-400/60 text-sm">UPTIME:</span> 
                  <span className="text-pink-100 text-lg">99.9%</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                   {[40, 70, 30, 90, 50, 80, 20, 60, 45, 75, 55, 85].map((h, i) => (
                     <div key={i} className="bg-pink-400/20 w-full hover:bg-pink-400 transition-all duration-300" style={{height: `${h}%`}} />
                   ))}
                </div>
             </div>
          </div>

          <div className="dimden-panel p-4 overflow-hidden relative group/specs">
             <h3 className="pixel-title text-[8px] mb-4 border-b border-pink-400/20 pb-2 opacity-50 flex items-center justify-between">
               <span>GEAR_SPECS</span>
               <Cpu size={12} className="text-pink-300" />
             </h3>
             <div className="terminal-font space-y-1 relative z-10">
                <div className="flex justify-between items-center py-1 group/item cursor-default">
                  <span className="text-pink-400/50 uppercase text-sm">CPU</span>
                  <span className="text-pink-100 text-right">Epyc 7543P</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-pink-400/5">
                  <span className="text-pink-400/50 uppercase text-sm">MEM</span>
                  <span className="text-pink-100 text-right">28GB DDR5</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-pink-400/5">
                  <span className="text-pink-400/50 uppercase text-sm">SSD</span>
                  <span className="text-pink-100 text-right">2tb NVMe Gen4</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-pink-400/5">
                  <span className="text-pink-400/50 uppercase text-sm">OS</span>
                  <span className="text-pink-100 text-right">Windows 11</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-4 opacity-40 hover:opacity-100 transition-all duration-500 py-2">
            <Zap size={16} className="text-pink-300 hover:scale-125 cursor-pointer" onClick={handleLinkClick} />
            <Heart size={16} className="text-pink-300 hover:scale-125 cursor-pointer animate-pulse" onClick={handleLinkClick} />
            <Sparkles size={16} className="text-pink-300 hover:scale-125 cursor-pointer" onClick={handleLinkClick} />
          </div>
        </aside>
      </div>

      <footer className="py-20 text-center terminal-font text-pink-400/20 text-xl tracking-[0.5em] uppercase hover:text-pink-300/60 transition-all duration-700 cursor-default" onMouseEnter={() => playSound('hover')} onClick={handleLinkClick}>
        ~ 2026 - the end of time ~
      </footer>
    </div>
  );
};

export default App;
