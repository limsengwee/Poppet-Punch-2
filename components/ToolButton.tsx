
import React from 'react';
import type { Tool } from '../types';

interface ToolButtonProps {
  tool: Tool;
  onClick: () => void;
  isActive: boolean;
  disabled: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, onClick, isActive, disabled }) => {
  const baseClasses = "flex flex-col items-center justify-center p-2 rounded-lg aspect-square transition-all duration-200 transform";
  const activeClasses = isActive ? "bg-yellow-500 text-black scale-110 shadow-lg" : "bg-gray-700 text-white hover:bg-gray-600";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-800 text-gray-500" : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
    >
      <div className="w-8 h-8 mb-1">{tool.icon}</div>
      <span className="text-xs font-semibold text-center leading-tight">{tool.name}</span>
      {tool.cost > 0 && !disabled && (
          <span className={`text-xs font-bold ${isActive ? 'text-black/70' : 'text-yellow-500'}`}>
              {tool.cost}
          </span>
      )}
    </button>
  );
};

export default ToolButton;
