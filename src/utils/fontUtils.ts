/**
 * fontUtils.ts
 * 
 * Utilities for handling web fonts.
 */

/**
 * Dynamically loads a Google Font into the document.
 * This allows users to see the font in the editor without us having to pre-load hundreds of fonts.
 * 
 * @param fontFamily - The name of the font family (e.g., "Roboto", "Open Sans").
 */
export const loadWebFont = (fontFamily: string) => {
  // If no font is specified, do nothing.
  if (!fontFamily) return;

  // Create a unique ID for the link element to prevent loading the same font twice.
  // We replace spaces with dashes for the ID (e.g., "Open Sans" -> "font-Open-Sans").
  const linkId = `font-${fontFamily.replace(/\s+/g, '-')}`;

  // Check if this font is already loaded.
  if (!document.getElementById(linkId)) {
    // Create a new <link> element.
    const link = document.createElement('link');
    link.id = linkId;
    
    // Construct the Google Fonts URL.
    // We replace spaces with '+' for the URL (e.g., "Open Sans" -> "Open+Sans").
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
    link.rel = 'stylesheet';
    
    // Append the link to the document head to start loading the font.
    document.head.appendChild(link);
  }
};
