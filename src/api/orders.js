/**
 * Envoie une commande au serveur MySQL
 * @param {Object} orderData - Les données de la commande
 * @param {string} orderData.Cnumber - Numéro de commande unique
 * @param {number} orderData.total - Total TTC de la commande
 * @param {string} orderData.articles - Liste des articles séparés par des virgules
 * @param {string} orderData.place - "sur place" ou "à emporter"
 * @param {string|null} orderData.table - Numéro de chevalet (ou null pour à emporter)
 * @returns {Promise<Object>} Réponse du serveur
 */
export async function saveOrderToDatabase(orderData) {
  try {
    const response = await fetch('/api/commandes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Erreur lors de l\'enregistrement de la commande');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}
