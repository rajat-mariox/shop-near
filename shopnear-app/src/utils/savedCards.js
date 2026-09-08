import AsyncStorage from '@react-native-async-storage/async-storage';

// Saved cards sirf device par (AsyncStorage) rakhte hain, aur sirf masked info:
// brand, last4, expiry, name. Poora card number ya CVV KABHI store nahi hota
// (PCI) — actual payment hamesha Razorpay ke secure card page se hi hoti hai.
const CARDS_KEY = 'saved_cards';

export const getSavedCards = async () => {
  try {
    const raw = await AsyncStorage.getItem(CARDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};

const writeCards = async (cards) => {
  try {
    await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    return true;
  } catch (e) {
    return false;
  }
};

// card: { brand, last4, expiry: 'MM/YY', name } -> saved card with id
export const addSavedCard = async (card) => {
  const cards = await getSavedCards();
  // Same card (last4 + expiry) dobara add ho to duplicate na bane
  const existing = cards.find(
    (c) => c.last4 === card.last4 && c.expiry === card.expiry,
  );
  if (existing) return { cards, card: existing, duplicate: true };
  const saved = { id: `${Date.now()}`, ...card };
  const next = [saved, ...cards];
  await writeCards(next);
  return { cards: next, card: saved, duplicate: false };
};

export const removeSavedCard = async (id) => {
  const cards = await getSavedCards();
  const next = cards.filter((c) => c.id !== id);
  await writeCards(next);
  return next;
};

/* ---------- Card number helpers ---------- */

export const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

// Brand detection from prefix (IIN ranges)
export const detectCardBrand = (number) => {
  const n = digitsOnly(number);
  if (!n) return '';
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(60|65|81|82|508|353|356)/.test(n)) return 'RuPay';
  if (/^(36|38|30[0-5])/.test(n)) return 'Diners';
  return 'Card';
};

// Amex: 4-6-5 (15 digits); baaki: 4-4-4-4 (16 digits)
export const formatCardNumber = (value) => {
  const brand = detectCardBrand(value);
  const max = brand === 'Amex' ? 15 : 16;
  const n = digitsOnly(value).slice(0, max);
  if (brand === 'Amex') {
    return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(' ');
  }
  return n.match(/.{1,4}/g)?.join(' ') || '';
};

export const formatExpiry = (value) => {
  const n = digitsOnly(value).slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
};

// Luhn checksum — typo wale numbers yahin pakde jaate hain
export const luhnValid = (number) => {
  const n = digitsOnly(number);
  if (n.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

// 'MM/YY' -> true agar month valid aur card abhi expire nahi hua
export const expiryValid = (expiry) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry || '');
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  if (year < curYear) return false;
  if (year === curYear && month < curMonth) return false;
  return true;
};
