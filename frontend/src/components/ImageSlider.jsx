import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { API_URL } from '../utils/api';

export default function ImageSlider({ images, alt, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (imagePath) => {
    return imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-surface-dark to-border flex items-center justify-center ${className}`}>
        <svg className="w-16 h-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img
        src={getImageUrl(images[currentIndex])}
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
        loading="lazy"
      />

      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={prevSlide}
              className="p-1.5 rounded-full bg-highlight text-white hover:bg-highlight/80 transition-all shadow-lg transform hover:scale-110"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="p-1.5 rounded-full bg-highlight text-white hover:bg-highlight/80 transition-all shadow-lg transform hover:scale-110"
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          {/* Bottom Gradient for dots visibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${
                  index === currentIndex ? 'w-4 h-1.5 opacity-100' : 'w-1.5 h-1.5 opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
