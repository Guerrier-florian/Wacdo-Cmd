/**
 * MenuChoiceModal.jsx — Modale de personnalisation d'un menu (3 étapes)
 *
 * Étape 1 : Choix du type de menu (Menu Best Of ou Menu Maxi Best Of)
 * Étape 2 : Choix de l'accompagnement (Frites ou Potatoes)
 * Étape 3 : Choix de la boisson (slider de sélection)
 *
 * La modale peut être fermée avec le bouton ✕ ou la touche Echap.
 */
import { useEffect, useState } from 'react'
import { fetchCategoryData } from '../api/config'
import '../styles/MenuChoiceModal.css'
import '../styles/Layout.css'

const MenuChoiceModal = ({ product, onChoose, onClose }) => {
  /* ── États locaux ── */
  const [step, setStep] = useState(1)                   // Étape courante (1, 2 ou 3)
  const [selectedMenu, setSelectedMenu] = useState(null) // Type de menu sélectionné
  const [selectedSide, setSelectedSide] = useState(null) // Accompagnement sélectionné
  const [drinks, setDrinks] = useState([])               // Liste des boissons disponibles
  const [currentDrinkIndex, setCurrentDrinkIndex] = useState(0) // Index de la boisson affichée

  /* ── Fermeture de la modale avec la touche Echap ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey) // nettoyage
  }, [onClose])

  /* ── Chargement des boissons uniquement à l'étape 3 (chargement différé) ── */
  useEffect(() => {
    if (step === 3) {
      fetchCategoryData('boissons')
        .then(data => {
          setDrinks(Array.isArray(data) ? data : [])
        })
        .catch(() => setDrinks([]))
    }
  }, [step])

  /* ── Guard : si aucun produit transmis, ne rien afficher ── */
  if (!product) return null

  /* ── Étape 1 → 2 : sélection du type de menu ── */
  const handleMenuSelect = (menuType) => {
    setSelectedMenu(menuType)
    setStep(2)
  }

  /* ── Étape 2 → 3 : sélection de l'accompagnement ── */
  const handleSideSelect = (sideType) => {
    setSelectedSide(sideType)
    setStep(3)
  }

  /* ── Navigation dans le slider de boissons (bouton gauche) ── */
  const handlePrevDrink = () => {
    setCurrentDrinkIndex(prev => (prev > 0 ? prev - 1 : drinks.length - 1))
  }

  /* ── Navigation dans le slider de boissons (bouton droit) ── */
  const handleNextDrink = () => {
    setCurrentDrinkIndex(prev => (prev < drinks.length - 1 ? prev + 1 : 0))
  }

  /* ── Étape 3 : confirmation du menu complet → appel du callback parent ── */
  const handleDrinkSelect = () => {
    const selectedDrink = drinks[currentDrinkIndex]
    onChoose({
      menuType: selectedMenu,
      side: selectedSide,
      drink: selectedDrink.nom,
    })
  }

  return (
    /* Fond semi-transparent (overlay) — rôle "dialog" pour l'accessibilité */
    <div className="mc-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-choice-title">
      {/* Carte blanche centrale */}
      <div className="content-layout">
        {/* Bouton de fermeture */}
        <button className="mc-close" aria-label="Fermer la modale" onClick={onClose}>×</button>

        {/* ── Étape 1 : Choix du type de menu ── */}
        {step === 1 && (
          <>
            <h2 id="menu-choice-title" className="mc-title">Une grosse faim ?</h2>
            <p className="mc-product">
              Le menu maxi Best Of comprend un sandwich, une grande frite et une boisson 50 cl.
            </p>
            <div className="mc-actions">
              {/* Option : Menu Maxi Best Of (grande taille) */}
              <button className="mc-btn" onClick={() => handleMenuSelect('menu maxi best of')}>
                <img src="/img/images/illustration-maxi-best-of.png" alt="Menu Maxi Best Of" />
                <span>Menu Maxi Best Of</span>
              </button>
              {/* Option : Menu Best Of (taille standard) */}
              <button className="mc-btn secondary" onClick={() => handleMenuSelect('menu best of')}>
                <img src="/img/images/illustration-best-of.png" alt="Menu Best Of" />
                <span>Menu Best Of</span>
              </button>
            </div>
          </>
        )}

        {/* ── Étape 2 : Choix de l'accompagnement ── */}
        {step === 2 && (
          <>
            <h2 className="mc-title">Choisissez Votre Accompagnement</h2>
            <p className="mc-product">Frites, potatoes, la pomme de terre dans tous ses états</p>
            <div className="mc-actions">
              {/* Option : Frites */}
              <button className="mc-btn" onClick={() => handleSideSelect('frites')}>
                <img
                  src="https://res.cloudinary.com/djnmszucm/image/upload/MOYENNE_FRITE_fkrl2g.png"
                  alt="Frites"
                />
                <span>Frites</span>
              </button>
              {/* Option : Potatoes */}
              <button className="mc-btn secondary" onClick={() => handleSideSelect('potatoes')}>
                <img
                  src="https://res.cloudinary.com/djnmszucm/image/upload/GRANDE_POTATOES_vemovw.png"
                  alt="Potatoes"
                />
                <span>Potatoes</span>
              </button>
            </div>
          </>
        )}

        {/* ── Étape 3 : Choix de la boisson (slider) ── */}
        {step === 3 && drinks.length > 0 && (
          <>
            <h2 className="mc-title">Choisissez votre boisson</h2>
            <p className="mc-product">Faites votre choix parmi notre sélection</p>

            {/* Slider de boissons avec flèches gauche/droite */}
            <div className="mc-drink-slider">
              <button
                className="mc-arrow left"
                onClick={handlePrevDrink}
                aria-label="Boisson précédente"
              >
                <img src="/img/images/fleche-slider.png" alt="" aria-hidden="true" />
              </button>

              {/* Affichage de la boisson courante */}
              <div className="mc-drink-display">
                <img
                  src={
                    drinks[currentDrinkIndex].image.startsWith('/')
                      ? `/img${drinks[currentDrinkIndex].image}`
                      : drinks[currentDrinkIndex].image
                  }
                  alt={drinks[currentDrinkIndex].nom}
                />
                <h3>{drinks[currentDrinkIndex].nom}</h3>
              </div>

              <button
                className="mc-arrow right"
                onClick={handleNextDrink}
                aria-label="Boisson suivante"
              >
                <img src="/img/images/fleche-slider.png" alt="" aria-hidden="true" />
              </button>
            </div>

            {/* Bouton de validation final : ajoute le menu complet au panier */}
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
