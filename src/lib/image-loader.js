/**
 * Chargeur d'image personnalisé pour Cloudinary
 * Résout les problèmes de timeout et d'erreurs 500
 */

export default function cloudinaryLoader({ src, width, quality }) {
  // Vérifier si l'URL est valide
  if (!src) return '';

  // Gérer les URLs relatives (pour les images locales)
  if (src.startsWith('/')) {
    return src;
  }

  // Paramètres par défaut pour Cloudinary
  const params = ['f_auto', 'c_limit'];
  
  // Ajouter la largeur si spécifiée
  if (width) {
    params.push(`w_${width}`);
  }
  
  // Ajouter la qualité si spécifiée (par défaut 75%)
  if (quality) {
    params.push(`q_${quality}`);
  } else {
    params.push('q_75');
  }
  
  try {
    // Vérifier si l'URL est déjà une URL Cloudinary complète
    if (src.startsWith('https://res.cloudinary.com/')) {
      // Extraire les parties de l'URL Cloudinary
      const urlParts = src.split('/upload/');
      if (urlParts.length === 2) {
        // Reconstruire l'URL avec les nouveaux paramètres
        return `${urlParts[0]}/upload/${params.join(',')}/${urlParts[1]}`;
      }
    }
    
    // Fallback pour les images non-Cloudinary
    return src;
  } catch (error) {
    console.error('Erreur dans le chargeur d\'image:', error);
    return src;
  }
}