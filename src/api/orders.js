/**
 * orders.js — Envoi des commandes vers la base de données
 *
 * Cette fonction communique avec le serveur Express (server.js)
 * qui se charge d'insérer la commande dans la base de données PostgreSQL (Neon).
 *
 * La route utilisée est /api/commandes (endpoint interne, proxifié par Vite
 * en développement vers localhost:3001, et par Vercel en production).
 */

/**
 * Envoie une commande validée vers la base de données via l'API interne.
 *
 * @param {Object}      orderData          - Données de la commande à enregistrer
 * @param {string}      orderData.Cnumber  - Identifiant unique (timestamp en ms)
 * @param {number}      orderData.total    - Montant total TTC en euros
 * @param {string}      orderData.articles - Liste des articles (chaîne formatée)
 * @param {string}      orderData.place    - "sur place" ou "à emporter"
 * @param {string|null} orderData.table    - Numéro de chevalet (null pour à emporter)
 * @returns {Promise<Object>} La ligne insérée en base de données
 * @throws {Error} Si l'API renvoie une erreur ou est inaccessible
 */
export async function saveOrderToDatabase(orderData) {
  try {
    // Envoi de la requête POST vers l'API interne
    const response = await fetch('/api/commandes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Cnumber: orderData.Cnumber,
        total: orderData.total,
        articles: orderData.articles,
        place: orderData.place,
        table: orderData.table,
      }),
    })

    // Gestion des erreurs HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.details || errorData.error || 'Erreur lors de l\'enregistrement de la commande'
      )
    }

    const result = await response.json()

    // Retourner la commande enregistrée (avec son id en base)
    return result.order || result
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la commande:', error)
    throw error // Propagé au composant appelant pour afficher un message d'erreur
  }
}
