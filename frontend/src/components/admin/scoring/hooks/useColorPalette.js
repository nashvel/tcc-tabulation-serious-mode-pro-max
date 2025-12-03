import { useState, useEffect } from 'react';
import { loadColors, saveColors } from 'nachtify';

export const useColorPalette = () => {
  const [colorScrollIndex, setColorScrollIndex] = useState(0);
  const [scoreColors, setScoreColors] = useState(() => loadColors());

  // Save colors to localStorage whenever they change
  useEffect(() => {
    saveColors(scoreColors);
  }, [scoreColors]);

  return {
    colorScrollIndex,
    setColorScrollIndex,
    scoreColors,
    setScoreColors
  };
};
