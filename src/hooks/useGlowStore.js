import { useState, useCallback } from 'react';

const DEFAULT_BRAND = {
  primary: '#c084fc',
  secondary: '#a855f7',
  accent: '#f0abfc',
  background: '#12101a',
  text: '#f1e8ff',
  fontStyle: 'modern',
  logo: null,
  logoName: '',
};

export function useGlowStore() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [inputData, setInputData] = useState(null);
  const [output, setOutput] = useState(null);
  // Mutable slide overrides — allows user to reassign images per slide without regenerating
  const [slideOverrides, setSlideOverrides] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('post');

  const updateBrand = useCallback((updates) => {
    setBrand(prev => ({ ...prev, ...updates }));
  }, []);

  // Reassign which image appears on a given carousel slide
  const reassignSlideImage = useCallback((slideIndex, imageIndex) => {
    setSlideOverrides(prev => ({
      ...prev,
      [slideIndex]: {
        ...prev[slideIndex],
        layout: imageIndex != null ? 'image' : 'headline',
        imageIndex: imageIndex,
      },
    }));
  }, []);

  // Remove an extracted image (and clear any slide assignments pointing to it)
  const removeExtractedImage = useCallback((imgIndex) => {
    setInputData(prev => {
      if (!prev?.images) return prev;
      const newImages = prev.images.filter((_, i) => i !== imgIndex);
      return { ...prev, images: newImages };
    });
    // Clear overrides that referenced this image index
    setSlideOverrides(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k].imageIndex === imgIndex) {
          delete updated[k];
        } else if (updated[k].imageIndex > imgIndex) {
          updated[k] = { ...updated[k], imageIndex: updated[k].imageIndex - 1 };
        }
      });
      return updated;
    });
  }, []);

  const addExtractedImage = useCallback((imgObj) => {
    setInputData(prev => {
      if (!prev) return prev;
      return { ...prev, images: [...(prev.images || []), imgObj] };
    });
  }, []);

  // Merge AI-assigned slide data with user overrides
  const getMergedSlides = useCallback(() => {
    if (!output?.carousel) return [];
    return output.carousel.map((slide, i) => ({
      ...slide,
      ...(slideOverrides[i] || {}),
    }));
  }, [output, slideOverrides]);

  const reset = useCallback(() => {
    setOutput(null);
    setError(null);
    setInputData(null);
    setSlideOverrides({});
  }, []);

  return {
    brand,
    updateBrand,
    inputData,
    setInputData,
    output,
    setOutput,
    slideOverrides,
    reassignSlideImage,
    removeExtractedImage,
    addExtractedImage,
    getMergedSlides,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    activeTab,
    setActiveTab,
    reset,
  };
}
