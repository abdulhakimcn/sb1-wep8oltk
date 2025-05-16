import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n';
import './index.css';
import './styles/auth-ui.css'; // Import custom auth UI styles

console.log('main.tsx executing'); // Debug log

// Add a global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add a promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Simple div to show the app is loading
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">Loading Dr.Zone AI...</div>';
}

// Render the app
try {
  console.log('Creating root and rendering app'); // Debug log
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered successfully'); // Debug log
} catch (error) {
  console.error('Error rendering app:', error);
  // Show error on screen
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #e53e3e; margin-bottom: 20px;">Error Loading Application</h1>
        <p style="margin-bottom: 20px;">There was an error loading the application. Please check the console for details.</p>
        <pre style="background: #f7fafc; padding: 15px; border-radius: 5px; overflow: auto; max-width: 100%;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0073b6; color: white; border: none; border-radius: 5px; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}