import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, generateOrder, removeLine, saveOrder } from '../slices/shopping-cart-slice'
import { saveOrderToDatabase } from '../api/orders'
import '../styles/Cart.css'

const Cart = () => {
  const cart = useSelector(state => state.shoppingCart.cart)
  const orderNumber = useSelector(state => state.shoppingCart.orderNumber)
  const mode = useSelector(state => state.shoppingCart.mode)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { total, count } = useMemo(() => {
    const t = cart.reduce((acc, it) => acc + it.prix * it.quantity, 0)
    const c = cart.reduce((acc, it) => acc + it.quantity, 0)
    return { total: t, count: c }
  }, [cart])

  // Generate a 4-digit order number once per session if not yet set
  useEffect(() => {
    if (!orderNumber) {
      dispatch(generateOrder())
    }
  }, [orderNumber, dispatch])

  if (!cart || cart.length === 0) {
    return (
      <div className="cart">
        <div className="cart-logo">
          <img src="/img/images/logo.png" alt="Logo" />
        </div>
        <h2>Récapitulatif</h2>
        {orderNumber && (
          <p className="order-number">Commande n° {orderNumber}</p>
        )}
        {mode && (
          <p className="order-mode">{mode === 'surplace' ? 'Sur place' : 'À emporter'}</p>
        )}
        <p className="cart-empty">Votre panier est vide.</p>
      </div>
    )
  }

  return (
    <div className="cart">
    <div className="cart-logo">
      <img src="/img/images/logo.png" alt="Logo" />
    </div>
      <div className="cart-header">
        <div className="order-info">
          {orderNumber && (
            <p className="order-number">Commande n° {orderNumber}</p>
          )}
          {mode && (
            <p className="order-mode">{mode === 'surplace' ? 'Sur place' : 'À emporter'}</p>
          )}
        </div>
      </div>
      <ul className="cart-items">
        {cart.map(item => {
          // Split menu choices by " - " for line breaks
          const menuChoiceParts = item.menuChoice ? item.menuChoice.split(' - ') : null
          
          return (
            <li key={`${item.id}-${item.menuChoice || 'standard'}-${item.drinkSize || 'standard'}`} className="cart-item simple">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.nom}</div>
                {menuChoiceParts && menuChoiceParts.length > 0 && (
                  <div className="cart-item-meta">
                    {menuChoiceParts.map((part, index) => (
                      <div key={index}>{part}</div>
                    ))}
                  </div>
                )}
                {item.drinkSize && (
                  <div className="cart-item-meta">
                    <div>{item.drinkSize}</div>
                  </div>
                )}
              </div>
              <div className="cart-item-actions">
                <button className="trash" aria-label="Supprimer l'article" title="Supprimer" onClick={() => dispatch(removeLine({ id: item.id, menuChoice: item.menuChoice, drinkSize: item.drinkSize }))}>
                  <img src="/img/images/trash.png" alt="Supprimer" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="cart-footer">
        <div className="cart-total-label">Total ({count} {count > 1 ? 'articles' : 'article'})</div>
        <div className="cart-total-value">{total.toFixed(2)} €</div>
      </div>
      <div className="cart-actions">
        <button className="cart-abandon" onClick={() => dispatch(clearCart())}>Abandon</button>
        <button
          className="cart-checkout"
          disabled={cart.length === 0}
          onClick={async () => {
            if (!cart.length) return
            if (mode === 'surplace') {
              // For sur place, we'll save after chevalet number is entered on OnOff page
              navigate('/onoff')
              return
            }
            if (mode === 'aemporter') {
              // Build order payload
              const { total, count } = cart.reduce((acc, it) => {
                acc.total += it.prix * it.quantity
                acc.count += it.quantity
                return acc
              }, { total: 0, count: 0 })

              const order = {
                orderNumber,
                mode,
                tableNumber: null,
                items: cart.map(it => ({
                  id: it.id,
                  nom: it.nom,
                  prix: it.prix,
                  quantity: it.quantity,
                  totalLine: Number((it.prix * it.quantity).toFixed(2)),
                  menuChoice: it.menuChoice || null,
                  drinkSize: it.drinkSize || null,
                })),
                total: Number(total.toFixed(2)),
                count,
                createdAt: new Date().toISOString(),
              }

              // Préparer les données pour MySQL
              const articlesString = order.items.map(item => 
                `${item.nom}${item.menuChoice ? ' (' + item.menuChoice + ')' : ''}${item.drinkSize ? ' - ' + item.drinkSize : ''} x${item.quantity}`
              ).join(', ')

              const dbOrder = {
                Cnumber: orderNumber,
                total: order.total,
                articles: articlesString,
                place: 'à emporter',
                table: null
              }

              try {
                // Envoyer à la base de données MySQL
                await saveOrderToDatabase(dbOrder)
                
                // Sauvegarder dans Redux
                dispatch(saveOrder(order))
                dispatch(clearCart())
                dispatch(generateOrder())
                navigate('/thanks')
              } catch (error) {
                console.error('Erreur lors de l\'enregistrement:', error)
                alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.')
              }
              return
            }
            // Fallback if mode not set
            navigate('/onoff')
          }}
        >
          Valider la commande
        </button>
      </div>
    </div>
  )
}

export default Cart