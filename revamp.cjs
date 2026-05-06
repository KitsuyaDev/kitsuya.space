const { readFileSync, writeFileSync } = require('fs');

const content = readFileSync('App.tsx', 'utf-8');

const retroPanelCode = `
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
      className={\`relative overflow-hidden \${isClickable ? 'cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none' : ''} \${
        isUltrakill 
          ? 'bg-[#150000] border-[4px] border-t-red-500/50 border-l-red-500/50 border-b-red-950 border-r-red-950 shadow-[6px_6px_0px_rgba(100,0,0,0.8)]' 
          : 'bg-[#0f0c13] border-[4px] border-t-white/20 border-l-white/20 border-b-black/80 border-r-black/80 shadow-[6px_6px_0px_rgba(0,0,0,0.8)]'
      } \${className}\`}
    >
      <div className={\`absolute inset-0 opacity-[0.03] pointer-events-none \${isUltrakill ? 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'1\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)\\'/%3E%3C/svg%3E")]' : 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'1\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)\\'/%3E%3C/svg%3E")]'}\`} />
      
      {title && (
         <div className={\`p-4 border-b-[4px] flex items-center justify-between \${
           isUltrakill ? 'bg-red-900/20 border-b-red-950/80' : 'bg-black/40 border-b-black/80'
         }\`}>
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
`;

let result = content.replace(/(?<=const itemVariants = \{\n.*?\n.*?\n  \};\n)/s, retroPanelCode + '\n');

