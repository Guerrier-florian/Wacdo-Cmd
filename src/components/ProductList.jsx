/**
 * ProductList.jsx — Liste des produits par catégorie
 *
 * Affiche une grille de produits disponibles pour la catégorie sélectionnée.
 * Gère l'ouverture des modales :
 *  - MenuChoiceModal : pour les menus (choix menu type + accompagnement + boisson)
 *  - DrinkSizeModal  : pour les boissons (choix de la taille)
 *
 * Affiche une notification de confirmation à chaque ajout au panier.
 */
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addItem } from '../slices/shopping-cart-slice'
import { fetchCategoryData } from '../api/config'
import { message } from 'antd' // Notification de confirmation d'ajout au panier
import '../styles/ProductList.css'
import MenuChoiceModal from './MenuChoiceModal'
import DrinkSizeModal from './DrinkSizeModal'

const ProductList = ({ category }) => {
  /* ── États locaux ── */
  const [products, setProducts] = useState([])         // Liste des produits chargés
  const [choiceOpen, setChoiceOpen] = useState(false)  // Modale menu ouverte ?
  const [drinkSizeOpen, setDrinkSizeOpen] = useState(false) // Modale boisson ouverte ?
  const [selectedProduct, setSelectedProduct] = useState(null) // Produit en cours de sélection

  const dispatch = useDispatch()

  /* ── Chargement des produits quand la catégorie change ── */
  useEffect(() => {
    if (!category) return

    fetchCategoryData(category.title)
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      })
      .catch(() => {
        setProducts([])
      })
  }, [category])

  /* ── Guard : si aucune catégorie, rien à afficher ── */
  if (!category) {
    return null
  }

  /* ── Clic sur un produit : ouvre la modale appropriée ou ajoute directement au panier ── */
  const handleProductClick = (product) => {
    // Les menus nécessitent de choisir le type, l'accompagnement et la boisson
    if (category?.title === 'menus') {
      setSelectedProduct(product)
      setChoiceOpen(true)
      return
    }
    // Les boissons nécessitent de choisir la taille (30cl ou 50cl)
    if (category?.title === 'boissons') {
      setSelectedProduct(product)
      setDrinkSizeOpen(true)
      return
    }
    // Pour tous les autres produits (burgers, desserts, etc.) : ajout direct au panier
    dispatch(addItem(product))
    message.success(`${product.nom} ajouté à votre commande !`)
  }

  /* ── Validation d'un menu : ajoute le menu avec ses détails au panier ── */
  const handleChoose = (choice) => {
    if (!selectedProduct) return

    // Le choix peut être une chaîne (ancienne version) ou un objet { menuType, side, drink }
    const menuDetails = typeof choice === 'string'
      ? choice
      : `${choice.menuType} - ${choice.side} - ${choice.drink}`

    dispatch(addItem({ ...selectedProduct, menuChoice: menuDetails }))
    message.success(`${selectedProduct.nom} ajouté à votre commande !`)
    setChoiceOpen(false)
    setSelectedProduct(null)
  }

  /* ── Validation d'une boisson : ajoute la boisson (x quantité) avec la taille choisie ── */
  const handleDrinkSizeChoose = (choice) => {
    if (!selectedProduct) return
    const { size, quantity } = choice

    // Prix unitaire : +0,50€ pour le format 50cl
    const unitPrice = selectedProduct.prix + (size === '50cl' ? 0.5 : 0)

    // Ajouter le produit autant de fois que la quantité sélectionnée
    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({ ...selectedProduct, drinkSize: size, prix: unitPrice }))
    }

    message.success(`${selectedProduct.nom} (${size}) ajouté à votre commande !`)
    setDrinkSizeOpen(false)
    setSelectedProduct(null)
  }

  /* ── Fermeture d'une modale sans sélection ── */
  const handleCloseModal = () => {
    setChoiceOpen(false)
    setDrinkSizeOpen(false)
    setSelectedProduct(null)
  }

  /* ── Accessibilité clavier : Entrée ou Espace activent le clic ── */
  const onKeyActivate = (e, product) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleProductClick(product)
    }
  }

  return (
    <div className="product-list">
      {/* Titre de la catégorie (capitalisé via CSS) */}
      <h2>Nos {category.title}</h2>

      {/* Sous-titre uniquement pour la catégorie "menus" */}
      {category.title === 'menus' && (
        <p>Un sandwich, une friture ou une salade et une boisson</p>
      )}

      {/* Grille de produits : uniquement les produits disponibles (disponible === true) */}
      <div className="products-grid">
        {products.filter(product => product.disponible === true).map(product => (
          <div
            key={product.id}
            className="product-card"
            role="button"
            tabIndex={0}
            onClick={() => handleProductClick(product)}
            onKeyDown={(e) => onKeyActivate(e, product)}
          >
            {/* Image du produit (gestion des URLs relatives Strapi et absolues) */}
            <img
              src={product.image.startsWith('/') ? `/img${product.image}` : product.image}
              alt={product.nom}
            />
            <h3>{product.nom}</h3>
            <p className="product-price">{product.prix.toFixed(2)} €</p>
          </div>
        ))}
      </div>

      {/* Modale de choix de menu (type + accompagnement + boisson) */}
      {choiceOpen && (
        <MenuChoiceModal
          product={selectedProduct}
          onChoose={handleChoose}
          onClose={handleCloseModal}
        />
      )}

      {/* Modale de choix de taille pour les boissons */}
      {drinkSizeOpen && (
        <DrinkSizeModal
          product={selectedProduct}
          onChoose={handleDrinkSizeChoose}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default ProductList
