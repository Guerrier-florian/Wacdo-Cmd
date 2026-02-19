/**
 * App.jsx — Composant racine de l'application
 *
 * Configure le routage client-side avec React Router v7.
 * Définit les 5 routes de l'application :
 *
 *  /        → Home    : choix du mode (sur place / à emporter)
 *  /new     → New     : catalogue de produits + panier
 *  /onoff   → OnOff   : saisie du numéro de chevalet (mode sur place uniquement)
 *  /thanks  → Thanks  : confirmation après validation de la commande
 *  *        → Notfound: page d'erreur pour toute URL non reconnue
 */
import { BrowserRouter, Route, Routes } from 'react-router'
import Notfound from './routes/Notfound'
import New from './routes/New'
import Home from './routes/Home'
import OnOff from './routes/OnOff'
import Thanks from './routes/Thanks'
import './styles/App.css'

const App = () => {
  return (
    /* BrowserRouter active le routage basé sur l'historique HTML5 */
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil : choix sur place / à emporter */}
        <Route path='/' element={<Home />} />

        {/* Page de commande : catalogue + récapitulatif */}
        <Route path='/new' element={<New />} />

        {/* Page de saisie du numéro de chevalet (sur place) */}
        <Route path='/onoff' element={<OnOff />} />

        {/* Page de confirmation après paiement/validation */}
        <Route path='/thanks' element={<Thanks />} />

        {/* Page d'erreur : toute URL non définie ci-dessus */}
        <Route path='*' element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