// Replace header
result = result.replace(
  /<motion\.header.*?(?=<div className="grid)/s,
  `
        {/* Header Hero */}
        <RetroPanel isUltrakill={isUltrakillMode} className="p-0 mb-6">
          <div className={\`p-3 border-b-[4px] flex items-center justify-between \${isUltrakillMode ? 'bg-red-900/30 border-red-950' : 'bg-black/50 border-black'}\`}>
            <h3 className="font-mono text-[10px] opacity-70 uppercase tracking-widest flex items-center gap-2 font-bold text-shadow-hard">
              {isUltrakillMode ? <ShieldAlert size={12} className="text-red-500" /> : <Coffee size={12} className="text-sakura-400" />}
              {isUltrakillMode ? 'ULTRAKILL_SESSION.v1' : 'user_identity.init()'}
            </h3>
            <Layout size={12} className="text-white/40" />
          </div>
          
          <div className="p-8 md:p-12 relative overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 w-full">
              <div 
                className={\`relative w-32 h-32 md:w-36 md:h-36 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:rotate-3 cursor-crosshair shrink-0 p-1 border-4 pixelated \${isUltrakillMode ? 'border-red-500/40 shadow-[8px_8px_0px_rgba(239,68,68,0.3)] bg-red-950' : 'border-[#333] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] bg-[#1a1a1a]'}\`}
                onMouseEnter={() => playSound('hover')}
              >
                 <img src="https://cdn.modrinth.com/data/1pGHhzz2/ffc308a879d380f938987cd4e14f6d9b4e54b677_96.webp" 
                      className={\`w-full h-full object-cover border-2 border-black pixelated transition-all duration-1000 \${isUltrakillMode ? 'hue-rotate-[320deg] saturate-150' : ''}\`} alt="Profile Avatar" />
              </div>
              
              <div onClick={handleHeaderClick} className="cursor-pointer select-none flex-1 w-full">
                <div className="flex flex-col gap-3">
                  <h1 className={\`font-pixel text-shadow-hard text-2xl sm:text-3xl md:text-5xl leading-relaxed tracking-tight flex items-center justify-center sm:justify-start gap-4 \${isUltrakillMode ? 'text-red-500' : 'text-white'}\`}>
                    {isUltrakillMode ? 'ULTRA_KIT' : 'KITSUYA.SPACE'}
                    {(headerClicks >= 10 || isUltrakillMode) && <Trophy size={32} fill="#eab308" className="text-yellow-400 animate-bounce drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />}
                  </h1>
                  
                  {/* Hearts */}
                  <div className="flex justify-center sm:justify-start">
                     <div className="flex gap-0.5 pointer-events-none">
                       {[...Array(10)].map((_, i) => (
                          <Heart key={i} size={20} fill={isUltrakillMode ? '#ef4444' : '#ffb7c5'} stroke="#000" strokeWidth={2.5} className={\`drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] \${i >= (isUltrakillMode ? 5 : 10) ? 'opacity-30' : ''} \${i === 0 && !isUltrakillMode ? 'animate-pulse' : ''}\`} />
                       ))}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                    <span className="relative flex items-center justify-center border-[3px] border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)] p-1 bg-black/40">
                      <span className={\`w-2 h-2 \${track?.nowPlaying ? 'bg-[#55ff55]' : (isUltrakillMode ? 'bg-[#ff5555]' : 'bg-[#ffb7c5]')}\`} />
                      {!performanceMode && <span className={\`absolute w-full h-full animate-ping opacity-50 \${track?.nowPlaying ? 'bg-[#55ff55]' : (isUltrakillMode ? 'bg-[#ff5555]' : 'bg-[#ffb7c5]')}\`} />}
                    </span>
                    <p className={\`font-pixel text-shadow-hard text-[10px] md:text-xs uppercase tracking-widest \${isUltrakillMode ? 'text-red-400' : 'text-sakura-200'}\`}>
                       {isUltrakillMode ? '~ blood_is_fuel' : '~ root@kitsuya'}
                    </p>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="w-full flex flex-col items-center sm:items-start mt-6">
                   <div className="w-full max-w-md h-3 border-[3px] border-black bg-black/50 relative shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                      <div className={\`h-full \${isUltrakillMode ? 'bg-[#ff0000]' : 'bg-[#55ff55]'} transition-all duration-300 border-t border-t-white/40\`} style={{ width: \`\${Math.min(100, (headerClicks / 10) * 100)}%\` }} />
                      <div className="absolute inset-0 flex justify-between">
                         {[...Array(19)].map((_, i) => <div key={i} className="w-[3px] h-full bg-black/40" />)}
                      </div>
                   </div>
                   <div className="w-full max-w-md flex justify-center mt-1">
                     <span className={\`font-pixel text-[12px] sm:text-sm text-shadow-hard font-bold \${isUltrakillMode ? 'text-[#ff5555]' : 'text-[#55ff55]'}\`}>
                       20
                     </span>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </RetroPanel>
`
);

// Replace About Me
result = result.replace(
  /<motion\.section.*?(?=hihi :3 im kit)(hihi :3 im kit).*?(?=<\/motion\.section>).*?<\/motion\.section>/s,
  `
            <RetroPanel 
              isUltrakill={isUltrakillMode} 
              title={isUltrakillMode ? 'MANIFEST_LOG.txt' : 'About_Me.txt'}
              icon={isUltrakillMode ? <Terminal size={14} className="text-red-500" /> : <Sparkles size={14} className="text-sakura-400" />}
              rightIcon={<Activity size={14} className="text-white/20" />}
            >
              <div className="p-8 md:p-10 flex flex-col gap-6 text-xl leading-relaxed text-white/90">
                <p className={\`font-pixel text-shadow-hard text-xl md:text-2xl \${isUltrakillMode ? 'text-red-500 font-bold' : 'text-sakura-200'} tracking-tighter leading-normal\`}>
                  hihi :3 im kit
                </p>
                <p>
                  i’ve been doing minecraft dev stuff for around <span className={\`\${isUltrakillMode ? 'text-red-400' : 'text-sakura-300'} font-bold border-b-4 border-sakura-400/30\`}>7–8 years</span>, mostly focused on performance and systems. i mainly work with fabric and neoforge.
                </p>
                <p>
                  i spend a lot of time fixing tps issues, digging through crash logs, and removing things that don’t need to exist. if something is slow or broken, i’ll usually keep poking at it until i understand why.
                </p>
                <p>
                  i’ve worked on some projects i’m really proud of, but unfortunately a lot of the cool ones are under nda, so i can’t say much about them. i also make modpacks and help optimize higher-end networks.
                </p>
              </div>
            </RetroPanel>
`
);

// Replace Pyro
result = result.replace(
  /<motion\.section variants=\{itemVariants\} className=\{`dimden-panel p-0 overflow-hidden group relative \$\{isUltrakillMode \? 'border-red-500\/50' : ''\}`\}.*?<\/motion\.section>/s,
  `
            <RetroPanel 
              isUltrakill={isUltrakillMode} 
              title={isUltrakillMode ? 'OPTIMIZED_INFRASTRUCTURE' : 'Recommended Host'} 
              icon={<Star size={14} className={\`\${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'}\`} />}
              rightIcon={<ShieldCheck size={16} className="text-white/30" />}
            >
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className={\`w-32 h-32 overflow-hidden shrink-0 border-4 \${isUltrakillMode ? 'border-red-950 shadow-[6px_6px_0px_rgba(239,68,68,0.5)]' : 'border-[#222] shadow-[6px_6px_0px_rgba(0,0,0,0.8)]'}\`}>
                  <img src="https://avatars.githubusercontent.com/u/132858781?s=200&v=4" className={\`w-full h-full object-cover pixelated border-2 border-black \${isUltrakillMode ? 'grayscale saturate-200' : ''}\`} alt="Pyro" />
                </div>
                <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-4">
                  <div>
                    <h3 className={\`font-pixel text-shadow-hard text-2xl mb-4 leading-normal \${isUltrakillMode ? 'text-red-500' : 'text-white'}\`}>Pyro</h3>
                    <p className={\`text-xl \${isUltrakillMode ? 'text-red-200/80' : 'text-white/80'}\`}>
                      High end game servers with super fast connections. Powerful AMD Ryzen processors.
                    </p>
                  </div>
                  
                  <div className={\`mt-2 p-5 border-[4px] flex gap-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,0.5)] \${isUltrakillMode ? 'bg-[#2a0000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-100/80' : 'bg-[#1a1518] border-t-white/10 border-l-white/10 border-b-black/80 border-r-black/80 text-white/80'}\`}>
                    <Info size={24} className="shrink-0 mt-1 opacity-80 pl-1" />
                    <p className="text-[17px] leading-relaxed text-shadow-hard">
                      <span className={\`font-bold \${isUltrakillMode ? 'text-red-400' : 'text-[#ffb7c5]'}\`}>Disclaimer:</span> Kit is not partnered with Pyro, but the link below does support them. It's the only server host i use for my projects because of their outstanding quality and price.
                    </p>
                  </div>

                  <a href="https://pyro.host/?a=41" target="_blank" rel="noreferrer" className={\`mt-4 inline-flex items-center gap-3 text-lg font-bold transition-all border-[4px] py-3 px-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none \${isUltrakillMode ? 'bg-[#550000] border-t-red-500 border-l-red-500 border-b-[#220000] border-r-[#220000] text-white hover:bg-[#660000]' : 'bg-[#6a6a6a] border-t-[#b2b2b2] border-l-[#b2b2b2] border-b-[#2e2e2e] border-r-[#2e2e2e] text-black hover:bg-[#858585]'}\`}>
                    <span className="font-pixel text-[10px] md:text-xs">
                      {isUltrakillMode ? 'SECURE_LINK' : 'Visit Pyro'}
                    </span>
                    <ExternalLink size={16} strokeWidth={3} className={isUltrakillMode ? '' : 'text-black'} />
                  </a>
                </div>
              </div>
            </RetroPanel>
  `
);

// Replace Sidebar items successively

// Links
result = result.replace(
  /<motion\.div variants=\{itemVariants\} className=\{`dimden-panel p-0 overflow-hidden group \$\{isUltrakillMode \? 'border-red-500\/40' : ''\}`\}.*?<\/motion\.div>/s,
  `
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
                  <a key={idx} href={link.href} target="_blank" rel="noreferrer" className={\`group/link py-3 px-4 flex items-center justify-between transition-all duration-200 border-[3px] shadow-[4px_4px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] \${isUltrakillMode ? 'bg-[#330000] border-t-red-900 border-l-red-900 border-b-black border-r-black text-red-200 hover:bg-[#440000]' : 'bg-[#333] border-t-[#555] border-l-[#555] border-b-[#111] border-r-[#111] text-white/90 hover:bg-[#444]'}\`}>
                    <div className="flex items-center gap-4 text-lg text-shadow-hard">
                      <link.icon size={20} className={\`\${isUltrakillMode ? 'text-red-500' : 'text-sakura-400'} drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]\`} strokeWidth={2.5} />
                      <span className="font-pixel text-[10px] mt-1">{link.label}</span>
                    </div>
                    <ExternalLink size={16} strokeWidth={3} className="opacity-40 group-hover/link:opacity-100 transition-opacity drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                  </a>
                ))}
              </nav>
            </RetroPanel>
  `
);

// Profile
result = result.replace(
  /<motion\.div\s+variants=\{itemVariants\}\s+className=\{`dimden-panel p-0 overflow-hidden cursor-pointer select-none transition-colors \$\{isUltrakillMode \? 'border-red-500\/40' : 'hover:border-sakura-400\/40'\}`\}.*?(?=<\/motion\.div>)<\/motion\.div>/s,
  `
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
                    { label: 'Age', value: '20' },
                    { label: 'Pronouns', value: 'They/Them' },
                    { label: 'Timezone', value: 'GMT' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 border-[3px] border-t-[#333] border-l-[#333] border-b-[#000] border-r-[#000] bg-[#1a1a1a]">
                      <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest text-shadow-hard">{item.label}</span>
                      <span className={\`text-[17px] tracking-tight font-bold text-shadow-hard \${isUltrakillMode ? 'text-red-400' : 'text-white/90'}\`}>{item.value}</span>
                    </div>
                  ))}
              </div>
            </RetroPanel>
  `
);

// Hardware
result = result.replace(
  /<motion\.div variants=\{itemVariants\} className=\{`dimden-panel p-0 overflow-hidden \$\{isUltrakillMode \? 'border-red-500\/40' : ''\}`\}.*?(?=<\/motion\.div>)<\/motion\.div>/s,
  `
            <RetroPanel
              isUltrakill={isUltrakillMode}
              title={isUltrakillMode ? 'HARDWARE_SPECS' : 'Hardware'}
              icon={<Cpu size={14} />}
            >
               <div className="p-5 flex flex-col gap-2">
                  {[
                    { label: 'CPU', value: 'Epyc 7543P' },
                    { label: 'MEM', value: '28GB DDR4' },
                    { label: 'SSD', value: '2tb NVMe' }
                  ].map((spec, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 px-3 border-[3px] border-t-[#333] border-l-[#333] border-b-[#000] border-r-[#000] bg-[#1a1a1a]">
                      <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest text-shadow-hard">{spec.label}</span>
                      <span className={\`font-mono text-sm font-bold text-shadow-hard \${isUltrakillMode ? 'text-red-500' : 'text-sakura-200'}\`}>{spec.value}</span>
                    </div>
                  ))}
               </div>
            </RetroPanel>
  `
);

// Audio
result = result.replace(
  /<motion\.div variants=\{itemVariants\} className=\{`dimden-panel p-0 overflow-hidden \$\{isUltrakillMode \? 'border-red-500\/40' : ''\}`\}.*?(?=<\/motion\.div>)<\/motion\.div>/s,
  `
            <RetroPanel
              isUltrakill={isUltrakillMode}
              title={track?.nowPlaying ? 'Now Playing' : 'Last Track'}
              icon={track?.nowPlaying ? <Radio size={14} /> : <History size={14} />}
            >
               <div className="p-5">
                 {track ? (
                   <a href={track.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 group/track p-2 border-[3px] border-t-[#333] border-l-[#333] border-b-[#000] border-r-[#000] bg-[#1a1a1a] hover:bg-[#252525] transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.8)]">
                      <div className="w-14 h-14 overflow-hidden shrink-0 relative border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        <img src={track.image || ''} className={\`w-full h-full object-cover pixelated hover:scale-110 transition-transform duration-500 \${isUltrakillMode ? 'sepia hue-rotate-[320deg]' : ''}\`} alt="Art" />
                        {track.nowPlaying && <div className="absolute inset-0 border-2 border-green-400/50 animate-pulse pointer-events-none" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={\`text-base font-bold text-shadow-hard truncate \${isUltrakillMode ? 'text-red-400' : 'text-white'}\`}>{track.name}</p>
                        <p className="font-mono text-[10px] text-white/60 truncate uppercase mt-1 text-shadow-hard">{track.artist}</p>
                      </div>
                   </a>
                 ) : (
                   <div className="text-center py-4 text-xs font-mono opacity-40 uppercase tracking-widest text-shadow-hard">No Signal</div>
                 )}
               </div>
            </RetroPanel>
  `
);

// Support
result = result.replace(
  /<motion\.div variants=\{itemVariants\} className=\{`dimden-panel p-0 overflow-hidden group\/support \$\{isUltrakillMode \? 'border-red-500\/40' : ''\}`\}.*?(?=<\/motion\.div>)<\/motion\.div>/s,
  `
            <RetroPanel isUltrakill={isUltrakillMode} className="p-0">
               <a 
                href="https://ko-fi.com/kitsuyadev" 
                target="_blank" 
                rel="noreferrer"
                className={\`p-5 flex items-center justify-center gap-3 transition-colors text-lg font-pixel \${isUltrakillMode ? 'hover:bg-red-950/40 text-red-500' : 'hover:bg-black/40 text-sakura-300'}\`}
               >
                 <Coffee size={24} className="group-hover:rotate-12 transition-transform drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" strokeWidth={2.5} />
                 <span className="font-bold text-shadow-hard shadow-[rgba(0,0,0,1)] text-sm">Support on Ko-fi</span>
               </a>
            </RetroPanel>
  `
);

// Discovery Log
result = result.replace(
  /<motion\.div variants=\{itemVariants\} className=\{`dimden-panel p-5 overflow-hidden relative \$\{isUltrakillMode \? 'border-red-500\/40 bg-red-950\/20' : ''\}`\}.*?(?=<\/motion\.div>)<\/motion\.div>/s,
  `
            <RetroPanel isUltrakill={isUltrakillMode} title={isUltrakillMode ? 'MEMORY_FRAGMENT_LOG' : 'Discovery Log'} icon={<Flame size={14} />}>
               <div className="space-y-3 p-5">
                   {['xp_egg', 'konami', 'profile'].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className={\`w-3 h-3 border border-black shadow-[2px_2px_0_rgba(0,0,0,0.8)] \${foundSecrets.includes(s) ? 'bg-[#55ff55]' : 'bg-[#555]'}\`} />
                      <span className={\`font-mono text-[10px] uppercase tracking-widest text-shadow-hard \${foundSecrets.includes(s) ? (isUltrakillMode ? 'text-red-400 font-bold' : 'text-white font-bold') : 'text-white/40'}\`}>
                        {foundSecrets.includes(s) ? s.replace('_', ' ') : '??????'}
                      </span>
                    </div>
                  ))}
               </div>
            </RetroPanel>
  `
);

// Settings overlay and EXIT override
// Replace dimden-panel with generic class or re-style
result = result.replace(/dimden-panel/g, 'bg-black/70 border-4 border-white/20 border-b-black border-r-black');


writeFileSync('App.tsx', result, 'utf-8');
console.log('App.tsx transformed successfully!');
