import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function ImageLightbox({ images, startIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={images[currentIndex]} 
            target="_blank" 
            rel="noreferrer" 
            download 
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={20} />
          </a>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden" onClick={onClose}>
        <img 
          src={images[currentIndex]} 
          alt={`Gallery item ${currentIndex}`} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white hover:bg-indigo-500/40 hover:scale-110 transition-all border border-white/10 backdrop-blur-md hidden md:flex"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white hover:bg-indigo-500/40 hover:scale-110 transition-all border border-white/10 backdrop-blur-md hidden md:flex"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Thumbnails (Mobile-friendly) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/40 rounded-2xl backdrop-blur-md border border-white/5 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${idx === currentIndex ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30" : "border-transparent opacity-40 hover:opacity-100"}`}
          >
            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  );
}
