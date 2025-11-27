import React, { useEffect, useState } from 'react'
import { fetchCategoryData } from '../api/config'
import '../styles/MenuChoiceModal.css'
import '../styles/Layout.css'

const MenuChoiceModal = ({ product, onChoose, onClose }) => {
  const [step, setStep] = useState(1)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [selectedSide, setSelectedSide] = useState(null)
  const [drinks, setDrinks] = useState([])
  const [currentDrinkIndex, setCurrentDrinkIndex] = useState(0)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    // Load drinks when moving to step 3
    if (step === 3) {
      fetchCategoryData('boissons')
        .then(data => {
          // Filtrer uniquement les boissons disponibles
          const availableDrinks = Array.isArray(data) 
            ? data.filter(drink => drink.disponible === true)
            : [];
          setDrinks(availableDrinks);
        })
        .catch(err => console.error('Failed to load drinks', err))
    }
  }, [step])

  if (!product) return null

  const handleMenuSelect = (menuType) => {
    setSelectedMenu(menuType)
    setStep(2)
  }

  const handleSideSelect = (sideType) => {
    setSelectedSide(sideType)
    setStep(3)
  }

  const handlePrevDrink = () => {
    setCurrentDrinkIndex(prev => (prev > 0 ? prev - 1 : drinks.length - 1))
  }

  const handleNextDrink = () => {
    setCurrentDrinkIndex(prev => (prev < drinks.length - 1 ? prev + 1 : 0))
  }

  const handleDrinkSelect = () => {
    const selectedDrink = drinks[currentDrinkIndex]
    onChoose({
      menuType: selectedMenu,
      side: selectedSide,
      drink: selectedDrink.nom
    })
  }

  return (
    <div className="mc-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-choice-title">
      <div className="content-layout">
        <button className="mc-close" aria-label="Fermer" onClick={onClose}>×</button>
        
        {step === 1 && (
          <>
            <h2 id="menu-choice-title" className="mc-title">Une grosse faim ?</h2>
            <p className="mc-product">Le menu maxi Best Of comprend un sandwich, une grande frite et une boisson 50 cl.</p>
            <div className="mc-actions">
              <button className="mc-btn" onClick={() => handleMenuSelect('menu maxi best of')}>
                <img src="/img/images/illustration-maxi-best-of.png" alt="Menu Maxi Best Of" />
                <span>Menu Maxi Best Of</span>
              </button>
              <button className="mc-btn secondary" onClick={() => handleMenuSelect('menu best of')}>
                <img src="/img/images/illustration-best-of.png" alt="Menu Best Of" />
                <span>Menu Best Of</span>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="mc-title">Choisissez votre accompagnement</h2>
            <p className="mc-product">Frites, potatoes, la pomme de terre dans tous ses états</p>
            <div className="mc-actions">
              <button className="mc-btn" onClick={() => handleSideSelect('frites')}>
                <img src="/img/frites/MOYENNE_FRITE.png" alt="Frites" />
                <span>Frites</span>
              </button>
              <button className="mc-btn secondary" onClick={() => handleSideSelect('potatoes')}>
                <img src="/img/frites/GRANDE_POTATOES.png" alt="Potatoes" />
                <span>Potatoes</span>
              </button>
            </div>
          </>
        )}

        {step === 3 && drinks.length > 0 && (
          <>
            <h2 className="mc-title">Choisissez votre boisson</h2>
            <p className="mc-product">Faites votre choix parmi notre sélection</p>
            <div className="mc-drink-slider">
              <button className="mc-arrow left" onClick={handlePrevDrink} aria-label="Boisson précédente">
                <img src="/img/images/fleche-slider.png" alt="" />
              </button>
              <div className="mc-drink-display">
                <img src={`/img${drinks[currentDrinkIndex].image}`} alt={drinks[currentDrinkIndex].nom} />
                <h3>{drinks[currentDrinkIndex].nom}</h3>
              </div>
              <button className="mc-arrow right" onClick={handleNextDrink} aria-label="Boisson suivante">
                <img src="/img/images/fleche-slider.png" alt="" />
              </button>
            </div>
            <button className="mc-validate" onClick={handleDrinkSelect}>
              Ajouter le menu à ma commande
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default MenuChoiceModal
