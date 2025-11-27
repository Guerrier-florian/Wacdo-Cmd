// Configuration des endpoints API
const API_BASE_URL = 'https://web-production-55aa1.up.railway.app/api';

export const API_ENDPOINTS = {
  boissons: `${API_BASE_URL}/boissons`,
  burgers: `${API_BASE_URL}/burgers`,
  desserts: `${API_BASE_URL}/desserts`,
  encas: `${API_BASE_URL}/encas`,
  frites: `${API_BASE_URL}/frites`,
  menus: `${API_BASE_URL}/menus`,
  salades: `${API_BASE_URL}/salades`,
  sauces: `${API_BASE_URL}/sauces`,
  wraps: `${API_BASE_URL}/wraps`,
  categories: `${API_BASE_URL}/categories`,
};

/**
 * Récupère les données d'une catégorie depuis l'API
 * @param {string} categoryName - Nom de la catégorie (boissons, burgers, etc.)
 * @returns {Promise<Array>} Liste des produits
 */
export async function fetchCategoryData(categoryName) {
  const endpoint = API_ENDPOINTS[categoryName];
  if (!endpoint) {
    throw new Error(`Catégorie inconnue: ${categoryName}`);
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  const data = await response.json();
  // Si la réponse contient une clé avec le nom de la catégorie, l'extraire
  // Sinon retourner directement les données (si c'est déjà un tableau)
  return Array.isArray(data) ? data : (data[categoryName] || data.data || []);
}

/**
 * Récupère toutes les catégories
 * @returns {Promise<Array>} Liste des catégories
 */
export async function fetchCategories() {
  const response = await fetch(API_ENDPOINTS.categories);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  const data = await response.json();
  // Gérer différentes structures de réponse
  return Array.isArray(data) ? data : (data.categories || data.data || []);
}
