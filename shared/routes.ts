export function encodeLetter(letter: import('./schema').Letter): string {
  const json = JSON.stringify(letter);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeLetter(encoded: string): import('./schema').Letter | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
