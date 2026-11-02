import { createRoot } from 'react-dom/client';
// Only two weights (was four): saves ~145 KB of font downloads on mobile.
import '@fontsource/hind-siliguri/400.css';
import '@fontsource/hind-siliguri/700.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
