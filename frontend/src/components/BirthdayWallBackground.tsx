'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BirthdayWallBackgroundProps {
  animationType?: 'celebration' | 'autumn' | 'spring' | 'winter' | 'ocean' | 'galaxy' | 'confetti';
  backgroundColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const ELEMENTS = {
  celebration: ['🎂', '🎈', '🎁', '🎉', '🎊', '⭐', '✨', '💝', '🎀', '🦄'],
  autumn: ['🍂', '🍁', '🌰', '🍃', '🌾', '🍄', '🦋', '🌻', '🌺', '🍇'],
  spring: ['🌸', '🌷', '🌹', '🌺', '🌻', '🌼', '🦋', '🐝', '🌿', '🌱'],
  winter: ['❄️', '⛄', '🎄', '🎅', '🌟', '✨', '🔔', '🎁', '🧣', '☃️'],
  ocean: ['🐠', '🐟', '🐙', '🦀', '🐚', '🌊', '💧', '⚓', '⛵', '🌊'],
  galaxy: ['⭐', '✨', '🌟', '💫', '🌙', '🪐', '☄️', '🌌', '🔭', '🚀'],
  confetti: ['🎊', '🎉', '✨', '⭐', '💫', '🌟', '🎈', '🎁', '🎀', '💝'],
};

export default function BirthdayWallBackground({
  animationType = 'celebration',
  backgroundColor = 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100',
  intensity = 'medium',
}: BirthdayWallBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = ELEMENTS[animationType] || ELEMENTS.celebration;
  
  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute text-2xl md:text-3xl select-none pointer-events-none';
      particle.textContent = elements[Math.floor(Math.random() * elements.length)];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${-10 - Math.random() * 20}%`;
      particle.style.opacity = `${0.3 + Math.random() * 0.7}`;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const duration = 10 + Math.random() * 20; // 10-30 seconds
      const delay = Math.random() * 5;
      const xMovement = (Math.random() - 0.5) * 200; // Horizontal drift
      
      particle.style.animation = `fall ${duration}s ${delay}s infinite linear`;
      particle.style.setProperty('--x-movement', `${xMovement}px`);
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Add keyframes if not already added
    if (!document.getElementById('falling-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'falling-animation-styles';
      style.textContent = `
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) translateX(var(--x-movement)) rotate(180deg);
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--x-movement) * 2)) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, [animationType, intensity, elements, particleCount]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 ${backgroundColor} overflow-hidden -z-10`}
      style={{ 
        background: backgroundColor.includes('gradient') ? undefined : backgroundColor,
      }}
    >
      {/* Additional floating elements with Framer Motion for smoother animation */}
      {typeof window !== 'undefined' && Array.from({ length: Math.floor(particleCount / 3) }).map((_, i) => (
        <motion.div
          key={`motion-${i}`}
          className="absolute text-3xl md:text-4xl select-none pointer-events-none"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: -50,
            rotate: 0,
            opacity: 0.4,
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            rotate: 360,
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 15 + Math.random() * 15,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        >
          {elements[Math.floor(Math.random() * elements.length)]}
        </motion.div>
      ))}
    </div>
  );
}

