import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './game/state/GameProvider.jsx'
import { SpriteManifestProvider } from './assets/SpriteManifestProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpriteManifestProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </SpriteManifestProvider>
  </StrictMode>,
)
