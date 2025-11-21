export const loadWebFont = (fontFamily: string) => {
  if (!fontFamily) return;
  const linkId = `font-${fontFamily.replace(/\s+/g, '-')}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};
