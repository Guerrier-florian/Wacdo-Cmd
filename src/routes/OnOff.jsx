/**
 * OnOff.jsx — Page de saisie du numéro de chevalet (route /onoff)
 *
 * Affichée uniquement pour le mode "sur place".
 * L'utilisateur doit saisir le numéro à 3 chiffres inscrit sur le chevalet
 * posé sur sa table. Ce numéro permet au personnel de livrer la commande
 * à la bonne table.
 *
 * À la validation :
 *  1. Le numéro de table est enregistré dans Redux
 *  2. La commande est envoyée en base de données PostgreSQL
 *  3. L'utilisateur est redirigé vers la page de confirmation (/thanks)
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { setTableNumber, clearCart, generateOrder, saveOrder } from '../slices/shopping-cart-slice'
import { saveOrderToDatabase } from '../api/orders'
import Layout from '../components/Layout'
import '../styles/OnOff.css'

const OnOff = () => {
  /* ── État local : code saisi dans les 3 champs ── */
  const [code, setCode] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  /* ── Lecture du store Redux ── */
  const cart = useSelector(state => state.shoppingCart.cart)
  const orderNumber = useSelector(state => state.shoppingCart.orderNumber)
  const mode = useSelector(state => state.shoppingCart.mode)

  /* ── Calcul mémoïsé du total et du nombre d'articles du panier ── */
  const totals = useMemo(() => {
    const total = cart.reduce((acc, it) => acc + it.prix * it.quantity, 0)
    const count = cart.reduce((acc, it) => acc + it.quantity, 0)
    return { total: Number(total.toFixed(2)), count }
  }, [cart])

  /**
   * Soumission du formulaire :
   * Valide le code, construit la commande et l'envoie en base de données.
   */
  const onSubmit = async (e) => {
    e.preventDefault()

    // Vérification : le code doit contenir exactement 3 chiffres
    if (code.length !== 3) return

    // Enregistrer le numéro de table dans Redux
    dispatch(setTableNumber(code))

    // Générer un identifiant unique basé sur le timestamp (millisecondes)
    const uniqueOrderNumber = Date.now()

    // Construction de l'objet commande complet
    const order = {
      orderNumber: uniqueOrderNumber,
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

    // Formatage de la liste des articles en une seule chaîne pour PostgreSQL
    // Exemple : "Menu Big Tasty (menu best of - frites - coca-cola) x1, Frites x2"
    const articlesString = order.items.map(item =>
      `${item.nom}${item.menuChoice ? ' (' + item.menuChoice + ')' : ''}${item.drinkSize ? ' - ' + item.drinkSize : ''} x${item.quantity}`
    ).join(', ')

    // Objet envoyé à l'API Express / PostgreSQL
    const dbOrder = {
      Cnumber: uniqueOrderNumber.toString(),
      total: order.total,
      articles: articlesString,
      place: 'sur place',
      table: code,
    }

    try {
      // Envoi de la commande vers le serveur Express (stockage en PostgreSQL)
      await saveOrderToDatabase(dbOrder)

      // Sauvegarde dans Redux (historique local des commandes)
      dispatch(saveOrder(order))

      // Réinitialisation du panier et génération d'un nouveau numéro de commande
      dispatch(clearCart())
      dispatch(generateOrder())

      // Redirection vers la page de confirmation
      navigate('/thanks')
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.')
    }
  }

  return (
    <Layout>
      {/* Image décorative du chevalet posé sur la table */}
      <div className="onoff-chevalet">
        <img src="/img/images/chevallet.jpg" alt="Chevalet numéroté" />
      </div>

      {/* Formulaire de saisie du numéro de chevalet */}
      <form className="onoff" onSubmit={onSubmit}>
        <h2 className="onoff-title">Pour être servis à table,</h2>
        <p className="onoff-subtitle">
          Récupérez un chevalet et indiquez ici le numéro inscrit dessus
        </p>

        {/* 3 champs individuels pour chaque chiffre du code */}
        <div className="onoff-digits">
          {/* Chiffre 1 — autofocus au chargement de la page */}
          <input
            className="onoff-digit-input"
            type="tel"
            inputMode="numeric"
            maxLength="1"
            value={code[0] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '') // n'accepte que les chiffres
              setCode(val + (code[1] || '') + (code[2] || ''))
              if (val && e.target.nextElementSibling) e.target.nextElementSibling.focus()
            }}
            autoFocus
          />

          {/* Chiffre 2 — focus automatique depuis le chiffre 1 */}
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

          {/* Chiffre 3 — dernier champ, pas de focus suivant */}
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

        {/* Bouton de validation : désactivé tant que les 3 chiffres ne sont pas saisis */}
        <button
          type="submit"
          className="onoff-submit"
          disabled={code.length !== 3}
        >
          Enregistrer le numéro
        </button>
      </form>
    </Layout>
  )
}

export default OnOff
