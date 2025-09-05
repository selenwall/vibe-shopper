/* Lightweight AI categorization helper
   - Tries TFLite model at ./models/grocery-categorizer.tflite (if present)
   - Falls back to Transformers.js zero-shot classification (Xenova/nli-deberta-v3-xsmall)
   - If neither is available, returns null and caller should use heuristics
*/
(function(){
  const AI_STATE = {
    initialized: false,
    initializing: null,
    provider: 'none', // 'tflite' | 'transformers' | 'none'
    tflite: null,
    tfliteModel: null,
    zscPipeline: null,
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  async function tryInitTFLite() {
    // Requires a local TFLite model to be present at ./models/grocery-categorizer.tflite
    try {
      // Load TFLite runtime via CDN
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tflite/dist/tflite.min.js');
      if (!window.tflite) return false;
      const modelUrl = './models/grocery-categorizer.tflite';
      const resp = await fetch(modelUrl, { method: 'HEAD' });
      if (!resp.ok) return false;
      const model = await window.tflite.loadTFLiteModel(modelUrl);
      AI_STATE.tflite = window.tflite;
      AI_STATE.tfliteModel = model;
      AI_STATE.provider = 'tflite';
      return true;
    } catch (e) {
      return false;
    }
  }

  async function tryInitTransformers() {
    try {
      if (!(window as any).transformers) {
        await loadScript('https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js');
      }
      const tfs = (window as any).transformers;
      if (!tfs) return false;
      const pipeline = await tfs.pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');
      AI_STATE.zscPipeline = pipeline;
      AI_STATE.provider = 'transformers';
      return true;
    } catch (e) {
      return false;
    }
  }

  async function init() {
    if (AI_STATE.initialized) return true;
    if (AI_STATE.initializing) return AI_STATE.initializing;
    AI_STATE.initializing = (async () => {
      // Prefer local TFLite if available
      if (await tryInitTFLite()) {
        AI_STATE.initialized = true;
        return true;
      }
      // Fallback to transformers zero-shot
      if (await tryInitTransformers()) {
        AI_STATE.initialized = true;
        return true;
      }
      AI_STATE.provider = 'none';
      AI_STATE.initialized = true;
      return false;
    })();
    return AI_STATE.initializing;
  }

  function getProvider() { return AI_STATE.provider; }

  // Suggest a category key from provided labels
  // labels: [{ key: 'mejeri', label: 'Mejeri' }, ...]
  async function suggestCategory(text, labels) {
    await init();
    if (!text || !labels || labels.length === 0) return null;

    // TFLite path: depends on how the model expects inputs/outputs.
    // Attempt to use SignatureRunner if available. Supports models with string text input.
    if (AI_STATE.provider === 'tflite' && AI_STATE.tfliteModel) {
      try {
        const model = AI_STATE.tfliteModel;
        let runner = model.createSignatureRunner ? model.createSignatureRunner() : null;
        // If multiple signatures are supported, try default names
        if (!runner && model.createSignatureRunner) {
          const candidateSigs = ['serving_default', 'signature', 'classify', 'predict'];
          for (const sig of candidateSigs) {
            try { runner = model.createSignatureRunner(sig); break; } catch (_) {}
          }
        }
        if (runner && runner.inputNames && runner.inputNames.length >= 1) {
          // Use first input by default
          const inputName = runner.inputNames[0];
          const feeds = {};
          feeds[inputName] = text;
          const outputs = runner.run(feeds);
          // Try common output conventions
          // Case 1: outputs contains {labels: string[], scores: Float32Array}
          if (outputs && outputs.labels && outputs.scores) {
            const labelsOut = Array.from(outputs.labels);
            const scoresOut = Array.from(outputs.scores);
            // Map model labels to our target labels by exact or includes match
            let bestKey = null;
            let bestScore = -Infinity;
            for (let i = 0; i < labelsOut.length; i++) {
              const modelLabel = String(labelsOut[i]).toLowerCase();
              const score = scoresOut[i] ?? Number.NEGATIVE_INFINITY;
              for (const l of labels) {
                const target = l.label.toLowerCase();
                if (modelLabel === target || modelLabel.includes(target) || target.includes(modelLabel)) {
                  if (score > bestScore) { bestScore = score; bestKey = l.key; }
                }
              }
            }
            if (bestKey) return bestKey;
          }
          // Case 2: single Float32Array output representing logits aligned with provided labels
          const outputKeys = outputs ? Object.keys(outputs) : [];
          if (outputKeys.length === 1 && ArrayBuffer.isView(outputs[outputKeys[0]])) {
            const scores = Array.from(outputs[outputKeys[0]]);
            if (scores.length === labels.length) {
              let maxIdx = 0; let maxVal = -Infinity;
              for (let i = 0; i < scores.length; i++) { if (scores[i] > maxVal) { maxVal = scores[i]; maxIdx = i; } }
              return labels[maxIdx].key;
            }
          }
          // Case 3: dictionary of class->score
          if (outputs && typeof outputs === 'object' && !Array.isArray(outputs)) {
            let bestKey = null; let bestScore = -Infinity;
            for (const l of labels) {
              for (const [k,v] of Object.entries(outputs)) {
                const keyLower = k.toLowerCase();
                const target = l.label.toLowerCase();
                if (keyLower === target || keyLower.includes(target) || target.includes(keyLower)) {
                  const score = typeof v === 'number' ? v : (Array.isArray(v) ? v[0] : Number.NEGATIVE_INFINITY);
                  if (score > bestScore) { bestScore = score; bestKey = l.key; }
                }
              }
            }
            if (bestKey) return bestKey;
          }
        }
      } catch (_) { /* fall through to transformers */ }
    }

    if (AI_STATE.provider === 'transformers' && AI_STATE.zscPipeline) {
      try {
        const candidateLabels = labels.map(l => l.label);
        const res = await AI_STATE.zscPipeline(text, candidateLabels, {
          multi_label: false,
          hypothesis_template: 'Detta handlar om {label}.',
        });
        if (res && res.labels && res.labels.length) {
          const topLabel = res.labels[0];
          const match = labels.find(l => l.label === topLabel);
          return match ? match.key : null;
        }
      } catch (_) {}
    }
    return null;
  }

  (window as any).AI = { init, suggestCategory, getProvider };
})();

