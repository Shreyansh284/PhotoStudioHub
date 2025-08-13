import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PublicGallery } from './components/gallery/PublicGallery'
import './index.css'

const path = window.location.pathname;
const isPublicGallery = path.startsWith('/gallery');
createRoot(document.getElementById("root")!).render(isPublicGallery ? <PublicGallery /> : <App />);
