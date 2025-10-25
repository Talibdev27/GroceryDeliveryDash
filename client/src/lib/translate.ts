/**
 * Free translation utility using MyMemory Translation API
 * No API key required, 1000 words/day free tier
 */

export interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

/**
 * Translate text using MyMemory Translation API
 * @param text - Text to translate
 * @param from - Source language code (uz, en, ru)
 * @param to - Target language code (uz, en, ru)
 * @returns Promise with translation result
 */
export async function translateText(
  text: string, 
  from: string, 
  to: string
): Promise<TranslationResult> {
  try {
    if (!text || text.trim().length === 0) {
      return {
        translatedText: text,
        success: true
      };
    }

    // MyMemory API endpoint
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    
    console.log(`🌍 Translating: "${text}" from ${from} to ${to}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;
      console.log(`✅ Translation result: "${translatedText}"`);
      
      return {
        translatedText: translatedText,
        success: true
      };
    } else {
      throw new Error(`Translation API error: ${data.responseStatus}`);
    }
    
  } catch (error) {
    console.error('❌ Translation error:', error);
    return {
      translatedText: text, // Return original text if translation fails
      success: false,
      error: error instanceof Error ? error.message : 'Unknown translation error'
    };
  }
}

/**
 * Translate product information from Uzbek to English
 */
export async function translateProductToEnglish(product: {
  nameUz: string;
  descriptionUz: string;
  unitUz: string;
}): Promise<{
  name: string;
  description: string;
  unit: string;
}> {
  const [nameResult, descriptionResult, unitResult] = await Promise.all([
    translateText(product.nameUz, 'uz', 'en'),
    translateText(product.descriptionUz, 'uz', 'en'),
    translateText(product.unitUz, 'uz', 'en')
  ]);

  return {
    name: nameResult.translatedText,
    description: descriptionResult.translatedText,
    unit: unitResult.translatedText
  };
}

/**
 * Translate product information from Uzbek to Russian
 */
export async function translateProductToRussian(product: {
  nameUz: string;
  descriptionUz: string;
  unitUz: string;
}): Promise<{
  nameRu: string;
  descriptionRu: string;
  unitRu: string;
}> {
  const [nameResult, descriptionResult, unitResult] = await Promise.all([
    translateText(product.nameUz, 'uz', 'ru'),
    translateText(product.descriptionUz, 'uz', 'ru'),
    translateText(product.unitUz, 'uz', 'ru')
  ]);

  return {
    nameRu: nameResult.translatedText,
    descriptionRu: descriptionResult.translatedText,
    unitRu: unitResult.translatedText
  };
}

/**
 * Get product name based on current language
 */
export function getProductName(product: any, currentLanguage: string): string {
  switch (currentLanguage) {
    case 'ru': return product.nameRu || product.name;
    case 'uz': return product.nameUz || product.name;
    case 'es': return product.nameEs || product.name;
    case 'ar': return product.nameAr || product.name;
    default: return product.name;
  }
}

/**
 * Get product description based on current language
 */
export function getProductDescription(product: any, currentLanguage: string): string {
  switch (currentLanguage) {
    case 'ru': return product.descriptionRu || product.description;
    case 'uz': return product.descriptionUz || product.description;
    case 'es': return product.descriptionEs || product.description;
    case 'ar': return product.descriptionAr || product.description;
    default: return product.description;
  }
}

/**
 * Get product unit based on current language
 */
export function getProductUnit(product: any, currentLanguage: string): string {
  switch (currentLanguage) {
    case 'ru': return product.unitRu || product.unit;
    case 'uz': return product.unitUz || product.unit;
    case 'es': return product.unitEs || product.unit;
    case 'ar': return product.unitAr || product.unit;
    default: return product.unit;
  }
}
