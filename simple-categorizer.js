// Simple categorizer that works without WebLLM
class SimpleCategorizer {
  constructor() {
    // Hardcoded categories for reliable categorization
    this.categories = {
      dairy: { 
        name: "Mejeri", 
        emoji: "🥛", 
        items: ["mjölk", "mellanmjölk", "lättmjölk", "standardmjölk", "ost", "yoghurt", "smör", "grädde", "fil", "kvarg", "kefir", "crème fraiche", "smetana", "cottage cheese"],
        keywords: ["mjölk", "ost", "yoghurt", "grädde", "smör", "fil"]
      },
      meat_fish: { 
        name: "Kött & Fisk", 
        emoji: "🥩", 
        items: ["kött", "fisk", "kyckling", "lax", "korv", "bacon", "skinka", "fläsk", "nöt", "köttfärs", "köttbullar", "hamburgare", "biff", "kotlett", "fläskfilé", "kycklingfilé", "torsk", "sej"],
        keywords: ["kött", "fisk", "kyckling", "korv", "bacon", "fläsk", "nöt"]
      },
      fruits_vegetables: { 
        name: "Frukt & Grönsaker", 
        emoji: "🥬", 
        items: ["äpple", "banan", "tomat", "gurka", "sallad", "paprika", "lök", "potatis", "morot", "apelsin", "päron", "druvor", "jordgubbar", "blåbär", "hallon", "citron", "lime", "avokado", "broccoli", "blomkål"],
        keywords: ["frukt", "grönsak", "sallad", "tomat", "bär"]
      },
      pantry: { 
        name: "Skafferi", 
        emoji: "🥫", 
        items: ["mjöl", "socker", "pasta", "ris", "salt", "peppar", "olja", "vinäger", "konserver", "sylt", "honung", "kryddor", "buljong", "sås", "ketchup", "senap"],
        keywords: ["mjöl", "socker", "krydd", "sås", "pasta", "ris"]
      },
      bread_bakery: {
        name: "Bröd & Bakverk",
        emoji: "🥖",
        items: ["bröd", "limpa", "fralla", "baguette", "knäckebröd", "kex", "kakor", "bulle", "croissant", "toast", "pitabröd", "tunnbröd"],
        keywords: ["bröd", "bulle", "kaka", "kex"]
      },
      frozen: { 
        name: "Frysvaror", 
        emoji: "🧊", 
        items: ["glass", "fryst", "frysta", "frys", "fryspizza", "frysgrönsaker", "fryst fisk", "glasspinnar"],
        keywords: ["fryst", "frys", "glass"]
      },
      beverages: {
        name: "Drycker",
        emoji: "🥤",
        items: ["juice", "läsk", "vatten", "öl", "vin", "kaffe", "te", "saft", "cola", "sprite", "fanta", "mineralvatten"],
        keywords: ["dryck", "juice", "läsk", "saft", "öl", "vin"]
      },
      household: { 
        name: "Hushåll", 
        emoji: "🧹", 
        items: ["tvättmedel", "papper", "påse", "diskmedel", "toalettpapper", "hushållspapper", "soppåsar", "fryspåsar", "plastfolie", "aluminiumfolie"],
        keywords: ["tvätt", "disk", "städ", "papper", "påse"]
      }
    };
  }

  categorize(item) {
    if (!item || typeof item !== 'string') {
      return { category: 'pantry', confidence: 0, method: 'default' };
    }

    const normalized = item.toLowerCase().trim();
    
    // Check exact matches
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      if (category.items.some(i => i.toLowerCase() === normalized)) {
        return {
          category: categoryKey,
          confidence: 1.0,
          method: 'exact'
        };
      }
    }
    
    // Check if item contains category keywords
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      for (const keyword of category.keywords) {
        if (normalized.includes(keyword)) {
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
    
    // Default to pantry
    return { category: 'pantry', confidence: 0.1, method: 'default' };
  }

  getCategoryInfo(categoryKey) {
    return this.categories[categoryKey] || {
      name: 'Övrigt',
      emoji: '📦'
    };
  }

  getAllCategories() {
    return Object.entries(this.categories).map(([key, cat]) => ({
      key,
      name: cat.name,
      emoji: cat.emoji
    }));
  }
}

// Export for use
window.SimpleCategorizer = SimpleCategorizer;