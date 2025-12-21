// Configuration des endpoints API Strapi
const API_BASE_URL = 'https://strapiwacdo-production.up.railway.app/api';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  categories: `${API_BASE_URL}/categories`,
};

/**
 * Récupère les données d'une catégorie depuis l'API
 * @param {string} categoryName - Nom de la catégorie (boissons, burgers, etc.)
 * @returns {Promise<Array>} Liste des produits
 */
export async function fetchCategoryData(categoryName) {
  try {
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;

    // Récupérer toutes les pages
    while (currentPage <= totalPages) {
      const response = await fetch(
        `${API_ENDPOINTS.products}?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=25`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();
      
      // Mettre à jour le nombre total de pages à partir de la première réponse
      if (currentPage === 1 && result.meta?.pagination) {
        totalPages = result.meta.pagination.pageCount;
        console.log(`📄 Total de ${result.meta.pagination.total} produits sur ${totalPages} pages`);
      }

      // Ajouter les produits de cette page
      allProducts = allProducts.concat(result.data || []);
      currentPage++;
    }

    console.log(`✅ ${allProducts.length} produits récupérés au total`);

    // Filtrer les produits par catégorie
    const filteredProducts = allProducts.filter(product => {
      return product.category && product.category.title === categoryName;
    });

    console.log(`🔍 ${filteredProducts.length} produits trouvés pour la catégorie "${categoryName}"`);
    
    return filteredProducts;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    throw error;
  }
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

  const result = await response.json();
  // Extraire les catégories de la structure Strapi {data: [...]}
  return result.data || [];
}

