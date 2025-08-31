// Grocery Categorizer with WebLLM and TinyLlama
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

class GroceryCategorizer {
  constructor() {
    this.engine = null;
    this.categories = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async loadCategories() {
    try {
      const response = await fetch('./grocery_categories.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.categories = data.categories;
      this.keywordPatterns = data.rules.keyword_patterns;
      console.log('Categories loaded successfully:', Object.keys(this.categories).length, 'categories');
      return true;
    } catch (error) {
      console.error('Failed to load categories from JSON:', error);
      console.log('Using fallback categories');
      // Fallback categories if JSON fails to load
      this.categories = {
        dairy: { name: "Mejeri", emoji: "🥛", items: ["mjölk", "ost", "yoghurt", "smör", "grädde", "fil", "kvarg", "kefir", "crème fraiche"] },
        meat_fish: { name: "Kött & Fisk", emoji: "🥩", items: ["kött", "fisk", "kyckling", "lax", "korv", "bacon", "skinka", "fläsk", "nöt"] },
        fruits_vegetables: { name: "Frukt & Grönsaker", emoji: "🥬", items: ["äpple", "banan", "tomat", "gurka", "sallad", "paprika", "lök", "potatis", "morot"] },
        pantry: { name: "Skafferi", emoji: "🥫", items: ["mjöl", "socker", "pasta", "ris", "salt", "peppar", "olja", "vinäger"] },
        frozen: { name: "Frysvaror", emoji: "🧊", items: ["glass", "fryst", "frysta", "frys"] },
        household: { name: "Hushåll", emoji: "🧹", items: ["tvättmedel", "papper", "påse", "diskmedel", "toalettpapper"] }
      };
      
      // Fallback keyword patterns
      this.keywordPatterns = {
        dairy: ["mjölk", "ost", "yoghurt", "grädde", "smör"],
        meat_fish: ["kött", "fisk", "kyckling", "korv", "bacon"],
        fruits_vegetables: ["frukt", "grönsak", "sallad", "tomat"],
        pantry: ["mjöl", "socker", "krydd", "sås"],
        frozen: ["fryst", "frys", "glass"],
        household: ["tvätt", "disk", "städ", "papper"]
      };
      return false;
    }
  }

  async initialize() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        console.log('Initializing GroceryCategorizer...');
        
        // Load categories first
        await this.loadCategories();
        
        // Initialize WebLLM with TinyLlama
        console.log('Loading TinyLlama model...');
        this.engine = await CreateMLCEngine("TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC", {
          initProgressCallback: (progress) => {
            console.log(`Model loading: ${progress.text}`);
            // Dispatch event for UI progress indication
            window.dispatchEvent(new CustomEvent('llm-progress', { 
              detail: { progress: progress.progress, text: progress.text } 
            }));
          }
        });
        
        this.isInitialized = true;
        console.log('GroceryCategorizer initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize GroceryCategorizer:', error);
        this.isInitialized = false;
        return false;
      }
    })();
    
    return this.initPromise;
  }

  // Quick rule-based categorization
  quickCategorize(item) {
    if (!this.categories) {
      console.error('Categories not loaded!');
      return null;
    }
    
    const normalized = item.toLowerCase().trim();
    console.log(`Quick categorizing: "${normalized}"`);
    
    // Check exact matches first
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      if (category.items && category.items.some(i => i.toLowerCase() === normalized)) {
        console.log(`Found exact match in ${categoryKey}`);
        return {
          category: categoryKey,
          confidence: 1.0,
          method: 'exact'
        };
      }
    }
    
    // Check keyword patterns
    for (const [categoryKey, keywords] of Object.entries(this.keywordPatterns || {})) {
      for (const keyword of keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          return {
            category: categoryKey,
            confidence: 0.8,
            method: 'keyword'
          };
        }
      }
    }
    
    // Check partial matches
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      for (const categoryItem of category.items) {
        if (normalized.includes(categoryItem.toLowerCase()) || 
            categoryItem.toLowerCase().includes(normalized)) {
          return {
            category: categoryKey,
            confidence: 0.6,
            method: 'partial'
          };
        }
      }
    }
    
    return null;
  }

  // LLM-based categorization
  async categorizeLLM(item) {
    if (!this.isInitialized || !this.engine) {
      throw new Error('Categorizer not initialized');
    }

    const categoryList = Object.entries(this.categories)
      .map(([key, cat]) => `${key}: ${cat.name}`)
      .join(', ');

    const prompt = `You are a grocery categorizer. Categorize the following item into one of these categories: ${categoryList}.

Item: "${item}"

Respond with ONLY the category key (e.g., dairy, meat_fish, fruits_vegetables, etc.). Do not include any explanation.`;

    try {
      const response = await this.engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 10
      });

      const category = response.choices[0].message.content.trim().toLowerCase();
      
      // Validate the response
      if (this.categories[category]) {
        return {
          category,
          confidence: 0.9,
          method: 'llm'
        };
      }
      
      // If invalid response, return null
      return null;
    } catch (error) {
      console.error('LLM categorization failed:', error);
      return null;
    }
  }

  // Main categorization method
  async categorize(item) {
    if (!item || typeof item !== 'string') {
      return { category: 'pantry', confidence: 0, method: 'default' };
    }

    console.log(`Categorizing: "${item}"`);

    // Try quick categorization first
    const quickResult = this.quickCategorize(item);
    if (quickResult && quickResult.confidence >= 0.8) {
      console.log(`Quick categorization result:`, quickResult);
      return quickResult;
    }

    // If not initialized or quick result has low confidence, initialize and use LLM
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        // If initialization fails, return quick result or default
        return quickResult || { category: 'pantry', confidence: 0, method: 'default' };
      }
    }

    // Try LLM categorization
    try {
      const llmResult = await this.categorizeLLM(item);
      if (llmResult) {
        return llmResult;
      }
    } catch (error) {
      console.error('LLM categorization error:', error);
    }

    // Fall back to quick result or default
    return quickResult || { category: 'pantry', confidence: 0, method: 'default' };
  }

  // Get category info
  getCategoryInfo(categoryKey) {
    return this.categories[categoryKey] || {
      name: 'Övrigt',
      emoji: '📦'
    };
  }

  // Get all categories
  getAllCategories() {
    return Object.entries(this.categories).map(([key, cat]) => ({
      key,
      name: cat.name,
      emoji: cat.emoji
    }));
  }
}

// Export as global for use in index.html
window.GroceryCategorizer = GroceryCategorizer;

// Also export as ES module
export { GroceryCategorizer };