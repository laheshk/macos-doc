import React, { useCallback, useRef, useState, useEffect } from 'react';

function App() {
  const icons = [
    'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024',
    'https://cdn.jim-nielsen.com/macos/1024/messages-2021-05-25.png?rf=1024',
    'https://cdn.jim-nielsen.com/macos/1024/music-2021-05-25.png?rf=1024',
    'https://cdn.jim-nielsen.com/macos/512/final-cut-pro-2015-04-14.png?rf=512',
    'https://cdn.jim-nielsen.com/macos/1024/podcasts-2021-05-28.png?rf=1024',
    'https://cdn.jim-nielsen.com/macos/1024/notes-2021-05-25.png?rf=1024'
  ];
  
  const appNames = ['Finder', 'Messages', 'Music', 'Final Cut Pro', 'Podcasts', 'Notes'];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>(icons.map(() => 1));
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [jumpingIcon, setJumpingIcon] = useState<number | null>(null);
  const [showTooltips, setShowTooltips] = useState(true);
  
  const ITEM_BASE_WIDTH = 64;
  const ITEM_GAP = -10; // Negative margin between icons
  const MAX_SCALE = 2;
  const CONTAINER_PADDING = 0;
  const ITEM_BORDER_RADIUS = 16;

  useEffect(() => {
    if (jumpingIcon !== null) {
      setShowTooltips(false);
      const timer = setTimeout(() => {
        const stopTimer = setTimeout(() => {
          setJumpingIcon(null);
          setShowTooltips(true);
        }, 600);
        return () => clearTimeout(stopTimer);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [jumpingIcon]);

  const getTotalWidth = useCallback(() => {
    let totalWidth = 0;
    scales.forEach((scale, index) => {
      totalWidth += ITEM_BASE_WIDTH * scale;
      if (index < icons.length - 1) {
        totalWidth += ITEM_GAP;
      }
    });
    return totalWidth + (CONTAINER_PADDING * 2);
  }, [scales]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const adjustedMouseX = mouseX - CONTAINER_PADDING;
    
    requestAnimationFrame(() => {
      const newScales = icons.map((_, index) => {
        const itemCenter = index * (ITEM_BASE_WIDTH + ITEM_GAP) + ITEM_BASE_WIDTH / 2;
        const distance = Math.abs(adjustedMouseX - itemCenter);
        const maxDistance = 80;
        
        if (distance > maxDistance) return 1;
        return 1 + (1 - distance / maxDistance) * (MAX_SCALE - 1);
      });
      
      setScales(newScales);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setScales(icons.map(() => 1));
  }, []);

  const handleClick = useCallback((index: number) => {
    setActiveIcon(index);
    setJumpingIcon(index);
  }, []);

  const getPositions = useCallback(() => {
    let positions: number[] = [];
    let currentPosition = CONTAINER_PADDING;
    
    scales.forEach((scale, index) => {
      positions[index] = currentPosition;
      const scaledWidth = ITEM_BASE_WIDTH * scale;
      currentPosition += scaledWidth + ITEM_GAP;
    });

    return positions;
  }, [scales]);
  
  const positions = getPositions();
  const currentWidth = getTotalWidth();

  return (
    <div 
      className="min-h-screen flex items-end justify-center pb-20"
      style={{ backgroundColor: '#1c1c1c' }}
    >
      <div 
        ref={containerRef}
        style={{ 
          width: `${currentWidth}px`,
          padding: `${CONTAINER_PADDING}px`,
          willChange: 'width',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-16 relative">
          {icons.map((iconUrl, index) => {
            const scale = scales[index];
            const position = positions[index];
            const appName = appNames[index];
            const isActive = activeIcon === index;
            const isJumping = jumpingIcon === index;
            
            return (
              <div
                key={index}
                className="emoji-wrapper absolute group cursor-pointer"
                style={{
                  transform: `translateX(${position}px)`,
                  width: `${ITEM_BASE_WIDTH}px`,
                  height: `${ITEM_BASE_WIDTH}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  willChange: 'transform',
                }}
                onClick={() => handleClick(index)}
              >
                {showTooltips && (
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-100 
                             pointer-events-none"
                    style={{
                      bottom: '100%',
                      left: '50%',
                      transform: `translateX(-50%) translateY(-50px)`,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    <div className="relative">
                      <div
                        className="px-2 py-0.5 text-white whitespace-nowrap rounded-md"
                        style={{
                          backgroundColor: '#303030',
                          boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.3)',
                          fontSize: '14px'
                        }}
                      >
                        {appName}
                      </div>
                      <div
                        className="absolute w-0 h-0 left-1/2 -translate-x-1/2 border-x-[4px] border-x-transparent
                                 border-t-[4px]"
                        style={{ 
                          bottom: '-4px',
                          borderTopColor: '#303030'
                        }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex items-center justify-center ${isJumping ? 'jumping' : ''}`}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom center',
                    '--current-scale': scale,
                  } as React.CSSProperties}
                >
                  <img 
                    src={iconUrl}
                    alt={`macOS icon ${index + 1}`}
                    className="w-12 h-12 rounded-2xl"
                    style={{
                      objectFit: 'cover',
                      willChange: 'transform',
                    }}
                    draggable={false}
                  />
                </div>
                {isActive && (
                  <div 
                    className="absolute w-1 h-1 rounded-full bg-white"
                    style={{ 
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;