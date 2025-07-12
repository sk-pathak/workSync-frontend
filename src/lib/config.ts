export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/',
  },
  websocket: {
    baseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080',
  },
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
};