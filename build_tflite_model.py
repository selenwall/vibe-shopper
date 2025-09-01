#!/usr/bin/env python3
"""
Build a TensorFlow Lite model for grocery categorization
"""

import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import re

def load_training_data():
    """Load and preprocess training data"""
    with open('grocery_training_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    texts = []
    labels = []
    
    for item in data['items']:
        texts.append(item['text'])
        labels.append(item['category'])
    
    return texts, labels, data['categories']

def create_vocabulary(texts, max_vocab_size=5000):
    """Create a vocabulary from texts"""
    # Simple tokenization
    word_counts = {}
    for text in texts:
        words = text.lower().split()
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
    
    # Sort by frequency
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Create vocabulary
    vocab = {'<PAD>': 0, '<UNK>': 1}
    for i, (word, _) in enumerate(sorted_words[:max_vocab_size-2]):
        vocab[word] = i + 2
    
    return vocab

def text_to_sequence(text, vocab, max_length=20):
    """Convert text to sequence of integers"""
    words = text.lower().split()
    sequence = [vocab.get(word, vocab['<UNK>']) for word in words]
    
    # Pad or truncate
    if len(sequence) < max_length:
        sequence += [vocab['<PAD>']] * (max_length - len(sequence))
    else:
        sequence = sequence[:max_length]
    
    return sequence

def create_model(vocab_size, num_categories, embedding_dim=64, max_length=20):
    """Create a simple LSTM model for text classification"""
    model = models.Sequential([
        layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
        layers.LSTM(64, dropout=0.5),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_categories, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def export_to_tflite(model, vocab, label_encoder, categories):
    """Export model to TensorFlow Lite format"""
    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    
    # Save the model
    with open('grocery_classifier.tflite', 'wb') as f:
        f.write(tflite_model)
    
    # Save metadata
    metadata = {
        'vocab': vocab,
        'labels': label_encoder.classes_.tolist(),
        'categories': categories,
        'max_length': 20,
        'version': '1.0'
    }
    
    with open('model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"Model saved to grocery_classifier.tflite ({len(tflite_model) / 1024:.1f} KB)")
    print(f"Metadata saved to model_metadata.json")

def main():
    # Load data
    print("Loading training data...")
    texts, labels, categories = load_training_data()
    print(f"Loaded {len(texts)} training examples")
    
    # Create vocabulary
    print("Creating vocabulary...")
    vocab = create_vocabulary(texts)
    vocab_size = len(vocab)
    print(f"Vocabulary size: {vocab_size}")
    
    # Encode labels
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)
    num_categories = len(label_encoder.classes_)
    print(f"Number of categories: {num_categories}")
    
    # Convert texts to sequences
    print("Converting texts to sequences...")
    X = np.array([text_to_sequence(text, vocab) for text in texts])
    y = np.array(encoded_labels)
    
    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Create and train model
    print("Creating model...")
    model = create_model(vocab_size, num_categories)
    model.summary()
    
    print("\nTraining model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=20,
        batch_size=32,
        verbose=1
    )
    
    # Evaluate
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\nValidation accuracy: {val_acc:.3f}")
    
    # Export to TFLite
    print("\nExporting to TensorFlow Lite...")
    export_to_tflite(model, vocab, label_encoder, categories)
    
    # Test the exported model
    print("\nTesting exported model...")
    test_tflite_model()

def test_tflite_model():
    """Test the exported TFLite model"""
    # Load model
    interpreter = tf.lite.Interpreter(model_path="grocery_classifier.tflite")
    interpreter.allocate_tensors()
    
    # Get input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Load metadata
    with open('model_metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    vocab = metadata['vocab']
    labels = metadata['labels']
    
    # Test items
    test_items = [
        "mjölk",
        "fryst lax",
        "fullkornsbröd",
        "äpple",
        "tvättmedel"
    ]
    
    print("\nTest predictions:")
    for item in test_items:
        # Convert to sequence
        sequence = text_to_sequence(item, vocab)
        input_data = np.array([sequence], dtype=np.float32)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        
        # Get prediction
        output_data = interpreter.get_tensor(output_details[0]['index'])
        predicted_idx = np.argmax(output_data[0])
        predicted_category = labels[predicted_idx]
        confidence = output_data[0][predicted_idx]
        
        print(f"{item} -> {predicted_category} ({confidence:.2f})")

if __name__ == "__main__":
    main()