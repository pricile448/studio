/**
 * Chargeur d'image personnalisé pour Cloudinary
 * Résout les problèmes de timeout et d'erreurs 500
 */

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function cloudinaryLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
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
  
  // Ajouter la qualité
  params.push(`q_${quality}`);
  
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