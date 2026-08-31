const SCRIPT_IDS = {
  tf: 'bbo-tfjs-runtime',
  model: 'bbo-esrgan-slim-2x-model',
  upscaler: 'bbo-upscaler-runtime',
};

const SCRIPT_URLS = {
  tf: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  model: 'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-slim@1.0.0/dist/umd/2x.min.js',
  upscaler: 'https://cdn.jsdelivr.net/npm/upscaler@1.0.0/dist/browser/umd/upscaler.min.js',
};

declare global {
  interface Window {
    tf?: any;
    Upscaler?: new (options: Record<string, any>) => any;
    ESRGANSlim2x?: any;
  }
}

let runtimePromise: Promise<void> | null = null;

function loadScript(id: string, src: string): Promise<void> {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === 'true') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = existing || document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';

    const handleLoad = () => {
      script.dataset.loaded = 'true';
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`Could not load free AI upscaler runtime: ${src}`));
    };
    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    if (!existing) document.head.appendChild(script);
  });
}

async function ensureRuntime(): Promise<void> {
  if (window.tf && window.Upscaler && window.ESRGANSlim2x) return;
  if (!runtimePromise) {
    runtimePromise = (async () => {
      await loadScript(SCRIPT_IDS.tf, SCRIPT_URLS.tf);
      await loadScript(SCRIPT_IDS.model, SCRIPT_URLS.model);
      await loadScript(SCRIPT_IDS.upscaler, SCRIPT_URLS.upscaler);

      if (!window.tf || !window.Upscaler || !window.ESRGANSlim2x) {
        throw new Error('Free ESRGAN runtime loaded incompletely.');
      }

      if (typeof window.tf.ready === 'function') await window.tf.ready();
    })().catch((error) => {
      runtimePromise = null;
      throw error;
    });
  }
  return runtimePromise;
}

export async function upscaleImage2x(imageSrc: string): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('AI upscaling is available only in the browser.');
  }
  if (!imageSrc) throw new Error('No image is selected for upscaling.');

  await ensureRuntime();
  const Upscaler = window.Upscaler;
  if (!Upscaler) throw new Error('AI upscaler is unavailable.');

  const upscaler = new Upscaler({ model: window.ESRGANSlim2x });
  try {
    const result = await upscaler.upscale(imageSrc, {
      output: 'base64',
      patchSize: 64,
      padding: 2,
    });
    if (typeof result !== 'string' || !result.startsWith('data:image/')) {
      throw new Error('AI upscaler returned an invalid image.');
    }
    return result;
  } finally {
    if (typeof upscaler.dispose === 'function') upscaler.dispose();
  }
}
