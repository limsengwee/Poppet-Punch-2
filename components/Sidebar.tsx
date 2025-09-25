
import React from 'react';
import type { Tool, Milestone } from '../types';
import ToolButton from './ToolButton';
import { REWARD_PER_HIT } from '../constants';

interface SidebarProps {
  tools: Tool[];
  onToolUse: (tool: Tool) => void;
  onRestart: () => void;
  activeTool: Tool | null;
  coins: number;
  hits: number;
  progress: number;
  currentMilestone: Milestone;
}

const Sidebar: React.FC<SidebarProps> = ({
  tools,
  onToolUse,
  onRestart,
  activeTool,
  coins,
  hits,
  progress,
  currentMilestone,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-xl p-4 shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">工具箱</h3>
            <span className="text-lg font-bold text-yellow-400">💰 {coins}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {tools.map((tool) => (
            <ToolButton
              key={tool.name}
              tool={tool}
              onClick={() => onToolUse(tool)}
              isActive={activeTool?.name === tool.name}
              disabled={coins < tool.cost}
            />
          ))}
        </div>
        <p className="text-center text-gray-400 mt-4 text-sm">所有工具已解锁! 尽情使用!</p>
      </div>

      <div className="bg-red-800/80 rounded-xl p-4 shadow-lg border border-red-600">
        <h3 className="text-xl font-bold text-white text-center">进度统计</h3>
        <p className="text-6xl font-extrabold text-yellow-300 text-center my-2 drop-shadow-lg">{hits}</p>
        <p className="text-center text-red-200 text-sm">总打击次数</p>
        
        <div className="mt-4">
            <div className="flex justify-between text-sm font-bold text-white mb-1">
                <span>进度</span>
                <span>{hits}/{currentMilestone.hitsRequired}</span>
            </div>
            <div className="w-full bg-red-900 rounded-full h-2.5">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-center text-sm text-red-200 mt-1">下一个里程碑: {currentMilestone.name}</p>
        </div>
      </div>
      
       <div className="bg-red-800/80 rounded-xl p-4 shadow-lg border border-red-600">
        <h3 className="text-xl font-bold text-white text-center mb-3">奖励</h3>
        <div className="flex justify-between items-center text-lg">
            <span className="text-red-200">当前金币:</span>
            <span className="font-bold text-yellow-400">💰 {coins}</span>
        </div>
        <div className="flex justify-between items-center text-lg mt-1">
            <span className="text-red-200">每击奖励:</span>
            <span className="font-bold text-yellow-400">+{REWARD_PER_HIT} 金币</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        重新开始
      </button>
    </div>
  );
};

export default Sidebar;