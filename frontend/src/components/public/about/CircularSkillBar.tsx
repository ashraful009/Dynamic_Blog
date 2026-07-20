"use client";
import { useEffect, useState, useRef } from "react";

interface CircularSkillBarProps {
  name: string;
  percentage: number;
}

export default function CircularSkillBar({ name, percentage }: CircularSkillBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const radius = 72;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Animate from 0 to percentage
      const duration = 1500; // 1.5s
      const steps = 60;
      const stepTime = duration / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += percentage / steps;
        if (current >= percentage) {
          setCurrentPercentage(percentage);
          clearInterval(timer);
        } else {
          setCurrentPercentage(Math.floor(current));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isVisible, percentage]);

  const strokeDashoffset = circumference - (currentPercentage / 100) * circumference;

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center relative w-44 h-44 group">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-sm"
      >
        {/* Background Circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1 max-w-[70%] leading-tight group-hover:text-primary transition-colors">
          {name}
        </span>
        <span className="text-xl font-display font-light text-text-secondary">
          {currentPercentage}%
        </span>
      </div>
    </div>
  );
}
