
import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

const AudioVisualizer = ({ isActive }: AudioVisualizerProps) => {
  if (!isActive) return null;

  return (
    <div className="audio-visualizer flex items-end h-6 space-x-1">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="bar h-2"
          style={{ 
            height: `${Math.max(8, Math.random() * 24)}px`,
            animationDelay: `${i * 0.1}s` 
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
