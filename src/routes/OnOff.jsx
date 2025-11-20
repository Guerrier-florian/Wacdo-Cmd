import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { setTableNumber, clearCart, generateOrder, saveOrder } from '../slices/shopping-cart-slice'
import { saveOrderToDatabase } from '../api/orders'
import Layout from '../components/Layout'
import '../styles/OnOff.css'

const OnOff = () => {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cart = useSelector(state => state.shoppingCart.cart)
  const orderNumber = useSelector(state => state.shoppingCart.orderNumber)
  const mode = useSelector(state => state.shoppingCart.mode)

  const totals = useMemo(() => {
    const total = cart.reduce((acc, it) => acc + it.prix * it.quantity, 0)
    const count = cart.reduce((acc, it) => acc + it.quantity, 0)
    return { total: Number(total.toFixed(2)), count }
  }, [cart])


  const onSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 3) return
    dispatch(setTableNumber(code))

    // Build order for "sur place"
    const order = {
      orderNumber,
      mode,
      tableNumber: code,
      items: cart.map(it => ({
        id: it.id,
        nom: it.nom,
        prix: it.prix,
        quantity: it.quantity,
        totalLine: Number((it.prix * it.quantity).toFixed(2)),
        menuChoice: it.menuChoice || null,
        drinkSize: it.drinkSize || null,
      })),
      total: totals.total,
      count: totals.count,
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
      place: 'sur place',
      table: code
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
  }

  return (
    <Layout>
      <div className="onoff-chevalet">
        <img src="/img/images/chevallet.jpg" alt="Chevalet" />
      </div>
      <form className="onoff" onSubmit={onSubmit}>
        <h2 className="onoff-title">Pour être servis à table,</h2>
        <p className="onoff-subtitle">Récupérez un chevalet et indiquez ici le numéro inscrit dessus</p>
        
        <div className="onoff-digits">
          <input
            className="onoff-digit-input"
            type="tel"
            inputMode="numeric"
            maxLength="1"
            value={code[0] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setCode(val + (code[1] || '') + (code[2] || ''))
              if (val && e.target.nextElementSibling) e.target.nextElementSibling.focus()
            }}
            autoFocus
          />
          <input
            className="onoff-digit-input"
            type="tel"
            inputMode="numeric"
            maxLength="1"
            value={code[1] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setCode((code[0] || '') + val + (code[2] || ''))
              if (val && e.target.nextElementSibling) e.target.nextElementSibling.focus()
            }}
          />
          <input
            className="onoff-digit-input"
            type="tel"
            inputMode="numeric"
            maxLength="1"
            value={code[2] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              setCode((code[0] || '') + (code[1] || '') + val)
            }}
          />
        </div>

        <button type="submit" className="onoff-submit" disabled={code.length !== 3}>
          Enregistrer le numéro
        </button>
      </form>
    </Layout>
  )
}

export default OnOff