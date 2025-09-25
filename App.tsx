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
      setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };
  
  const processUploadedImage = useCallback(async () => {
    if (!userImage) return;

    if (gameState === 'moderating') {
        setIsLoading(true);
        setLoadingMessage('AI is checking your image...');
        try {
            const isSafe = await moderateImage(userImage);
            if (isSafe) {
                setGameState('detectingFace');
            } else {
                setError("This image was flagged as inappropriate. Please upload another one.");
                handleRestart();
            }
        } catch (e) {
            console.error(e);
            setError("Could not verify the image. Please try again.");
            handleRestart();
        } finally {
            setIsLoading(false);
        }
    } else if (gameState === 'detectingFace') {
        setIsLoading(true);
        setLoadingMessage('AI is detecting a face...');
        try {
            const bounds = await detectFace(userImage);
            if (bounds) {
                setFaceBounds(bounds);
                setGameState('playing');
            } else {
                setError("Could not detect a face in this image. Please use a clearer picture of a face.");
                handleRestart();
            }
        } catch (e) {
            console.error(e);
            setError("Face detection failed. Please try again.");
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
        setError("Not enough coins to use this tool!");
        setTimeout(() => setError(null), 3000);
        return;
    }

    // Special handling for client-side tools
    if (tool.name === 'Hand Slap') {
        setActiveTool(tool);
        return;
    }

    setActiveTool(tool);
    setIsLoading(true);
    setLoadingMessage(`Applying ${tool.name}...`);
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
          setError("This effect was blocked by safety filters. Please try a different tool.");
      } else {
          setError("The AI failed to apply the effect. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setActiveTool(null);
    }
  };
  
  const handleImageClick = (coords: ClickCoords) => {
    if (gameState !== 'playing' || activeTool?.name !== 'Hand Slap' || !faceBounds) return;

    const tool = TOOLS.find(t => t.name === 'Hand Slap');
    if (!tool || coins < tool.cost) {
        setError(tool ? "Not enough coins!" : "Tool not found");
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
                title="Welcome to Poppet Punch!"
                onClose={() => setGameState('upload')}
             >
                <p>This game is inspired by a traditional custom and is intended for playful fun and stress relief only.</p>
                <p className="mt-2">No real 小人 (or people) are harmed! Remember, laughter is the best medicine.</p>
             </Modal>
        )}
        <header className="py-4 px-6 flex justify-between items-center bg-black/20 shadow-lg flex-shrink-0 z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-300 tracking-wider">打小人! Poppet Punch!</h1>
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-lg shadow-md">
                💰 {coins} Coins
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