/**
 * main.jsx — Point d'entrée de l'application React
 *
 * Ce fichier est le premier exécuté par Vite lors du démarrage.
 * Il :
 *  1. Monte le composant App dans la div#root du fichier index.html
 *  2. Active le mode StrictMode de React (double rendu en développement
 *     pour détecter les effets de bord et les dépréciations)
 *  3. Encapsule l'application dans le Provider Redux pour que tous
 *     les composants aient accès au store global (panier, mode, etc.)
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp } from 'antd' // Requis en Ant Design v5 pour que message/notification fonctionnent avec le contexte
import './styles/index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './slices/index.js'

createRoot(document.getElementById('root')).render(
  /* StrictMode : active des avertissements supplémentaires en développement */
  <StrictMode>
    {/* Provider Redux : rend le store accessible à tous les composants enfants */}
    <Provider store={store}>
      {/*
        AntApp (Ant Design v5) : fournit le contexte nécessaire aux méthodes statiques
        message.success(), notification.open(), etc.
        Sans ce wrapper, les notifications peuvent ne pas s'afficher correctement.
      */}
      <AntApp>
        <App />
      </AntApp>
    </Provider>
  </StrictMode>,
)
