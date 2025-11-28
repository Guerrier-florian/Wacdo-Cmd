import { createClient } from '@supabase/supabase-js'

// Initialiser le client Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wlbnkidgttaxnfhagbrt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsYm5raWRndHRheG5maGFnYnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjU3NjMsImV4cCI6MjA3OTkwMTc2M30.kCJyCrl3ORxT8mKEYRjBPvcxLtOIO5QYhpuXehJNnfQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Envoie une commande à Supabase
 * @param {Object} orderData - Les données de la commande
 * @param {string} orderData.Cnumber - Numéro de commande unique
 * @param {number} orderData.total - Total TTC de la commande
 * @param {string} orderData.articles - Liste des articles séparés par des virgules
 * @param {string} orderData.place - "sur place" ou "à emporter"
 * @param {string|null} orderData.table - Numéro de chevalet (ou null pour à emporter)
 * @returns {Promise<Object>} Réponse de Supabase
 */
export async function saveOrderToDatabase(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          cnumber: parseInt(orderData.Cnumber),
          total: orderData.total.toString(),
          articles: orderData.articles,
          place: orderData.place,
          table: orderData.table ? parseInt(orderData.table) : null,
          traite: false
        }
      ])
      .select()

    if (error) {
      throw new Error(error.message || 'Erreur lors de l\'enregistrement de la commande')
    }

    return data[0]
  } catch (error) {
    console.error('Erreur Supabase:', error)
    throw error
  }
}
