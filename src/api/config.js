/**
 * config.js — Configuration et fonctions d'accès à l'API Strapi
 *
 * L'API Strapi est le CMS (Content Management System) qui stocke
 * tous les produits et catégories du menu.
 * Elle est hébergée sur Railway et accessible en lecture seule
 * depuis le front-end.
 */

// URL de base de l'API Strapi (définie en variable d'environnement pour la flexibilité)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://strapiwacdo-production.up.railway.app/api'

/** Endpoints disponibles sur l'API Strapi */
export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
}

/**
 * Récupère tous les produits d'une catégorie donnée.
 *
 * L'API Strapi utilise la pagination (25 produits par page maximum).
 * Cette fonction parcourt toutes les pages disponibles et retourne
 * uniquement les produits appartenant à la catégorie demandée.
 *
 * @param {string} categoryName - Nom de la catégorie (ex: 'menus', 'boissons', 'burgers')
 * @returns {Promise<Array>} Liste des produits de la catégorie
 * @throws {Error} Si la requête échoue
 */
export async function fetchCategoryData(categoryName) {
  try {
    let allProducts = []
    let currentPage = 1
    let totalPages = 1

    // Parcourir toutes les pages jusqu'à avoir tous les produits
    while (currentPage <= totalPages) {
      const response = await fetch(
        `${API_ENDPOINTS.products}?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=25`
      )

      if (!response.ok) {
        throw new Error(`Erreur API Strapi: ${response.status}`)
      }

      const result = await response.json()

      // Récupérer le nombre total de pages dès la première réponse
      if (currentPage === 1 && result.meta?.pagination) {
        totalPages = result.meta.pagination.pageCount
      }

      // Accumuler les produits de cette page
      allProducts = allProducts.concat(result.data || [])
      currentPage++
    }

    // Filtrer les produits par catégorie
    // Les données Strapi sont déjà aplaties (pas de structure .attributes)
    const filteredProducts = allProducts.filter(product =>
      product && product.category && product.category.title === categoryName
    )

    return filteredProducts
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw error
  }
}

/**
 * Récupère toutes les catégories de produits disponibles.
 *
 * Utilisé par le slider de catégories (CategorySlider.jsx).
 *
 * @returns {Promise<Array>} Liste des catégories avec leurs images et titres
 * @throws {Error} Si la requête échoue
 */
export async function fetchCategories() {
  const response = await fetch(API_ENDPOINTS.categories)

  if (!response.ok) {
    throw new Error(`Erreur API Strapi: ${response.status}`)
  }

  const result = await response.json()

  // Extraire le tableau de données de la réponse Strapi { data: [...] }
  return result.data || []
}
