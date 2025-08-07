// lib/username.ts
const ADJECTIVES = [
  "Spicy","Salty","Greasy","Sneaky","Shadow","Turbo","Rugged","Jaded","DeFi",
  "Ape","Wagmi","Moon","Bearish","Bullish","Degenerate","Stinky","Giga","Turbo"
];

const ANIMALS = [
  "Unicorn","Llama","Penguin","Shark","Panda","Narwhal","Badger","Crab","Monkey",
  "Mongoose","Cobra","Cheetah","Falcon","Otter","Yak","Ferret","Dragon","Gopher"
];

// ultra-light, deterministic “hash”
function hashToInt(str: string) {
  let h = 2166136261 >>> 0; // FNV-ish
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeDegenUsername(address: string, with0xPrefix = true) {
  const addr = address.toLowerCase();
  const seed = hashToInt(addr);
  const adj = ADJECTIVES[seed % ADJECTIVES.length];
  const ani = ANIMALS[(seed >> 8) % ANIMALS.length];
  const last4 = addr.slice(-4);
  const prefix = with0xPrefix ? "0x" : "";
  return `${prefix}${adj}${ani}${last4}`;
}
