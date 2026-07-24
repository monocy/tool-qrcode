const ToolWorkspace = {
  props: {
    settings: { type: Object, required: true },
    translations: { type: Object, required: true }
  },
  template: `
    <!-- QR Code Body -->
    <div class="w-full glass-panel p-6 sm:p-10 rounded-3xl neon-shadow flex flex-col relative overflow-hidden max-w-lg">
      <!-- Input Field -->
      <div class="flex flex-col gap-2 mb-8 w-full">
        <label class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{{ t('input_label') }}</label>
        <textarea v-model="inputText" @input="debouncedGenerate"
                  rows="3"
                  :placeholder="t('input_placeholder')"
                  class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:border-[var(--accent-color)] resize-none transition text-sm sm:text-base"></textarea>
      </div>

      <!-- Generated QR Code Display -->
      <div class="flex flex-col items-center justify-center py-4 bg-[var(--bg-card)]/30 rounded-2xl border border-slate-900/50 w-full">
        <div class="relative p-4 bg-[var(--bg-card)] rounded-2xl shadow-xl flex items-center justify-center min-w-[200px] min-h-[200px]"
             :class="{ 'opacity-30': !inputText }">
          <div id="qrcode-container"></div>
          <div v-if="!inputText" class="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-xs text-center p-4">
            {{ t('waiting_for_input') }}
          </div>
        </div>

        <div v-if="inputText" class="mt-6 flex gap-4 w-full px-6 max-w-sm justify-center">
          <button @click="downloadQR"
                  class="flex-1 text-[var(--text-main)] font-extrabold py-3 px-4 rounded-xl hover:brightness-110 active:scale-95 transition text-sm flex justify-center items-center gap-1"
                  :style="{ background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)', color: settings.theme === 'light' ? '#ffffff' : '#0b0f19', boxShadow: 'var(--accent-glow-intensity)' }">
            {{ t('download') }}
          </button>
          <button @click="clear"
                  class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-3 px-4 rounded-xl active:scale-95 transition text-sm">
            {{ t('clear') }}
          </button>
        </div>
      </div>
    </div>
  `,
  setup(props) {
    const { ref, onMounted, nextTick } = Vue;

    const t = (key, fallback = '') => {
      const parts = key.split('.');
      const currentLang = props.settings.lang;
      const trans = props.translations ? (props.translations.value || props.translations) : {};
      let current = trans[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    };

    const inputText = ref('https://free-web-tools.example.com');
    let qrcodeInstance = null;
    let debounceTimer = null;

    const generateQR = () => {
      const container = document.getElementById('qrcode-container');
      if (!container) return;

      container.innerHTML = '';

      if (!inputText.value.trim()) {
        return;
      }

      try {
        qrcodeInstance = new QRCode(container, {
          text: inputText.value,
          width: 180,
          height: 180,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch (err) {
        console.error('QR code generation failed:', err);
      }
    };

    const debouncedGenerate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(generateQR, 200);
    };

    const clear = () => {
      inputText.value = '';
      const container = document.getElementById('qrcode-container');
      if (container) container.innerHTML = '';
    };

    const downloadQR = () => {
      const container = document.getElementById('qrcode-container');
      if (!container) return;

      const img = container.querySelector('img');
      if (!img || !img.src) {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          triggerDownload(url);
        }
        return;
      }
      triggerDownload(img.src);
    };

    const triggerDownload = (dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    onMounted(() => {
      nextTick(() => {
        generateQR();
      });
    });

    return {
      t,
      inputText,
      debouncedGenerate,
      clear,
      downloadQR
    };
  }
};
