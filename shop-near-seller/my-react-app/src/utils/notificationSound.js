// Panel notification sound — Web Audio API se short 2-tone chime synthesize
// hota hai, koi audio file/asset nahi chahiye.
//
// Browser autoplay policy: bina user gesture ke AudioContext "suspended" rehta
// hai. Isliye pehle click/keydown par context unlock karte hain (installAudioUnlock),
// uske baad polling se aayi notification par sound baj sakti hai.

let ctx = null;
let unlocked = false;

const getCtx = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
};

/** Pehle user gesture par AudioContext resume — ek baar App/Header me call karo */
export const installAudioUnlock = () => {
  if (typeof window === "undefined") return () => {};
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
    unlocked = true;
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("click", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
  return unlock;
};

const tone = (c, freq, start, duration, gainPeak = 0.25) => {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
};

/**
 * "Ding-dong" jaisa chime. Return: true agar baji, false agar audio locked/unsupported.
 */
export const playNotificationSound = () => {
  const c = getCtx();
  if (!c) return false;
  if (c.state === "suspended") {
    // Gesture ke bina resume nahi hoga — chupchap skip
    if (!unlocked) return false;
    c.resume().catch(() => {});
  }
  try {
    const t = c.currentTime;
    tone(c, 880, t, 0.28); // A5
    tone(c, 1174.66, t + 0.16, 0.42); // D6
    return true;
  } catch {
    return false;
  }
};
