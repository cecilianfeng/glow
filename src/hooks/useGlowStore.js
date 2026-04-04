import { useState, useCallback } from 'react';

const DEFAULT_BRAND = {
  primary: '#c084fc',
  secondary: '#a855f7',
  accent: '#f0abfc',
  background: '#12101a',
  text: '#f1e8ff',
  fontStyle: 'modern', // modern | serif | minimal
  logo: null,        // base64 data URL
  logoName: '',
};

export function useGlowStore() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [inputData, setInputData] = useState(null);
  const [output, setOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('post'); // post | cards | cover | carousel

  const updateBrand = useCallback((updates) => {
    setBrand(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setOutput(null);
    setError(null);
    setInputData(null);
  }, []);

  return {
    brand,
    updateBrand,
    inputData,
    setInputData,
    output,
    setOutput,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    activeTab,
    setActiveTab,
    reset,
  };
}
