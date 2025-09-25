import React, { useRef } from 'react';
import type { Tool, Milestone, SlapMark } from '../types';
import Sidebar from './Sidebar';
import { HandSlapMark } from './Icons';

interface GameScreenProps {
  image: string;
  tools: Tool[];
  onToolUse: (tool: Tool) => void;
  onRestart: () => void;
  activeTool: Tool | null;
  coins: number;
  hits: number;
  progress: number;
  currentMilestone: Milestone;
  isLoading: boolean;
  loadingMessage: string;
  slapMarks: SlapMark[];
  onImageClick: (coords: { containerX: number; containerY: number; imageX: number; imageY: number; }) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  image,
  tools,
  onToolUse,
  onRestart,
  activeTool,
  coins,
  hits,
  progress,
  currentMilestone,
  isLoading,
  loadingMessage,
  slapMarks,
  onImageClick,
}) => {
  // Fix: Corrected the tool name from 'Hand Slap' to the correct Chinese name '手拍' to match the ToolName type.
  const isSlapToolActive = activeTool?.name === '手拍';
  const imageRef = useRef<HTMLImageElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !isSlapToolActive) return;

      const img = imageRef.current;
      const container = e.currentTarget;

      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      if (naturalWidth === 0 || naturalHeight === 0) return;

      const containerRect = container.getBoundingClientRect();

      const widthRatio = containerRect.width / naturalWidth;
      const heightRatio = containerRect.height / naturalHeight;
      const scale = Math.min(widthRatio, heightRatio);

      const renderedWidth = naturalWidth * scale;
      const renderedHeight = naturalHeight * scale;

      const offsetX = (containerRect.width - renderedWidth) / 2;
      const offsetY = (containerRect.height - renderedHeight) / 2;

      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;

      const imageX = clickX - offsetX;
      const imageY = clickY - offsetY;
      
      if (imageX >= 0 && imageX <= renderedWidth && imageY >= 0 && imageY <= renderedHeight) {
          const containerXPercent = (clickX / containerRect.width) * 100;
          const containerYPercent = (clickY / containerRect.height) * 100;
          
          const imageXPercent = (imageX / renderedWidth) * 100;
          const imageYPercent = (imageY / renderedHeight) * 100;

          onImageClick({
              containerX: containerXPercent,
              containerY: containerYPercent,
              imageX: imageXPercent,
              imageY: imageYPercent,
          });
      }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full p-2 md:p-4">
      <div className="flex-grow relative min-w-0 min-h-0">
        <div 
          className={`bg-black/30 rounded-lg p-1 shadow-2xl relative w-full h-full flex items-center justify-center ${isSlapToolActive ? 'cursor-pointer' : ''}`}
          onClick={handleContainerClick}
        >
            <img
                ref={imageRef}
                src={image}
                alt="Poppet to punch"
                className="w-full h-full object-contain rounded-md"
            />
             <div className="absolute inset-1 pointer-events-none">
                {slapMarks.map(mark => (
                    <div
                        key={mark.id}
                        className="absolute w-1/4 h-1/4 text-white"
                        style={{
                            left: `${mark.x}%`,
                            top: `${mark.y}%`,
                            transform: `translate(-50%, -50%) rotate(${mark.rotation}deg)`,
                            opacity: 0.7,
                        }}
                    >
                        <HandSlapMark />
                    </div>
                ))}
            </div>
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">{loadingMessage}</p>
          </div>
        )}
      </div>

      <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <Sidebar
          tools={tools}
          onToolUse={onToolUse}
          onRestart={onRestart}
          activeTool={activeTool}
          coins={coins}
          hits={hits}
          progress={progress}
          currentMilestone={currentMilestone}
        />
      </div>
    </div>
  );
};

export default GameScreen;