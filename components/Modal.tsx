
import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-lg shadow-2xl p-6 border border-red-600 max-w-md w-full">
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">{title}</h2>
        <div className="text-red-200 space-y-2">{children}</div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Got it, Let's Punch!
        </button>
      </div>
    </div>
  );
};

export default Modal;
