/**
 * shopping-cart-slice.js — Slice Redux du panier de commande
 *
 * Gère l'état global de la commande en cours :
 *  - mode        : 'surplace' ou 'aemporter'
 *  - orderNumber : numéro d'affichage de la commande (4 chiffres)
 *  - tableNumber : numéro de chevalet (uniquement pour 'surplace')
 *  - cart        : tableau des articles ajoutés au panier
 *  - savedOrders : historique des commandes validées (en mémoire)
 *
 * Utilise Redux Toolkit (createSlice) pour simplifier l'écriture
 * des reducers avec Immer (mutations directes autorisées).
 */
import { createSlice } from '@reduxjs/toolkit'

/**
 * Génère un numéro de commande à 4 chiffres à partir du timestamp actuel.
 * Prend les 4 derniers chiffres du timestamp pour avoir un nombre mémorisable.
 * Garantit un minimum de 1000 pour toujours avoir 4 chiffres.
 *
 * @returns {number} Numéro de commande entre 1000 et 9999
 */
const generateOrderNumber = () => {
  const timestamp = Date.now()
  const orderNum = parseInt(timestamp.toString().slice(-4))
  return orderNum < 1000 ? orderNum + 1000 : orderNum
}

const shoppingcartslice = createSlice({
  name: 'shopping-cart',

  /* ── État initial ── */
  initialState: {
    mode: null,         // 'surplace' | 'aemporter' | null (pas encore sélectionné)
    orderNumber: null,  // Numéro de commande affiché au client (4 chiffres)
    tableNumber: null,  // Numéro de chevalet sur 3 chiffres (uniquement en mode surplace)
    cart: [],           // [{ id, nom, prix, image, menuChoice, drinkSize, quantity }]
    savedOrders: [],    // Historique des commandes validées pour la session
  },

  reducers: {
    /**
     * Définit le mode de consommation ('surplace' ou 'aemporter').
     * Appelé depuis Home.jsx lors du choix de l'utilisateur.
     */
    setMode(state, action) {
      state.mode = action.payload
    },

    /**
     * Définit manuellement le numéro de commande.
     * Rarement utilisé directement (préférer generateOrder).
     */
    setOrderNumber(state, action) {
      state.orderNumber = action.payload
    },

    /**
     * Enregistre le numéro de chevalet (3 chiffres en mode surplace).
     * Appelé depuis OnOff.jsx après saisie du code.
     */
    setTableNumber(state, action) {
      state.tableNumber = action.payload
    },

    /**
     * Génère automatiquement un nouveau numéro de commande à 4 chiffres.
     * Appelé au montage du composant Cart et après chaque commande validée.
     */
    generateOrder(state) {
      state.orderNumber = generateOrderNumber()
    },

    /**
     * Ajoute un produit au panier ou incrémente sa quantité si déjà présent.
     * La déduplication est basée sur : id + menuChoice + drinkSize
     * (un même sandwich peut apparaître plusieurs fois avec des accompagnements différents).
     *
     * @param {Object} action.payload - Produit à ajouter
     */
    addItem(state, action) {
      const p = action.payload

      // Chercher si le même produit (même id, même menu, même taille boisson) existe déjà
      const existing = state.cart.find(it =>
        it.id === p.id &&
        it.menuChoice === p.menuChoice &&
        it.drinkSize === p.drinkSize
      )

      if (existing) {
        // Produit déjà présent : incrémenter la quantité
        existing.quantity += 1
      } else {
        // Nouveau produit : ajouter une nouvelle ligne au panier
        state.cart.push({
          id: p.id,
          nom: p.nom,
          prix: p.prix,
          image: p.image,
          menuChoice: p.menuChoice || null,
          drinkSize: p.drinkSize || null,
          quantity: 1,
        })
      }
    },

    /**
     * Décrémente la quantité d'un article (le supprime si quantité = 1).
     * Identifie l'article par id + menuChoice + drinkSize.
     *
     * @param {Object|number} action.payload - { id, menuChoice?, drinkSize? } ou id simple
     */
    removeItem(state, action) {
      const payload = action.payload
      const id = typeof payload === 'object' ? payload.id : payload
      const menuChoice = typeof payload === 'object' ? (payload.menuChoice ?? undefined) : undefined
      const drinkSize = typeof payload === 'object' ? (payload.drinkSize ?? undefined) : undefined

      const existing = state.cart.find(it =>
        it.id === id &&
        (menuChoice === undefined || it.menuChoice === menuChoice) &&
        (drinkSize === undefined || it.drinkSize === drinkSize)
      )

      if (!existing) return

      if (existing.quantity > 1) {
        existing.quantity -= 1        // Réduire la quantité
      } else {
        state.cart = state.cart.filter(it => !(
          it.id === id &&
          (menuChoice === undefined || it.menuChoice === menuChoice) &&
          (drinkSize === undefined || it.drinkSize === drinkSize)
        ))
      }
    },

    /**
     * Supprime entièrement une ligne du panier, quelle que soit la quantité.
     * Utilisé par le bouton corbeille dans Cart.jsx.
     *
     * @param {Object|number} action.payload - { id, menuChoice?, drinkSize? } ou id simple
     */
    removeLine(state, action) {
      const payload = action.payload
      const id = typeof payload === 'object' ? payload.id : payload
      const menuChoice = typeof payload === 'object' ? (payload.menuChoice ?? undefined) : undefined
      const drinkSize = typeof payload === 'object' ? (payload.drinkSize ?? undefined) : undefined

      state.cart = state.cart.filter(it => !(
        it.id === id &&
        (menuChoice === undefined || it.menuChoice === menuChoice) &&
        (drinkSize === undefined || it.drinkSize === drinkSize)
      ))
    },

    /**
     * Vide complètement le panier.
     * Appelé après validation d'une commande.
     */
    clearCart(state) {
      state.cart = []
    },

    /**
     * Sauvegarde une commande validée dans l'historique local de la session.
     * Permet de conserver un historique sans base de données côté client.
     *
     * @param {Object} action.payload - { orderNumber, mode, tableNumber, items, total, count, createdAt }
     */
    saveOrder(state, action) {
      state.savedOrders.push(action.payload)
    },
  },
})

/* ── Export des actions individuelles pour utilisation dans les composants ── */
export const {
  setMode,
  setOrderNumber,
  setTableNumber,
  generateOrder,
  addItem,
  removeItem,
  removeLine,
  clearCart,
  saveOrder,
} = shoppingcartslice.actions

/* ── Export du reducer pour le store Redux ── */
export default shoppingcartslice
