// Simple categorizer that works without WebLLM
class SimpleCategorizer {
  constructor() {
    // Common misspellings and variations
    this.spellCorrections = {
      // Mejeri
      "mjök": "mjölk",
      "mjolk": "mjölk",
      "mjölken": "mjölk",
      "mlök": "mjölk",
      "jogurt": "yoghurt",
      "yogurt": "yoghurt",
      "youghurt": "yoghurt",
      "gradde": "grädde",
      "gräde": "grädde",
      "smörr": "smör",
      "smorr": "smör",
      "ossst": "ost",
      
      // Kött & Fisk
      "kycling": "kyckling",
      "kykling": "kyckling",
      "kötfärs": "köttfärs",
      "kotfars": "köttfärs",
      "fläskkött": "fläsk",
      "flaskkott": "fläsk",
      "laxfile": "laxfilé",
      "korvv": "korv",
      "baacon": "bacon",
      "bacoon": "bacon",
      
      // Frukt & Grönsaker
      "äple": "äpple",
      "apple": "äpple",
      "aplen": "äpple",
      "bannan": "banan",
      "bananer": "banan",
      "tomater": "tomat",
      "tomatr": "tomat",
      "gurkor": "gurka",
      "salad": "sallad",
      "sallat": "sallad",
      "paprikka": "paprika",
      "paprica": "paprika",
      "lökk": "lök",
      "morotter": "morot",
      "morötter": "morot",
      "potatiss": "potatis",
      "potatisar": "potatis",
      
      // Skafferi
      "mjoll": "mjöl",
      "mjol": "mjöl",
      "sockeer": "socker",
      "sockr": "socker",
      "paasta": "pasta",
      "spagetti": "spaghetti",
      "spageti": "spaghetti",
      "riis": "ris",
      "sallt": "salt",
      "pepppar": "peppar",
      "pepar": "peppar",
      "ollja": "olja",
      "olivolja": "olja",
      
      // Bröd
      "brödd": "bröd",
      "brod": "bröd",
      "knäckebrödd": "knäckebröd",
      "knäcke": "knäckebröd",
      "bulllar": "bulle",
      "bullar": "bulle",
      "kaakor": "kakor",
      "kaaka": "kaka",
      
      // Drycker
      "juise": "juice",
      "juce": "juice",
      "läskk": "läsk",
      "lask": "läsk",
      "kaffe": "kaffe",
      "kafe": "kaffe",
      "thee": "te",
      "öll": "öl",
      
      // Hushåll
      "tvätmedel": "tvättmedel",
      "tvatmedel": "tvättmedel",
      "diskmedell": "diskmedel",
      "toalettpapper": "toalettpapper",
      "toapapper": "toalettpapper",
      "hushållspapper": "hushållspapper",
      "hushålspapper": "hushållspapper",
      
      // Pluralformer som singularis
      "äpplen": "äpple",
      "päron": "päron",
      "morötter": "morot",
      "potatisar": "potatis",
      "tomater": "tomat",
      "gurkor": "gurka",
      "limpor": "limpa",
      "ostar": "ost",
      "mjölkar": "mjölk",
      "bröder": "bröd",
      
      // Engelska till svenska
      "milk": "mjölk",
      "bread": "bröd",
      "cheese": "ost",
      "butter": "smör",
      "eggs": "ägg",
      "chicken": "kyckling",
      "beef": "nötkött",
      "pork": "fläsk",
      "fish": "fisk",
      "salmon": "lax",
      "apple": "äpple",
      "banana": "banan",
      "orange": "apelsin",
      "tomato": "tomat",
      "potato": "potatis",
      "onion": "lök",
      "carrot": "morot",
      "sugar": "socker",
      "flour": "mjöl",
      "rice": "ris",
      "pasta": "pasta",
      "coffee": "kaffe",
      "tea": "te",
      "juice": "juice",
      "water": "vatten",
      
      // Mer vanliga felstavningar
      "äggg": "ägg",
      "agg": "ägg",
      "melk": "mjölk",
      "mölk": "mjölk",
      "brød": "bröd",
      "fisk": "fisk",
      "kylling": "kyckling",
      "løk": "lök",
      "luk": "lök",
      "gulrot": "morot",
      "eple": "äpple",
      "appelsin": "apelsin",
      "sukker": "socker"
    };
    
    // Hardcoded categories for reliable categorization
    this.categories = {
      dairy: { 
        name: "Mejeri", 
        emoji: "🥛", 
        items: ["mjölk", "mellanmjölk", "lättmjölk", "standardmjölk", "ost", "yoghurt", "smör", "grädde", "fil", "kvarg", "kefir", "crème fraiche", "smetana", "cottage cheese", "ägg"],
        keywords: ["mjölk", "ost", "yoghurt", "grädde", "smör", "fil", "ägg"]
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

  // Spell correction method
  correctSpelling(word) {
    const normalized = word.toLowerCase().trim();
    
    // Check if it needs correction
    if (this.spellCorrections[normalized]) {
      return {
        corrected: this.spellCorrections[normalized],
        original: word,
        wasCorrect: false
      };
    }
    
    // Check for common typos with Levenshtein distance for simple cases
    // For now, just return as-is if no exact match in corrections
    return {
      corrected: word,
      original: word,
      wasCorrect: true
    };
  }

  categorize(item) {
    if (!item || typeof item !== 'string') {
      return { category: 'pantry', confidence: 0, method: 'default' };
    }

    // First, try to correct spelling
    const spellCheck = this.correctSpelling(item);
    const normalized = spellCheck.corrected.toLowerCase().trim();
    
    if (!spellCheck.wasCorrect) {
      console.log(`Rättstavning: "${item}" → "${spellCheck.corrected}"`);
    }
    
    // Check exact matches
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      if (category.items.some(i => i.toLowerCase() === normalized)) {
        return {
          category: categoryKey,
          confidence: 1.0,
          method: 'exact',
          correctedText: spellCheck.wasCorrect ? null : spellCheck.corrected
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
            method: 'keyword',
            correctedText: spellCheck.wasCorrect ? null : spellCheck.corrected
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
            method: 'partial',
            correctedText: spellCheck.wasCorrect ? null : spellCheck.corrected
          };
        }
      }
    }
    
    // Default to pantry
    return { 
      category: 'pantry', 
      confidence: 0.1, 
      method: 'default',
      correctedText: spellCheck.wasCorrect ? null : spellCheck.corrected
    };
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