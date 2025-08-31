# AI-kategorisering med WebLLM och TinyLlama

## Översikt

Vibe Shopper använder nu AI-driven kategorisering för att automatiskt sortera matvaror i lämpliga kategorier. Systemet använder:

- **WebLLM** - För att köra AI-modeller direkt i webbläsaren
- **TinyLlama 1.1B** - En kompakt men kraftfull språkmodell
- **Hybrid-approach** - Kombinerar regelbaserad och AI-baserad kategorisering

## Hur det fungerar

### 1. Första gången
När appen startar första gången:
1. WebLLM laddar ner TinyLlama-modellen (~550MB)
2. Detta tar 1-3 minuter beroende på internetuppkoppling
3. Modellen cachas lokalt för framtida användning
4. En laddningsindikator visas under nedladdningen

### 2. Kategoriseringsprocess
När du lägger till en vara:
1. **Snabb regelbaserad kontroll** - Matchar exakta ord och nyckelord
2. **AI-kategorisering** - Om ingen exakt match, använder TinyLlama
3. **Fallback** - Om AI inte är redo, används standardkategori

### 3. Kategorier
Appen använder 15 huvudkategorier:
- 🥛 Mejeri
- 🥖 Bröd & Bakverk
- 🥩 Kött & Fisk
- 🥬 Frukt & Grönsaker
- 🥫 Skafferi & Torrvaror
- 🧊 Frysvaror
- 🥤 Drycker
- 🍿 Snacks & Godis
- 🧹 Hushållsartiklar
- 👶 Barn & Baby
- 💊 Hälsa & Apotek
- 🧂 Kryddor & Såser
- 🧁 Bakning
- 🌍 Internationellt
- 🐾 Djurmat & Tillbehör

## Tekniska detaljer

### Modellstorlek
- **TinyLlama**: ~550MB nedladdning
- Cachas i webbläsaren efter första nedladdningen
- Kräver ~2GB RAM för att köra

### Prestanda
- **Första kategoriseringen**: 2-5 sekunder (modell laddas)
- **Efterföljande**: 100-500ms per vara
- **Regelbaserad**: <10ms (för kända varor)

### Kompatibilitet
- **Chrome/Edge**: Full support
- **Firefox**: Experimentellt stöd
- **Safari**: Begränsat stöd (använder fallback)
- **Mobil**: Fungerar men kräver mycket minne

## Felsökning

### "AI-modellen laddar inte"
1. Kontrollera internetanslutningen
2. Töm webbläsarcachen och försök igen
3. Modellen kan vara för stor för enheten

### "Fel kategorisering"
AI:n lär sig från kontexten i `grocery_categories.json`. Du kan:
1. Lägga till fler exempel i JSON-filen
2. Rapportera fel kategoriseringar för förbättring

### "För långsam"
1. Första gången tar längre tid (modellen laddas)
2. På svagare enheter, överväg att inaktivera AI
3. Regelbaserad kategorisering är alltid snabb

## Utveckling

### Byta AI-modell
I `categorizer.js`, ändra modellnamnet:
```javascript
this.engine = await CreateMLCEngine("MODEL_NAME_HERE", {
  // ... options
});
```

### Anpassa kategorier
Redigera `grocery_categories.json` för att:
- Lägga till nya kategorier
- Utöka produktlistor
- Justera nyckelordsmönster

### Inaktivera AI
För att endast använda regelbaserad kategorisering:
```javascript
// I categorizer.js, kommentera bort:
// await this.initialize();
```

## Privacy

- All AI-processing sker **lokalt i din webbläsare**
- Ingen data skickas till externa servrar
- Modellen laddas ner en gång och cachas lokalt
- Dina shoppinglistor förblir privata