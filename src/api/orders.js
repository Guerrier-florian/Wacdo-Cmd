/**
 * Envoie une commande à la base de données via l'API serverless
 * @param {Object} orderData - Les données de la commande
 * @param {string} orderData.Cnumber - Numéro de commande unique
 * @param {number} orderData.total - Total TTC de la commande
 * @param {string} orderData.articles - Liste des articles séparés par des virgules
 * @param {string} orderData.place - "sur place" ou "à emporter"
 * @param {string|null} orderData.table - Numéro de chevalet (ou null pour à emporter)
 * @returns {Promise<Object>} Réponse de la base de données
 */
export async function saveOrderToDatabase(orderData) {
  try {
    console.log('📤 Envoi de la commande à l\'API...');
    
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
        table: orderData.table
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Erreur lors de l\'enregistrement de la commande');
    }

    const result = await response.json();
    console.log('✅ Commande enregistrée:', result);

    return result.order || result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement:', error);
    throw error;
  }
}

