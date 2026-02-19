/**
 * DrinkSizeModal.jsx — Modale de sélection de la taille d'une boisson
 *
 * Permet à l'utilisateur de :
 *  - Choisir la taille : 30cl (prix normal) ou 50cl (+0,50€)
 *  - Sélectionner une quantité (minimum 1)
 *
 * La modale peut être fermée avec le bouton ✕ ou la touche Echap.
 */
import { useEffect, useState } from 'react'
import '../styles/MenuChoiceModal.css'
import '../styles/Layout.css'

const DrinkSizeModal = ({ product, onChoose, onClose }) => {
  /* ── États locaux ── */
  const [selectedSize, setSelectedSize] = useState(null) // '30cl' ou '50cl'
  const [quantity, setQuantity] = useState(1)             // Quantité (minimum 1)

  /* ── Fermeture de la modale avec la touche Echap ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey) // nettoyage
  }, [onClose])

  /* ── Guard : si aucun produit transmis, ne rien afficher ── */
  if (!product) return null

  /* ── Sélection de la taille ── */
  const handleSizeSelect = (size) => {
    setSelectedSize(size)
  }

  /* ── Modification de la quantité (delta = +1 ou -1) ── */
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta)) // minimum 1
  }

  /* ── Validation : transmet la taille et la quantité au composant parent ── */
  const handleAddToCart = () => {
    if (!selectedSize) return // empêche la validation sans taille sélectionnée
    onChoose({ size: selectedSize, quantity })
  }

  return (
    /* Fond semi-transparent (overlay) — rôle "dialog" pour l'accessibilité */
    <div className="mc-overlay" role="dialog" aria-modal="true" aria-labelledby="drink-size-title">
      {/* Carte blanche centrale */}
      <div className="content-layout">
        {/* Bouton de fermeture */}
        <button className="mc-close" aria-label="Fermer la modale" onClick={onClose}>×</button>

        <h2 id="drink-size-title" className="mc-title">Une petite soif ?</h2>
        <p className="mc-product">Choisissez la taille de votre boisson, +0,50€ pour le format 50Cl</p>

        {/* ── Sélection de la taille ── */}
        <div className="mc-actions">
          {/* Option 30cl */}
          <button
            className={`mc-btn drink-size-btn ${selectedSize === '30cl' ? 'selected' : ''}`}
            onClick={() => handleSizeSelect('30cl')}
          >
            <img
              src={product.image.startsWith('/') ? `/img${product.image}` : product.image}
              alt={product.nom}
              className="drink-size-30"
            />
            <span>30Cl</span>
          </button>

          {/* Option 50cl (prix majoré de +0,50€) */}
          <button
            className={`mc-btn secondary drink-size-btn ${selectedSize === '50cl' ? 'selected' : ''}`}
            onClick={() => handleSizeSelect('50cl')}
          >
            <img
              src={product.image.startsWith('/') ? `/img${product.image}` : product.image}
              alt={product.nom}
              className="drink-size-50"
            />
            <span>50Cl</span>
          </button>
        </div>

        {/* ── Sélecteur de quantité ── */}
        <div className="quantity-selector">
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(-1)}
            aria-label="Diminuer la quantité"
          >
            -
          </button>
          <span className="quantity-display" aria-live="polite">{quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => handleQuantityChange(1)}
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>

        {/* ── Actions : annuler ou ajouter au panier ── */}
        <div className="mc-bottom-actions">
          <button className="mc-cancel" onClick={onClose}>
            Annuler
          </button>
          {/* Désactivé tant qu'aucune taille n'est sélectionnée */}
          <button
            className="mc-validate"
            onClick={handleAddToCart}
            disabled={!selectedSize}
          >
            Ajouter à la commande
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrinkSizeModal
