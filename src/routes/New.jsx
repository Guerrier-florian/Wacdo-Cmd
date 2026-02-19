/**
 * Page principale de commande (route /new)
 *
 * Affiche le catalogue de produits (colonne gauche ~70%)
 * et le récapitulatif de commande (colonne droite ~30%).
 *
 * Sur mobile (<540px), la colonne récapitulatif est masquée
 * et accessible via un bouton panier flottant.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import Notfound from './Notfound'
import '../styles/New.css'
import CategorySlider from '../components/CategorySlider'
import ProductList from '../components/ProductList'
import Cart from '../components/Cart'

const New = () => {
  /* ── Lecture du mode de commande depuis le store Redux ── */
  const mode = useSelector(state => state.shoppingCart?.mode)

  /* ── Nombre total d'articles dans le panier (pour le badge du bouton mobile) ── */
  const cartCount = useSelector(state =>
    state.shoppingCart.cart.reduce((acc, it) => acc + it.quantity, 0)
  )

  /* ── États locaux ── */
  // Catégorie sélectionnée par défaut : "menus" pour afficher des produits dès le chargement
  const [selectedCategory, setSelectedCategory] = useState({
    id: 1,
    title: 'menus',
    image: '/categories/menus.png',
  })

  // Contrôle l'affichage du récapitulatif en overlay sur mobile
  // IMPORTANT : déclaré AVANT le return conditionnel pour respecter les Rules of Hooks React
  // (les hooks ne doivent jamais être appelés après un return conditionnel)
  const [showSummary, setShowSummary] = useState(false)

  /* ── Guard : si aucun mode n'est sélectionné, rediriger vers la page d'erreur ── */
  if (!mode) {
    return <Notfound />
  }

  /* ── Handler : changement de catégorie via le slider ── */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="new-page">
      {/* Colonne gauche : slider de catégories + grille de produits */}
      <main className="new-left">
        <div className="slider-container">
          <CategorySlider onSelect={handleCategorySelect} activeCategory={selectedCategory} />
        </div>
        <div className="centered">
          <ProductList category={selectedCategory} />
        </div>
      </main>

      {/*
        Colonne droite : récapitulatif de commande
        - Desktop (>540px) : visible en permanence à droite (30% de largeur)
        - Mobile (<540px)  : overlay activé par le bouton panier flottant
        La classe CSS "overlay open" déclenche l'affichage en panneau latéral
      */}
      <aside className={`new-right ${showSummary ? 'overlay open' : 'overlay'}`}>
        <div className="centered">
          {/* Bouton de fermeture — visible uniquement sur mobile (<540px) */}
          <button
            className="summary-close"
            onClick={() => setShowSummary(false)}
            aria-label="Fermer le récapitulatif"
          />
          <Cart />
        </div>
      </aside>

      {/* Bouton panier flottant — visible uniquement sur mobile (<540px) */}
      <button
        className="cart-toggle"
        onClick={() => setShowSummary(true)}
        aria-label={`Ouvrir le récapitulatif de commande (${cartCount} article${cartCount > 1 ? 's' : ''})`}
      >
        {/* Badge rouge indiquant le nombre d'articles dans le panier */}
        {cartCount > 0 && (
          <span className="cart-badge" aria-hidden="true">
            {cartCount}
          </span>
        )}
        {/* Icône panier SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6 6h15l-1.5 9h-12L6 6z"
            stroke="#000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="20" r="1" fill="#000" />
          <circle cx="18" cy="20" r="1" fill="#000" />
        </svg>
      </button>
    </div>
  )
}

export default New
