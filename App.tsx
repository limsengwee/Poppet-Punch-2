import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Tool, FaceBounds, SlapMark } from './types';
import { TOOLS, INITIAL_COINS, REWARD_PER_HIT, MILESTONES } from './constants';
import { moderateImage, editImage, detectFace } from './services/geminiService';

import UploadScreen from './components/UploadScreen';
import GameScreen from './components/GameScreen';
import Modal from './components/Modal';

interface ClickCoords {
    containerX: number;
    containerY: number;
    imageX: number;
    imageY: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('disclaimer');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(INITIAL_COINS);
  const [hits, setHits] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [faceBounds, setFaceBounds] = useState<FaceBounds | null>(null);
  const [slapMarks, setSlapMarks] = useState<SlapMark[]>([]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUserImage(base64String);
      setProcessedImage(base64String);
      setGameState('moderating');
      setError(null);
    };
    reader.onerror = () => {
      setError("读取图片文件失败。");
    };
    reader.readAsDataURL(file);
  };
  
  const processUploadedImage = useCallback(async () => {
    if (!userImage) return;

    if (gameState === 'moderating') {
        setIsLoading(true);
        setLoadingMessage('AI正在检查您的图片...');
        try {
            const isSafe = await moderateImage(userImage);
            if (isSafe) {
                setGameState('detectingFace');
            } else {
                setError("此图片被标记为不适宜内容。请上传另一张。");
                handleRestart();
            }
        } catch (e) {
            console.error(e);
            setError("无法验证图片。请重试。");
            handleRestart();
        } finally {
            setIsLoading(false);
        }
    } else if (gameState === 'detectingFace') {
        setIsLoading(true);
        setLoadingMessage('AI正在检测人脸...');
        try {
            const bounds = await detectFace(userImage);
            if (bounds) {
                setFaceBounds(bounds);
                setGameState('playing');
            } else {
                setError("无法在此图片中检测到人脸。请使用更清晰的人脸照片。");
                handleRestart();
            }
        } catch (e) {
            console.error(e);
            setError("人脸检测失败。请重试。");
            handleRestart();
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }
  }, [userImage, gameState]);

  useEffect(() => {
    if (gameState === 'moderating' || gameState === 'detectingFace') {
        processUploadedImage();
    }
  }, [gameState, processUploadedImage]);

  const handleToolUse = async (tool: Tool) => {
    if (!processedImage || isLoading) return;
    if (coins < tool.cost) {
        setError("金币不足，无法使用此工具！");
        setTimeout(() => setError(null), 3000);
        return;
    }

    // Special handling for client-side tools
    if (tool.name === '手拍') {
        setActiveTool(tool);
        return;
    }

    setActiveTool(tool);
    setIsLoading(true);
    setLoadingMessage(`正在应用 ${tool.name}...`);
    setError(null);

    try {
      // For AI tools, reset slap marks as the base image is changing
      setSlapMarks([]); 
      const newImage = await editImage(processedImage, tool);
      setProcessedImage(newImage);
      // Re-run face detection on the newly edited image
      const newBounds = await detectFace(newImage);
      if(newBounds) {
        setFaceBounds(newBounds);
      } else {
        // If face is no longer detectable, keep old bounds as a fallback
        console.warn("Could not detect face in newly edited image.");
      }
      setHits(prev => prev + 1);
      setCoins(prev => prev - tool.cost + REWARD_PER_HIT);
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message === 'EDITING_SAFETY_BLOCK') {
          setError("此效果已被安全过滤器阻止。请尝试其他工具。");
      } else {
          setError("AI应用效果失败。请重试。");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setActiveTool(null);
    }
  };
  
  const handleImageClick = (coords: ClickCoords) => {
    if (gameState !== 'playing' || activeTool?.name !== '手拍' || !faceBounds) return;

    const tool = TOOLS.find(t => t.name === '手拍');
    if (!tool || coins < tool.cost) {
        setError(tool ? "金币不足！" : "找不到工具");
        setTimeout(() => setError(null), 3000);
        return;
    }

    const { containerX, containerY, imageX, imageY } = coords;

    // Use image-relative coords for hit detection
    const isHit = imageX >= faceBounds.x && 
                  imageX <= faceBounds.x + faceBounds.width &&
                  imageY >= faceBounds.y &&
                  imageY <= faceBounds.y + faceBounds.height;
    
    if (isHit) {
        const newSlap: SlapMark = {
            id: Date.now() + Math.random(), // Add random to avoid key collision on rapid clicks
            // Use container-relative coords for positioning
            x: containerX,
            y: containerY,
            rotation: Math.random() * 90 - 45, // -45 to +45 degrees
        };
        setSlapMarks(prev => [...prev, newSlap]);
        setHits(prev => prev + 1);
        setCoins(prev => prev - tool.cost + REWARD_PER_HIT);
        // Tool remains active for more slaps
    }
  };


  const handleRestart = () => {
    setGameState('upload');
    setUserImage(null);
    setProcessedImage(null);
    setCoins(INITIAL_COINS);
    setHits(0);
    setActiveTool(null);
    setError(null);
    setFaceBounds(null);
    setSlapMarks([]);
  };
  
  const currentMilestone = MILESTONES.find(m => hits < m.hitsRequired) || MILESTONES[MILESTONES.length - 1];
  const progress = currentMilestone ? (hits / currentMilestone.hitsRequired) * 100 : 100;
  
  const renderContent = () => {
    switch (gameState) {
      case 'disclaimer':
        return null;
      case 'upload':
        return <UploadScreen onImageUpload={handleImageUpload} error={error} />;
      case 'moderating':
      case 'detectingFace':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">{loadingMessage}</p>
          </div>
        );
      case 'playing':
        if (!processedImage) {
          handleRestart();
          return null;
        }
        return (
          <GameScreen
            image={processedImage}
            tools={TOOLS}
            onToolUse={handleToolUse}
            onRestart={handleRestart}
            activeTool={activeTool}
            coins={coins}
            hits={hits}
            progress={progress}
            currentMilestone={currentMilestone}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            slapMarks={slapMarks}
            onImageClick={handleImageClick}
          />
        );
      default:
        return <UploadScreen onImageUpload={handleImageUpload} error={error} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#4d1a1a] to-[#a52a2a] h-screen grid grid-rows-[auto_1fr] text-white font-sans overflow-hidden">
        {gameState === 'disclaimer' && (
             <Modal
                title="欢迎来到打小人!"
                onClose={() => setGameState('upload')}
             >
                <p>本游戏灵感源于传统习俗，仅为娱乐和释放压力而设计。</p>
                <p className="mt-2">游戏中不会对任何真实的小人（或人物）造成伤害！请记住，笑是最好的良药。</p>
             </Modal>
        )}
        <header className="py-4 px-6 flex justify-between items-center bg-black/20 shadow-lg flex-shrink-0 z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-300 tracking-wider">打小人! Poppet Punch!</h1>
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-lg shadow-md">
                💰 {coins} 金币
            </div>
        </header>
        <main className="relative overflow-hidden h-full">
            {error && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 bg-red-800/90 border border-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg z-30">
                    {error}
                </div>
            )}
            {renderContent()}
        </main>
    </div>
  );
}

export default App;