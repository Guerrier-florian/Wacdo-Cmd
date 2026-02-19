/**
 * CategorySlider.jsx — Slider horizontal des catégories de produits
 *
 * Affiche les catégories sous forme de boutons défilables.
 * Le nombre de catégories visibles s'adapte dynamiquement à la largeur
 * du conteneur grâce à un ResizeObserver.
 *
 * Navigation : flèches gauche/droite (cachées si toutes les catégories sont visibles).
 * La catégorie active reste toujours visible dans la fenêtre de défilement.
 */
import { useEffect, useRef, useState } from 'react'
import { fetchCategories } from '../api/config'
import '../styles/CategorySlider.css'

const CategorySlider = ({ onSelect, activeCategory }) => {
  /* ── États locaux ── */
  const [categories, setCategories] = useState([])     // Liste complète des catégories
  const wrapperRef = useRef(null)                       // Référence au conteneur pour mesure
  const [visibleCount, setVisibleCount] = useState(7)  // Nombre de catégories visibles à la fois
  const [currentIndex, setCurrentIndex] = useState(0)  // Index de la première catégorie visible
  const [itemWidth, setItemWidth] = useState(0)         // Largeur calculée de chaque élément

  /* ── Chargement des catégories depuis l'API Strapi au montage ── */
  useEffect(() => {
    fetchCategories()
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          setCategories([])
        }
      })
      .catch(() => {
        setCategories([])
      })
  }, [])

  /* ── Calcul du nombre de catégories visibles selon la largeur du conteneur ──
     Utilise un ResizeObserver pour réagir aux changements de taille dynamiques
     (redimensionnement de fenêtre, ouverture du panneau latéral, etc.) */
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth

      // Points de rupture : plus l'espace est grand, plus on affiche de catégories
      let vc = 1
      if (w >= 900)      vc = 7
      else if (w >= 750) vc = 6
      else if (w >= 600) vc = 5
      else if (w >= 480) vc = 4
      else if (w >= 360) vc = 3
      else if (w >= 240) vc = 2
      else               vc = 1

      // Ne pas afficher plus de catégories qu'il n'en existe
      vc = Math.min(vc, categories.length || vc)
      setVisibleCount(vc)

      // Largeur de chaque élément = largeur totale divisée par le nombre visible
      const iw = Math.floor(w / vc)
      setItemWidth(iw)

      // S'assurer que l'index courant reste dans les bornes valides
      const maxStart = Math.max(0, (categories.length || 0) - vc)
      setCurrentIndex(ci => Math.min(ci, maxStart))
    }

    compute()

    // Observer les changements de taille du conteneur
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)

    // Nettoyage à la destruction du composant
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [categories.length])

  /* ── Réinitialisation de l'index au changement de configuration ── */
  useEffect(() => {
    setCurrentIndex(0)
  }, [visibleCount, categories.length])

  /* ── Défilement automatique pour garder la catégorie active visible ── */
  useEffect(() => {
    if (!activeCategory || categories.length === 0) return

    // Trouver l'index de la catégorie active dans la liste
    const idx = categories.findIndex(c =>
      (activeCategory.id && c.id === activeCategory.id) ||
      (activeCategory.title && c.title === activeCategory.title)
    )
    if (idx === -1) return

    setCurrentIndex(ci => {
      if (idx < ci) return idx                                           // Catégorie avant la fenêtre : défile à gauche
      if (idx >= ci + visibleCount) return Math.max(0, idx - visibleCount + 1) // Après : défile à droite
      return ci                                                          // Déjà visible : ne rien faire
    })
  }, [activeCategory, categories, visibleCount])

  /* ── Navigation : décalage d'une catégorie vers la gauche ── */
  const prev = () => {
    setCurrentIndex(ci => Math.max(0, ci - 1))
  }

  /* ── Navigation : décalage d'une catégorie vers la droite ── */
  const next = () => {
    const maxStart = Math.max(0, (categories.length || 0) - visibleCount)
    setCurrentIndex(ci => Math.min(maxStart, ci + 1))
  }

  return (
    <div className="category-slider-wrap" ref={wrapperRef}>
      <div className="category-slider-viewport">

        {/* Flèche gauche — affichée uniquement si des catégories sont hors écran */}
        {categories.length > visibleCount && (
          <button
            type="button"
            className="slider-arrow prev"
            onClick={prev}
            aria-label="Catégorie précédente"
          >
            <img src="/img/images/fleche-slider.png" alt="Précédent" />
          </button>
        )}

        {/* Piste de défilement : translate en X selon l'index courant */}
        <div
          className="category-slider-track"
          style={{
            width: `${categories.length * itemWidth}px`,
            transform: `translateX(-${currentIndex * itemWidth}px)`,
          }}
        >
          {categories.map((cat) => {
            // Vérification si cette catégorie est la catégorie active (par id ou par titre)
            const isActive = !!activeCategory && (
              (activeCategory.id && activeCategory.id === cat.id) ||
              (activeCategory.title && activeCategory.title === cat.title)
            )

            return (
              <button
                key={cat.id}
                className={`category-item ${isActive ? 'active' : ''}`}
                aria-pressed={isActive} /* accessibilité : indique l'état actif/inactif */
                onClick={() => onSelect && onSelect(cat)}
                style={{ width: itemWidth }}
              >
                {/* Image de la catégorie (gestion URLs relatives Strapi) */}
                <img
                  src={cat.image.startsWith('/') ? `/img${cat.image}` : cat.image}
                  alt={cat.title}
                />
                <span>{cat.title}</span>
              </button>
            )
          })}
        </div>

        {/* Flèche droite — affichée uniquement si des catégories sont hors écran */}
        {categories.length > visibleCount && (
          <button
            type="button"
            className="slider-arrow next"
            onClick={next}
            aria-label="Catégorie suivante"
          >
            <img src="/img/images/fleche-slider.png" alt="Suivant" />
          </button>
        )}
      </div>
    </div>
  )
}

export default CategorySlider
