import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Notfound from './Notfound'
import '../styles/New.css'
import CategorySlider from '../components/CategorySlider'
import ProductList from '../components/ProductList'
import Cart from '../components/Cart'

const New = () => {
  const mode = useSelector(state => state.shoppingCart?.mode)
  // Default selection: "menus" so products show on first load
  const [selectedCategory, setSelectedCategory] = useState({ id: 1, title: 'menus', image: '/categories/menus.png' })

  if (!mode) {
    return <Notfound />
  }
  const [showSummary, setShowSummary] = useState(false)

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="new-page">
      <main className="new-left">
        <div className="slider-container">
          <CategorySlider onSelect={handleCategorySelect} activeCategory={selectedCategory} />
        </div>
        <div className="centered">
          <ProductList category={selectedCategory} />
        </div>
      </main>

      {/* summary column: in desktop it's visible; on small screens it's shown as overlay when showSummary=true */}
      <aside className={`new-right ${showSummary ? 'overlay open' : 'overlay'}`}>
        <div className="centered">
          {/* Bouton de fermeture spécifique mobile (<540px) */}
          <button className="summary-close" onClick={() => setShowSummary(false)} aria-label="Fermer le récapitulatif"/>
          <Cart />
        </div>
      </aside>

      {/* cart toggle button visible only on small screens (<540px) */}
      <button className="cart-toggle" onClick={() => setShowSummary(true)} aria-label="Ouvrir le récapitulatif de commande">
        {/* simple cart SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M6 6h15l-1.5 9h-12L6 6z" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="20" r="1" fill="#000"/>
          <circle cx="18" cy="20" r="1" fill="#000"/>
        </svg>
      </button>
    </div>
  )
}

export default New