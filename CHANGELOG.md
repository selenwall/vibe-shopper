# Vibe Shopper Changelog

## Version 3.0.0 - TensorFlow Lite Edition (2024)

### 🎉 Major Changes

#### 🤖 TensorFlow Lite Categorization
- Replaced rule-based system with neural network
- Trained on 1000+ Swedish grocery items
- 10 categories (expanded from 8)
- ~200KB model size
- <50ms inference time

#### 📊 Improved Categories
- Added "Snacks & Godis" category
- Added "Hälsa & Skönhet" category
- Better frozen food detection
- Context-aware categorization

#### 🚀 Technical Improvements
- TensorFlow.js integration
- LSTM-based text classification
- Confidence scores for predictions
- Vocabulary-based tokenization

### 🔄 Migration from v2.0
- Removed WebLLM/TinyLlama dependency
- Removed spell correction (handled by model)
- Simplified categorization flow

---

## Version 2.0.0 - AI Edition (2024)

### 🎉 Nya funktioner

#### 🤖 AI-driven kategorisering
- Automatisk kategorisering av matvaror med TinyLlama 1.1B
- Hybrid-approach: Snabb regelbaserad + AI som backup
- 15 fördefinierade kategorier med över 1000 produkter
- Helt offline efter första nedladdningen

#### 📂 Manuell omkategorisering
- Hover över en vara för att se kategorimeny-knappen
- Klicka på 📂 för att ändra kategori
- Visuell indikation av nuvarande kategori

#### 🔍 Kategorifilter
- Filtrera visning efter specifika kategorier
- "Visa alla" knapp för att återställa
- Räknare visar antal varor per kategori
- Flera filter kan aktiveras samtidigt

#### 📊 Statistikvy
- Klicka på 📊 i headern för detaljerad statistik
- Se fördelning per kategori
- Visuella framstegsindikatorer
- Procentuell färdigställning

#### 📤 Export-funktion
- Exportera hela listan som textfil
- Organiserad efter kategorier
- Markering av färdiga varor
- Automatiskt datumstämplad filnamn

### 🔧 Tekniska förbättringar

#### WebLLM Integration
- TinyLlama 1.1B för intelligent kategorisering
- ~550MB modell som cachas lokalt
- Progressiv nedladdning med statusindikator
- Fallback till regelbaserad om AI inte är redo

#### Förbättrad arkitektur
- Modulär kategoriseringsmodul
- Optimerad rendering med kategorigruppering
- Effektiv filtrering utan om-rendering
- Behåller alla mobiloptimeringar från v1.x

### 📱 Bibehållna mobilfunktioner
- ✅ Swipe-to-delete
- ✅ Pull-to-refresh  
- ✅ PWA med offline-stöd
- ✅ Stora touch-targets (44px)
- ✅ Haptic feedback
- ✅ Safe area support

### 🐛 Kända begränsningar
- Första laddningen av AI-modellen tar 1-3 minuter
- Kräver ~2GB RAM för AI-funktioner
- Safari har begränsat stöd (använder fallback)

### 🚀 Uppgradering
1. Rensa cache (🗑️ knappen)
2. Ladda om sidan
3. Vänta på AI-modellen
4. Klart!

---

## Version 1.0.1 (Tidigare)
- Grundläggande shoppinglista
- Drag-and-drop
- PWA-stöd
- Mobiloptimerad