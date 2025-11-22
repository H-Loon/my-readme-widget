/**
 * useFonts.ts
 * 
 * This hook manages the list of available fonts for the editor.
 * It fetches the list of Google Fonts from an API so the user can choose from thousands of fonts.
 */
import { useState, useEffect } from 'react';

export function useFonts() {
  // Whether the font selection dropdown is currently open.
  const [showFontList, setShowFontList] = useState(false);
  
  // The text typed into the font search box.
  const [fontSearch, setFontSearch] = useState('');
  
  // The list of font family names fetched from the API.
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);

  // Fetch the font list when the component mounts.
  useEffect(() => {
    // We use the fontsource API to get a clean list of Google Fonts.
    fetch('https://api.fontsource.org/v1/fonts')
      .then(res => res.json())
      .then(data => {
        // Extract just the family names (e.g., "Roboto", "Open Sans").
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
