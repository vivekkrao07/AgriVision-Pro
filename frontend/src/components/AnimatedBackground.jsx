import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const AnimatedBackground = () => {
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  
  // Spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <div className="animated-bg" style={{ position: 'fixed', zIndex: -1, pointerEvents: 'none' }}>
      <div className="gradient-sphere shape-1"></div>
      <div className="gradient-sphere shape-2"></div>
      <div className="gradient-sphere shape-3"></div>
      
      {/* Interactive cursor follower */}
      <motion.div
        style={{
          position: 'absolute',
          left: cursorXSpring,
          top: cursorYSpring,
          x: '-50%',
          y: '-50%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.25)', /* Bright blue glow */
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
