import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Github, Sparkles, Activity, 
  Cloud, Monitor, User,
  Cpu, Terminal, ExternalLink, ShieldCheck,
  Trophy, Layout, Coffee, Settings2, Power,
  ShieldAlert, Star, History, Radio, Link as LinkIcon,
  Info, Heart, Flame
} from 'lucide-react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const LANYARD_USER_ID = '811980224711098478';

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

const RetroPanel = ({ 
  children, 
  className = '', 
  title, 
  icon, 
  isUltrakill, 
  onClick, 
  hoverable,
  rightIcon
}: any) => {
  const isClickable = onClick || hoverable;
  return (
    <motion.section 
      variants={itemVariants}
      onClick={onClick}
      className={`relative overflow-hidden ${isClickable ? 'cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none' : ''} ${
        isUltrakill 
          ? 'bg-[#150000] border-[4px] border-t-red-500/50 border-l-red-500/50 border-b-red-950 border-r-red-950 shadow-[6px_6px_0px_rgba(100,0,0,0.8)]' 
          : 'bg-[#0f0c13] border-[4px] border-t-white/20 border-l-white/20 border-b-black/80 border-r-black/80 shadow-[6px_6px_0px_rgba(0,0,0,0.8)]'
      } ${className}`}
    >
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${isUltrakill ? 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")]' : 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")]'}`} />
      
      {title && (
         <div className={`p-4 border-b-[4px] flex items-center justify-between ${
           isUltrakill ? 'bg-red-900/20 border-b-red-950/80' : 'bg-black/40 border-b-black/80'
         }`}>
           <h3 className="font-mono text-[10px] opacity-80 uppercase tracking-widest flex items-center gap-2 font-bold text-shadow-hard">
             {icon} {title}
           </h3>
           {rightIcon}
         </div>
      )}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.section>
  );
};

