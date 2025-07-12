if (typeof global === 'undefined') {
  (window as any).global = window;
}

if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    isBuffer: () => false,
  };
} 