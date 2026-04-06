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
  name: '',
  handle: '',
};

export function useGlowStore() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [identityMode, setIdentityMode] = useState('author'); // 'author' | 'recommender'
  const [inputData, setInputData] = useState(null);
  const [output, setOutput] = useState(null);
  const [slideOverrides, setSlideOverrides] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('post');

  const updateBrand = useCallback((updates) => {
    setBrand(prev => ({ ...prev, ...updates }));
  }, []);

  const reassignSlideImage = useCallback((slideIndex, imageIndex) => {
    setSlideOverrides(prev => ({
      ...prev,
      [slideIndex]: {
        ...prev[slideIndex],
        layout: imageIndex != null ? 'image' : 'insight',
        imageIndex,
      },
    }));
  }, []);

  const removeExtractedImage = useCallback((imgIndex) => {
    setInputData(prev => {
      if (!prev?.images) return prev;
      return { ...prev, images: prev.images.filter((_, i) => i !== imgIndex) };
    });
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
    identityMode,
    setIdentityMode,
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
