/**
 * Cart.jsx — Récapitulatif de commande
 *
 * Affiche la liste des articles ajoutés au panier, le total,
 * et les boutons "Abandon" et "Valider la commande".
 *
 * Comportement selon le mode :
 *  - "surplace"   : redirige vers /onoff (saisie du numéro de chevalet)
 *  - "aemporter"  : envoie directement la commande en base puis redirige vers /thanks
 */
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, generateOrder, removeLine, saveOrder } from '../slices/shopping-cart-slice'
import { saveOrderToDatabase } from '../api/orders'
import '../styles/Cart.css'

const Cart = () => {
  /* ── Lecture du store Redux ── */
  const cart = useSelector(state => state.shoppingCart.cart)
  const orderNumber = useSelector(state => state.shoppingCart.orderNumber)
  const mode = useSelector(state => state.shoppingCart.mode)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  /* ── Calcul du total et du nombre d'articles (mémoïsé pour la performance) ── */
  const { total, count } = useMemo(() => {
    const t = cart.reduce((acc, it) => acc + it.prix * it.quantity, 0)
    const c = cart.reduce((acc, it) => acc + it.quantity, 0)
    return { total: t, count: c }
  }, [cart])

  /* ── Génération du numéro de commande au premier montage si absent ── */
  useEffect(() => {
    if (!orderNumber) {
      dispatch(generateOrder())
    }
  }, [orderNumber, dispatch])

  /* ── Affichage panier vide ── */
  if (!cart || cart.length === 0) {
    return (
      <div className="cart">
        <div className="cart-logo">
          <img src="/img/images/logo.png" alt="Logo Wacdoa" />
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

  /* ── Affichage panier avec articles ── */
  return (
    <div className="cart">
      {/* Logo en en-tête du récapitulatif */}
      <div className="cart-logo">
        <img src="/img/images/logo.png" alt="Logo Wacdoa" />
      </div>

      {/* Numéro de commande et mode (sur place / à emporter) */}
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

      {/* Liste des articles du panier */}
      <ul className="cart-items">
        {cart.map(item => {
          // Sépare les détails du menu ("menu maxi best of - frites - coca-cola") en lignes distinctes
          const menuChoiceParts = item.menuChoice ? item.menuChoice.split(' - ') : null

          return (
            <li
              key={`${item.id}-${item.menuChoice || 'standard'}-${item.drinkSize || 'standard'}`}
              className="cart-item simple"
            >
              <div className="cart-item-info">
                {/* Nom du produit */}
                <div className="cart-item-name">{item.nom}</div>

                {/* Détails du menu (type + accompagnement + boisson) sur plusieurs lignes */}
                {menuChoiceParts && menuChoiceParts.length > 0 && (
                  <div className="cart-item-meta">
                    {menuChoiceParts.map((part, index) => (
                      <div key={index}>{part}</div>
                    ))}
                  </div>
                )}

                {/* Taille de la boisson (30cl ou 50cl) */}
                {item.drinkSize && (
                  <div className="cart-item-meta">
                    <div>{item.drinkSize}</div>
                  </div>
                )}
              </div>

              {/* Bouton de suppression de l'article */}
              <div className="cart-item-actions">
                <button
                  className="trash"
                  aria-label="Supprimer l'article"
                  title="Supprimer"
                  onClick={() => dispatch(removeLine({
                    id: item.id,
                    menuChoice: item.menuChoice,
                    drinkSize: item.drinkSize,
                  }))}
                >
                  <img src="/img/images/trash.png" alt="Supprimer" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Pied de panier : total */}
      <div className="cart-footer">
        <div className="cart-total-label">
          Total ({count} {count > 1 ? 'articles' : 'article'})
        </div>
        <div className="cart-total-value">{total.toFixed(2)} €</div>
      </div>

      {/* Actions : abandon ou validation */}
      <div className="cart-actions">
        {/* Bouton "Abandon" : vide le panier sans enregistrer */}
        <button className="cart-abandon" onClick={() => dispatch(clearCart())}>
          Abandon
        </button>

        {/* Bouton "Valider la commande" */}
        <button
          className="cart-checkout"
          disabled={cart.length === 0}
          onClick={async () => {
            if (!cart.length) return

            // Générer un identifiant unique basé sur le timestamp (millisecondes)
            const uniqueOrderNumber = Date.now()

            if (mode === 'surplace') {
              // Pour "sur place" : on passe d'abord par la saisie du numéro de chevalet
              navigate('/onoff')
              return
            }

            if (mode === 'aemporter') {
              // Pour "à emporter" : enregistrement direct en base de données

              // Calcul du total et du nombre d'articles
              const { total: orderTotal, count: orderCount } = cart.reduce((acc, it) => {
                acc.total += it.prix * it.quantity
                acc.count += it.quantity
                return acc
              }, { total: 0, count: 0 })

              // Construction de l'objet commande complet
              const order = {
                orderNumber: uniqueOrderNumber,
                mode,
                tableNumber: null, // pas de table pour "à emporter"
                items: cart.map(it => ({
                  id: it.id,
                  nom: it.nom,
                  prix: it.prix,
                  quantity: it.quantity,
                  totalLine: Number((it.prix * it.quantity).toFixed(2)),
                  menuChoice: it.menuChoice || null,
                  drinkSize: it.drinkSize || null,
                })),
                total: Number(orderTotal.toFixed(2)),
                count: orderCount,
                createdAt: new Date().toISOString(),
              }

              // Formatage de la chaîne d'articles pour PostgreSQL
              const articlesString = order.items.map(item =>
                `${item.nom}${item.menuChoice ? ' (' + item.menuChoice + ')' : ''}${item.drinkSize ? ' - ' + item.drinkSize : ''} x${item.quantity}`
              ).join(', ')

              // Objet envoyé à l'API PostgreSQL
              const dbOrder = {
                Cnumber: uniqueOrderNumber.toString(),
                total: order.total,
                articles: articlesString,
                place: 'à emporter',
                table: null,
              }

              try {
                // Envoi de la commande vers le serveur Express / PostgreSQL
                await saveOrderToDatabase(dbOrder)

                // Sauvegarde dans Redux (historique local) et réinitialisation du panier
                dispatch(saveOrder(order))
                dispatch(clearCart())
                dispatch(generateOrder()) // prépare le prochain numéro de commande
                navigate('/thanks')
              } catch (error) {
                console.error('Erreur lors de l\'enregistrement:', error)
                alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.')
              }
              return
            }

            // Cas de secours : si le mode n'est pas reconnu, rediriger vers la saisie
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
