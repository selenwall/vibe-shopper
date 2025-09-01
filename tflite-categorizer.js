// TensorFlow Lite based categorizer for groceries
class TFLiteCategorizer {
  constructor() {
    this.model = null;
    this.metadata = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing TFLite categorizer...');
      
      // Load TensorFlow.js with TFLite backend
      if (typeof tf === 'undefined') {
        await this.loadTensorFlowJS();
      }
      
      // Load metadata
      const metadataResponse = await fetch('./model_metadata.json');
      this.metadata = await metadataResponse.json();
      console.log('Model metadata loaded');
      
      // Load TFLite model
      this.model = await tflite.loadTFLiteModel('./grocery_classifier.tflite');
      console.log('TFLite model loaded');
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize TFLite categorizer:', error);
      return false;
    }
  }

  async loadTensorFlowJS() {
    // Dynamically load TensorFlow.js and TFLite
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
    document.head.appendChild(script1);
    
    await new Promise(resolve => {
      script1.onload = resolve;
    });
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.10/dist/tf-tflite.min.js';
    document.head.appendChild(script2);
    
    await new Promise(resolve => {
      script2.onload = resolve;
    });
  }

  textToSequence(text, maxLength = 20) {
    const words = text.toLowerCase().split(' ');
    const vocab = this.metadata.vocab;
    const sequence = [];
    
    // Convert words to indices
    for (const word of words) {
      if (vocab[word]) {
        sequence.push(vocab[word]);
      } else {
        sequence.push(vocab['<UNK>'] || 1);
      }
    }
    
    // Pad or truncate
    while (sequence.length < maxLength) {
      sequence.push(vocab['<PAD>'] || 0);
    }
    
    return sequence.slice(0, maxLength);
  }

  async categorize(text) {
    if (!this.isInitialized) {
      console.error('TFLite categorizer not initialized');
      return {
        category: 'pantry',
        confidence: 0,
        method: 'default'
      };
    }

    try {
      // Convert text to sequence
      const sequence = this.textToSequence(text);
      const input = tf.tensor2d([sequence], [1, this.metadata.max_length]);
      
      // Run inference
      const output = this.model.predict(input);
      const predictions = await output.data();
      
      // Get best prediction
      let maxScore = -1;
      let bestIndex = 0;
      
      for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxScore) {
          maxScore = predictions[i];
          bestIndex = i;
        }
      }
      
      const category = this.metadata.labels[bestIndex];
      
      // Clean up tensors
      input.dispose();
      output.dispose();
      
      return {
        category: category,
        confidence: maxScore,
        method: 'tflite'
      };
    } catch (error) {
      console.error('Categorization failed:', error);
      return {
        category: 'pantry',
        confidence: 0,
        method: 'error'
      };
    }
  }

  getCategoryInfo(categoryKey) {
    const categoryNames = {
      'dairy': { name: 'Mejeri', emoji: '🥛' },
      'meat_fish': { name: 'Kött & Fisk', emoji: '🥩' },
      'fruits_vegetables': { name: 'Frukt & Grönsaker', emoji: '🥬' },
      'bread_bakery': { name: 'Bröd & Bakverk', emoji: '🥖' },
      'pantry': { name: 'Skafferi', emoji: '🥫' },
      'frozen': { name: 'Frysvaror', emoji: '🧊' },
      'beverages': { name: 'Drycker', emoji: '🥤' },
      'snacks_candy': { name: 'Snacks & Godis', emoji: '🍿' },
      'household': { name: 'Hushållsartiklar', emoji: '🧹' },
      'health_beauty': { name: 'Hälsa & Skönhet', emoji: '💊' }
    };
    
    return categoryNames[categoryKey] || {
      name: 'Övrigt',
      emoji: '📦'
    };
  }

  getAllCategories() {
    const categories = [
      { key: 'dairy', name: 'Mejeri', emoji: '🥛' },
      { key: 'meat_fish', name: 'Kött & Fisk', emoji: '🥩' },
      { key: 'fruits_vegetables', name: 'Frukt & Grönsaker', emoji: '🥬' },
      { key: 'bread_bakery', name: 'Bröd & Bakverk', emoji: '🥖' },
      { key: 'pantry', name: 'Skafferi', emoji: '🥫' },
      { key: 'frozen', name: 'Frysvaror', emoji: '🧊' },
      { key: 'beverages', name: 'Drycker', emoji: '🥤' },
      { key: 'snacks_candy', name: 'Snacks & Godis', emoji: '🍿' },
      { key: 'household', name: 'Hushållsartiklar', emoji: '🧹' },
      { key: 'health_beauty', name: 'Hälsa & Skönhet', emoji: '💊' }
    ];
    
    return categories;
  }
}

// Export for use
window.TFLiteCategorizer = TFLiteCategorizer;