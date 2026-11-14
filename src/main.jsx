import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './game/state/GameProvider.jsx'
import { SpriteManifestProvider } from './assets/SpriteManifestProvider.jsx'
import Gallery from './components/Gallery.jsx'

const showGallery = new URLSearchParams(window.location.search).has('gallery')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpriteManifestProvider>
      {showGallery ? (
        <Gallery />
      ) : (
        <GameProvider>
          <App />
        </GameProvider>
      )}
    </SpriteManifestProvider>
  </StrictMode>,
)
