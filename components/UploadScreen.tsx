
import React, { useRef } from 'react';

interface UploadScreenProps {
  onImageUpload: (file: File) => void;
  error: string | null;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

const UploadScreen: React.FC<UploadScreenProps> = ({ onImageUpload, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCameraClick = () => {
    // In a real app, this would trigger the camera API.
    // For this environment, we'll just prompt for an upload.
    alert("Camera functionality is not available in this environment. Please upload a file instead.");
    handleUploadClick();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto pt-10">
      <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">上传你的小人</h2>
      <p className="mt-4 text-xl text-red-200">上传照片或使用摄像头拍摄，开始打小人吧!</p>
      
      {error && <p className="mt-4 text-lg bg-red-800/80 border border-red-500 text-white font-bold py-2 px-4 rounded-lg">{error}</p>}

      <div className="mt-8 space-y-4 w-full max-w-sm">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          onClick={handleUploadClick}
          className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black text-xl font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          <UploadIcon />
          上传照片
        </button>
        <button
          onClick={handleCameraClick}
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          <CameraIcon />
          使用摄像头
        </button>
      </div>

      <div className="mt-8 bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg flex items-center">
        <CheckIcon />
        <span>基础模式已启用 - 无需AI检测，直接开始游戏!</span>
      </div>
    </div>
  );
};

export default UploadScreen;
