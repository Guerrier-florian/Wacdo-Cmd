import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addItem } from '../slices/shopping-cart-slice'
import '../styles/ProductList.css'
import MenuChoiceModal from './MenuChoiceModal'
import DrinkSizeModal from './DrinkSizeModal'

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([])
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [drinkSizeOpen, setDrinkSizeOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!category) return

    fetch('/tabs/produits.json')
      .then(res => res.json())
      .then(data => {
        // category.title correspond aux clés dans produits.json (menus, burgers, wraps, etc.)
        const categoryProducts = data[category.title] || []
        setProducts(categoryProducts)
      })
      .catch(err => console.error('Failed to load products', err))
  }, [category])

  if (!category) {
    return null
  }

  const handleProductClick = (product) => {
    if (category?.title === 'menus') {
      setSelectedProduct(product)
      setChoiceOpen(true)
      return
    }
    if (category?.title === 'boissons') {
      setSelectedProduct(product)
      setDrinkSizeOpen(true)
      return
    }
    dispatch(addItem(product))
  }

  const handleChoose = (choice) => {
    if (!selectedProduct) return
    // choice is now an object: { menuType, side, drink }
    const menuDetails = typeof choice === 'string' 
      ? choice 
      : `${choice.menuType} - ${choice.side} - ${choice.drink}`
    dispatch(addItem({ ...selectedProduct, menuChoice: menuDetails }))
    setChoiceOpen(false)
    setSelectedProduct(null)
  }

  const handleDrinkSizeChoose = (choice) => {
    if (!selectedProduct) return
    const { size, quantity } = choice
    // Add the item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      const unitPrice = selectedProduct.prix + (size === '50cl' ? 0.5 : 0)
      dispatch(addItem({ ...selectedProduct, drinkSize: size, prix: unitPrice }))
    }
    setDrinkSizeOpen(false)
    setSelectedProduct(null)
  }

  const handleCloseModal = () => {
    setChoiceOpen(false)
    setDrinkSizeOpen(false)
    setSelectedProduct(null)
  }

  const onKeyActivate = (e, product) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleProductClick(product)
    }
  }

  return (
    <div className="product-list">
      <h2>Nos {category.title}</h2>
      {category.title === 'menus' && (
        <p>Un sandwich, une friture ou une salade et une boisson</p>
      )}
      
      <div className="products-grid">
        {products.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            role="button"
            tabIndex={0}
            onClick={() => handleProductClick(product)}
            onKeyDown={(e) => onKeyActivate(e, product)}
          >
            <img 
              src={product.image.startsWith('/') ? `/img${product.image}` : product.image} 
              alt={product.nom} 
            />
            <h3>{product.nom}</h3>
            <p className="product-price">{product.prix.toFixed(2)} €</p>
          </div>
        ))}
      </div>
      {choiceOpen && (
        <MenuChoiceModal
          product={selectedProduct}
          onChoose={handleChoose}
          onClose={handleCloseModal}
        />
      )}
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
