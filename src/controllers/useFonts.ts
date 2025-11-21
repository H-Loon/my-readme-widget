import { useState, useEffect } from 'react';

export function useFonts() {
  const [showFontList, setShowFontList] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);

  useEffect(() => {
    fetch('https://api.fontsource.org/v1/fonts')
      .then(res => res.json())
      .then(data => {
        const fonts = data.map((f: any) => f.family);
        setGoogleFonts(fonts);
      })
      .catch(err => console.error('Failed to load fonts', err));
  }, []);

  return {
    showFontList,
    setShowFontList,
    fontSearch,
    setFontSearch,
    googleFonts
  };
}
