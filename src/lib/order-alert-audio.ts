let audioContext: AudioContext | null = null;
let alertBuffer: AudioBuffer | null = null;
let alertBufferPromise: Promise<AudioBuffer> | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function loadAlertBuffer(context: AudioContext) {
  if (alertBuffer) return Promise.resolve(alertBuffer);

  alertBufferPromise ??= fetch("/new-order-alert.mp3?v=male-2", { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Alert audio request failed: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      alertBuffer = buffer;
      return buffer;
    })
    .catch((error) => {
      alertBufferPromise = null;
      throw error;
    });

  return alertBufferPromise;
}

export function unlockOrderAlertAudio() {
  try {
    if (typeof window === "undefined") return;
    audioContext ??= new AudioContext();
    const context = audioContext;

    if (context.state === "suspended") void context.resume();

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0;
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(gain);
    gain.connect(context.destination);
    source.start();

    void loadAlertBuffer(context).catch((error) => {
      console.warn("Order announcement preload failed:", error);
    });
  } catch (error) {
    console.warn("Order announcement unlock failed:", error);
  }
}

export async function playOrderAlertSound() {
  try {
    const context = audioContext;
    if (!context) return;

    if (context.state === "suspended") await context.resume();
    const buffer = await loadAlertBuffer(context);

    currentSource?.stop();

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = 1;
    source.connect(gain);
    gain.connect(context.destination);
    source.addEventListener("ended", () => {
      if (currentSource === source) currentSource = null;
    });
    currentSource = source;
    source.start();
  } catch (error) {
    console.warn("Order announcement failed:", error);
  }
}
