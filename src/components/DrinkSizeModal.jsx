import React, { useEffect, useState } from 'react'
import '../styles/MenuChoiceModal.css'
import '../styles/Layout.css'

const DrinkSizeModal = ({ product, onChoose, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
  }

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    if (!selectedSize) return
    onChoose({ size: selectedSize, quantity })
  }

  return (
    <div className="mc-overlay" role="dialog" aria-modal="true" aria-labelledby="drink-size-title">
      <div className="content-layout">
        <button className="mc-close" aria-label="Fermer" onClick={onClose}>×</button>
        <h2 id="drink-size-title" className="mc-title">Une petite soif ?</h2>
        <p className="mc-product">Choissisez la taille de votre boisson, +0.50€ pour le format 50Cl</p>
        <div className="mc-actions">
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
        
        <div className="quantity-selector">
          <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
          <span className="quantity-display">{quantity}</span>
          <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
        </div>

        <div className="mc-bottom-actions">
          <button 
            className="mc-cancel" 
            onClick={onClose}
          >
            Annuler
          </button>
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