const App: React.FC = () => {
  const [lanyardData, setLanyardData] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.op === 1) {
          ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: LANYARD_USER_ID }
          }));
        } else if (data.op === 0) {
          setLanyardData(data.d);
        }
      } catch (e) {}
    };

    return () => ws.close();
  }, []);

  const [track, setTrack] = useState<Track | null>(null);
  const [cachedTrack, setCachedTrack] = useState<Track | null>(null);
  const [spotifyProgress, setSpotifyProgress] = useState(0);
  const [spotifyTime, setSpotifyTime] = useState({ current: '0:00', total: '0:00' });
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
    const unsub = onSnapshot(doc(db, 'status', 'lastTrack'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCachedTrack({
          name: data.name,
          artist: data.artist,
          album: data.album,
          image: data.image,
          nowPlaying: false,
          url: data.url
        });
      }
    }, (error) => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    if (lanyardData?.spotify) {
      const newTrack = {
        name: lanyardData.spotify.song,
        artist: lanyardData.spotify.artist,
        album: lanyardData.spotify.album,
        image: lanyardData.spotify.album_art_url || '',
        nowPlaying: true,
        url: `https://open.spotify.com/track/${lanyardData.spotify.track_id}`
      };
      setTrack(newTrack);

      // Save to Firebase securely
      try {
        const docRef = doc(db, 'status', 'lastTrack');
        // Only write if there's a meaningful change to avoid hammering firestore rules
        if (!cachedTrack || cachedTrack.name !== newTrack.name) {
          setDoc(docRef, { ...newTrack, nowPlaying: false, updatedAt: serverTimestamp() }).catch(() => {});
        }
      } catch (e) {}

    } else {
      setTrack(cachedTrack);
    }
  }, [lanyardData, cachedTrack]);

  useEffect(() => {
    if (!lanyardData?.spotify?.timestamps) {
      setSpotifyProgress(0);
      setSpotifyTime({ current: '0:00', total: '0:00' });
      return;
    }

    const { start, end } = lanyardData.spotify.timestamps;

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const updateProgress = () => {
      const now = Date.now();
      const total = end - start;
      const current = Math.max(now - start, 0);
      const perc = Math.min((current / total) * 100, 100);
      setSpotifyProgress(perc);
      setSpotifyTime({
        current: formatTime(current),
        total: formatTime(total)
      });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [lanyardData?.spotify?.timestamps]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
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
        <RetroPanel isUltrakill={isUltrakillMode} className="p-0 mb-6">
          <div className={`p-3 border-b-[4px] flex items-center justify-between ${isUltrakillMode ? 'bg-red-900/30 border-red-950' : 'bg-black/50 border-black'}`}>
            <h3 className="font-mono text-[10px] opacity-70 uppercase tracking-widest flex items-center gap-2 font-bold text-shadow-hard">
              {isUltrakillMode ? <ShieldAlert size={12} className="text-red-500" /> : <Coffee size={12} className="text-sakura-400" />}
              {isUltrakillMode ? 'ULTRAKILL_SESSION.v1' : 'user_identity.init()'}
            </h3>
            <Layout size={12} className="text-white/40" />
          </div>
          
          <div className="p-8 md:p-12 relative overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 w-full">
              <div 
                className={`relative w-32 h-32 md:w-36 md:h-36 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:rotate-3 cursor-crosshair shrink-0 rounded-full border-[4px] overflow-hidden ${isUltrakillMode ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'border-sakura-400 shadow-[0_0_25px_rgba(255,183,197,0.8)]'}`}
                onMouseEnter={() => playSound('hover')}
              >
                 <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                      className={`w-full h-full object-cover transition-all duration-1000 ${isUltrakillMode ? 'hue-rotate-[320deg] saturate-150' : ''}`} alt="Profile Avatar" />
              </div>
              
              <div onClick={handleHeaderClick} className="cursor-pointer select-none flex-1 w-full">
                <div className="flex flex-col gap-3 items-center sm:items-start">
                  <h1 className={`font-pixel text-shadow-hard text-2xl sm:text-3xl md:text-5xl leading-relaxed tracking-tight flex items-center justify-center sm:justify-start gap-4 ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>
                    {isUltrakillMode ? 'ULTRA_KIT' : 'KITSUYA.SPACE'}
                    {(headerClicks >= 10 || isUltrakillMode) && <Trophy size={32} fill="#eab308" className="text-yellow-400 animate-bounce drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />}
                  </h1>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                    <span className="relative flex items-center justify-center border-[3px] border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)] p-1 bg-black/40">
                      <span className={`w-2 h-2 ${track?.nowPlaying ? 'bg-[#55ff55]' : (isUltrakillMode ? 'bg-[#ff5555]' : 'bg-[#ffb7c5]')}`} />
                      {!performanceMode && <span className={`absolute w-full h-full animate-ping opacity-50 ${track?.nowPlaying ? 'bg-[#55ff55]' : (isUltrakillMode ? 'bg-[#ff5555]' : 'bg-[#ffb7c5]')}`} />}
                    </span>
                    <p className={`font-pixel text-shadow-hard text-[10px] md:text-xs uppercase tracking-widest ${isUltrakillMode ? 'text-red-400' : 'text-sakura-200'}`}>
                       {isUltrakillMode ? '~ blood_is_fuel' : '~ root@kitsuya'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </RetroPanel>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6 flex flex-col order-2 lg:order-1">
            <RetroPanel 
              isUltrakill={isUltrakillMode}
              title={isUltrakillMode ? 'SUBJECT_DATA' : 'Profile'}
              icon={<User size={14} />}
              hoverable
              onClick={(e: React.MouseEvent) => {
                addSecret('profile');
                playSound('glitch');
                createParticles(e.clientX, e.clientY, 25, '#ffffff', 6, true);
              }}
            >
              <div className="p-5 flex flex-col gap-3">
                  {[
                    { label: 'Name', value: 'Kit' },
                    { label: 'Age', value: '21' },
                    { label: 'Pronouns', value: 'They/Them' },
                    { label: 'Timezone', value: 'GMT' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 border-[3px] border-t-[#333] border-l-[#333] border-b-[#000] border-r-[#000] bg-[#1a1a1a]">
                      <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest text-shadow-hard">{item.label}</span>
                      <span className={`text-[17px] tracking-tight font-bold text-shadow-hard ${isUltrakillMode ? 'text-red-400' : 'text-white/90'}`}>{item.value}</span>
                    </div>
                  ))}
              </div>
            </RetroPanel>

            <RetroPanel
              isUltrakill={isUltrakillMode}
              title={track?.nowPlaying ? 'Now Playing' : 'Last Track'}
              icon={track?.nowPlaying ? <Radio size={14} /> : <History size={14} />}
              className="p-1"
            >
               <div className="p-3">
                 {track ? (
                   <a href={track.url} target="_blank" rel="noreferrer" className={`relative overflow-hidden group/track flex flex-col transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}`}>
                      <div className="pt-1.5 pb-1.5 px-3 flex items-center gap-3 w-full">
                        <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden shrink-0 relative shadow-[2px_2px_0px_rgba(0,0,0,0.5)] border-2 border-black/50">
                          <img src={track.image || ''} className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 bg-[#222] ${isUltrakillMode ? 'sepia hue-rotate-[320deg]' : ''}`} alt="Art" />
                          {track.nowPlaying && <div className="absolute inset-0 border-2 border-[#ffb7c5]/50 animate-pulse pointer-events-none" />}
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                          <p className={`text-sm md:text-base font-semibold tracking-wide text-shadow-hard leading-tight break-words ${isUltrakillMode ? 'text-red-400' : 'text-white'}`}>{track.name}</p>
                          <p className="font-mono text-[9px] md:text-[10px] text-white/60 line-clamp-2 uppercase mt-0.5 text-shadow-hard">{track.artist}</p>
                        </div>
                      </div>
                      
                      {lanyardData?.spotify?.timestamps && (
                        <div className="w-full flex items-center gap-2 px-3 pb-2 pt-0 mt-auto">
                          <div className="flex-1 h-1 md:h-1.5 bg-black/60 shadow-[inset_1px_1px_0px_rgba(0,0,0,1)] relative">
                            <div 
                              className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-linear ${isUltrakillMode ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#ffb7c5] shadow-[0_0_8px_rgba(255,183,197,0.8)]'}`} 
                              style={{ width: `${spotifyProgress}%` }} 
                            />
                          </div>
                          <span className="font-mono text-[8px] md:text-[9px] text-white/50 font-bold tracking-widest leading-none whitespace-nowrap">{spotifyTime.current} / {spotifyTime.total}</span>
                        </div>
                      )}
                   </a>
                 ) : (
                   <div className="text-center py-4 text-xs font-mono opacity-40 uppercase tracking-widest text-shadow-hard">No Signal</div>
                 )}
               </div>
            </RetroPanel>

            <RetroPanel isUltrakill={isUltrakillMode} className="p-1">
               <div className="p-3">
                  <a 
                    href="https://ko-fi.com/kitsuyadev" 
                    target="_blank" 
                    rel="noreferrer"
                    className={`group/kofi py-4 px-4 flex items-center justify-center gap-3 transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}`}
                  >
                    <Coffee size={24} className={`group-hover/kofi:rotate-12 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'}`} strokeWidth={2.5} />
                    <span className={`font-pixel text-shadow-hard shadow-[rgba(0,0,0,1)] text-sm ${isUltrakillMode ? 'text-red-500' : 'text-sakura-300'}`}>Support on Ko-fi</span>
                  </a>
               </div>
            </RetroPanel>

            <RetroPanel isUltrakill={isUltrakillMode} title={isUltrakillMode ? 'MEMORY_FRAGMENT_LOG' : 'Discovery Log'} icon={<Flame size={14} />}>
               <div className="space-y-3 p-5">
                   {['xp_egg', 'konami', 'profile'].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className={`w-3 h-3 border border-black shadow-[2px_2px_0_rgba(0,0,0,0.8)] ${foundSecrets.includes(s) ? 'bg-[#55ff55]' : 'bg-[#555]'}`} />
                      <span className={`font-mono text-[10px] uppercase tracking-widest text-shadow-hard ${foundSecrets.includes(s) ? (isUltrakillMode ? 'text-red-400 font-bold' : 'text-white font-bold') : 'text-white/40'}`}>
                        {foundSecrets.includes(s) ? s.replace('_', ' ') : '??????'}
                      </span>
                    </div>
                  ))}
               </div>
            </RetroPanel>
          </div>

          <div className="lg:col-span-6 space-y-6 flex flex-col order-1 lg:order-2">
            
            <RetroPanel 
              isUltrakill={isUltrakillMode} 
              title={isUltrakillMode ? 'MANIFEST_LOG.txt' : 'About_Me.txt'}
              icon={isUltrakillMode ? <Terminal size={14} className="text-red-500" /> : <Sparkles size={14} className="text-sakura-400" />}
              rightIcon={<Activity size={14} className="text-white/20" />}
            >
              <div className="p-8 md:p-10 flex flex-col gap-6 text-xl leading-relaxed text-white/90">
                <p className={`font-pixel text-shadow-hard text-xl md:text-2xl ${isUltrakillMode ? 'text-red-500 font-bold' : 'text-sakura-200'} tracking-tighter leading-normal`}>
                  hihi :3 im kit
                </p>
                <p>
                  i’ve been doing minecraft dev stuff for around <span className={`${isUltrakillMode ? 'text-red-400' : 'text-sakura-300'} font-bold border-b-4 border-sakura-400/30`}>7–8 years</span>, mostly focused on performance and systems. i mainly work with fabric and neoforge.
                </p>
                <p>
                  i spend a lot of time fixing tps issues, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                </p>
                <p>
                  i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are under nda, so i can’t say much about them. i also make modpacks and help optimize higher-end networks.
                </p>
              </div>
            </RetroPanel>

            <RetroPanel 
              isUltrakill={isUltrakillMode} 
              title={isUltrakillMode ? 'OPTIMIZED_INFRASTRUCTURE' : 'Recommended Host'} 
              icon={<Star size={14} className={`${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'}`} />}
              rightIcon={<ShieldCheck size={16} className="text-white/30" />}
            >
              <div className="p-6 flex flex-col md:flex-row gap-5 items-center md:items-start">
                <div className={`w-20 h-20 md:w-24 md:h-24 overflow-hidden shrink-0 ${isUltrakillMode ? 'shadow-[4px_4px_0px_rgba(239,68,68,0.5)]' : 'shadow-[4px_4px_0px_rgba(0,0,0,0.8)]'}`}>
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={`w-full h-full object-cover ${isUltrakillMode ? 'grayscale saturate-200' : ''}`} alt="Pyro" />
                </div>
                <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-3">
                  <div>
                    <h3 className={`font-pixel text-shadow-hard text-xl mb-2 leading-normal ${isUltrakillMode ? 'text-red-500' : 'text-white'}`}>Pyro</h3>
                    <p className={`text-base ${isUltrakillMode ? 'text-red-200/80' : 'text-white/80'}`}>
                      High end game servers with super fast connections. Powerful AMD Ryzen processors.
                    </p>
                  </div>
                  
                  <div className={`mt-1 p-4 border-[3px] flex gap-3 text-left shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${isUltrakillMode ? 'bg-[#2a0000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-100/80' : 'bg-[#1a1518] border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 text-white/80'}`}>
                    <Info size={20} className="shrink-0 mt-0.5 opacity-80" />
                    <p className="text-sm leading-relaxed text-shadow-hard">
                      <span className={`font-bold ${isUltrakillMode ? 'text-red-400' : 'text-[#ffb7c5]'}`}>Disclaimer:</span> Kit is not partnered with Pyro, but the link below does support them. It's the only server host i use for my projects because of their outstanding quality and price.
                    </p>
                  </div>

                  <a href="https://pyro.host/?a=41" target="_blank" rel="noreferrer" className={`mt-2 w-fit py-2.5 px-5 flex items-center justify-center gap-3 transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}`}>
                    <span className="font-pixel text-[10px] md:text-xs">
                      {isUltrakillMode ? 'SECURE_LINK' : 'Visit Pyro'}
                    </span>
                    <ExternalLink size={16} strokeWidth={3} className="opacity-40 group-hover:opacity-100 transition-opacity drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                  </a>
                </div>
              </div>
            </RetroPanel>

            

            

            

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6 flex flex-col order-3 lg:order-3">
            
            <RetroPanel 
               isUltrakill={isUltrakillMode}
               title={isUltrakillMode ? 'ACCESS_NODES' : 'Links'} 
               icon={<LinkIcon size={14} />} 
               className="p-1"
            >
              <nav className="p-3 space-y-3">
                {[
                  { label: 'GitHub', icon: Github, href: 'https://github.com/KitsuyaDev' },
                  { label: 'Twitch', icon: Monitor, href: 'https://twitch.tv/kitsuyatv' },
                  { label: 'BlueSky', icon: Cloud, href: 'https://bsky.app/profile/kitsuya.space' }
                ].map((link, idx) => (
                  <a key={idx} href={link.href} target="_blank" rel="noreferrer" className={`group/link py-3 px-4 flex items-center justify-between transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}`}>
                    <div className="flex items-center gap-4 text-lg text-shadow-hard">
                      <link.icon size={20} className={`${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'} drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]`} strokeWidth={2.5} />
                      <span className="font-pixel text-[10px] mt-1">{link.label}</span>
                    </div>
                    <ExternalLink size={16} strokeWidth={3} className="opacity-40 group-hover/link:opacity-100 transition-opacity drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                  </a>
                ))}
              </nav>
            </RetroPanel>

            <RetroPanel 
              isUltrakill={isUltrakillMode} 
              title={isUltrakillMode ? 'ACTIVE_DIRECTIVES' : 'Projects.md'}
              icon={isUltrakillMode ? <Terminal size={14} className="text-red-500" /> : <Layout size={14} className="text-sakura-400" />}
              className="p-1"
            >
              <div className="p-3 space-y-3">
                 {[
                   { label: 'Calirx', desc: 'Personal website commission', href: 'https://www.calirx.info/' },
                   { label: "Kit's Aeronautics", desc: 'A server focused around the Create Aeronautics mod.', href: 'https://kitsuya.co.uk/' }
                 ].map((proj, idx) => (
                   <a key={idx} href={proj.href} target="_blank" rel="noreferrer" className={`group/project py-3 px-4 flex flex-col justify-center transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] ${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}`}>
                      <div className="flex justify-between items-center w-full">
                         <span className={`font-pixel text-[10px] mt-1 text-shadow-hard ${isUltrakillMode ? 'text-red-500' : 'text-sakura-300'}`}>{proj.label}</span>
                         <ExternalLink size={16} strokeWidth={3} className="opacity-40 group-hover/project:opacity-100 transition-opacity drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                      </div>
                      <span className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${isUltrakillMode ? 'text-red-400/70' : 'text-white/50'}`}>{proj.desc}</span>
                   </a>
                 ))}
              </div>
            </RetroPanel>

            

            

            

            

            

          </div>

        </div>
        
        <motion.footer variants={itemVariants} className="py-12 text-center">
            <p className="font-mono text-xs text-white/40 uppercase tracking-[0.4em] font-bold text-shadow-hard">
                ~ 2026 - the end of time ~
            </p>
        </motion.footer>

      </motion.div>

      {/* OVERLAYS */}
      {isUltrakillMode && (
        <button 
          onClick={() => setIsUltrakillMode(false)}
          className="fixed top-6 right-6 z-[100] bg-black/70 border-4 border-white/20 border-b-black border-r-black px-6 py-3 border-red-500/50 bg-red-950/40 text-red-500 font-pixel text-shadow-hard text-[10px] tracking-widest uppercase hover:bg-red-900/60 flex items-center gap-3 animate-pulse shadow-[4px_4px_0_rgba(239,68,68,1)] transition-all"
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
          className={`bg-black/70 border-[4px] border-t-white/30 border-l-white/30 border-b-black border-r-black p-4 transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,0.8)] hover:bg-[#333] ${isUltrakillMode ? 'text-red-500 border-red-500/50 shadow-[6px_6px_0px_rgba(239,68,68,0.5)] bg-red-950/80' : 'text-white/80'}`}
          aria-label="Open Settings"
        >
          <Settings2 size={24} className={`${showSettings ? 'rotate-90' : ''} transition-transform duration-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]`} />
        </button>
        {showSettings && (
          <div className="absolute bottom-20 left-0 bg-black/80 border-[4px] border-t-white/20 border-l-white/20 border-b-black border-r-black p-5 w-64 space-y-4 animate-in fade-in slide-in-from-bottom-4 shadow-[8px_8px_0_rgba(0,0,0,0.8)]">
            <h4 className="font-mono text-[10px] text-white/60 font-bold uppercase mb-3 tracking-widest text-shadow-hard">Internal_Config</h4>
            <button 
              onClick={() => setPerformanceMode(!performanceMode)} 
              className="w-full text-left p-3 border-[3px] border-[#333] hover:bg-white/10 flex justify-between items-center transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              <span className="text-sm font-pixel text-shadow-hard text-[10px]">PerfFX</span>
              <span className={`font-mono text-xs font-bold text-shadow-hard ${performanceMode ? 'text-red-400' : 'text-green-400'}`}>{performanceMode ? '[OFF]' : '[ON]'}</span>
            </button>
            <div className="font-mono text-[9px] text-white/30 uppercase text-center mt-3 tracking-widest font-bold">Build: 2026.02.revC-Blocky</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default App;
