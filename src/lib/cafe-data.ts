/**
 * NOIRÉ — shared cafe data model.
 * Single source of truth for the site menu, the cart, and the KDS feed.
 */

export type Category = "espresso" | "brews" | "patisserie";

export type Station = "BAR" | "KITCHEN";

export interface MenuItem {
  id: string;
  name: string;
  note: string;
  price: number;
  tag?: string;
  category: Category;
  station: Station;
  /** image used by cursor-follow previews */
  image: string;
}

export const MENU: MenuItem[] = [
  // ——— Espresso Bar ———
  { id: "noir", name: "The Noir", note: "Double ristretto, cocoa nib, sea salt", price: 4.5, tag: "House icon", category: "espresso", station: "BAR", image: "/images/hero-card.jpg" },
  { id: "cortado", name: "Honey Cortado", note: "Single-origin espresso, raw honey, silk milk", price: 5.0, category: "espresso", station: "BAR", image: "/images/barista-pour.jpg" },
  { id: "flatwhite", name: "Black Forest Flat White", note: "Cherry-infused espresso, velvet microfoam", price: 5.5, tag: "Winter", category: "espresso", station: "BAR", image: "/images/hero-card.jpg" },
  { id: "tonic", name: "Espresso Tonic", note: "Yirgacheffe shot, artisan tonic, burnt orange", price: 6.0, category: "espresso", station: "BAR", image: "/images/barista-pour.jpg" },
  { id: "affogato", name: "Affogato Noir", note: "Vanilla bean gelato drowned in espresso", price: 6.5, category: "espresso", station: "BAR", image: "/images/pastry-main.jpg" },
  { id: "creme", name: "Caffè Crème", note: "Long extraction, chantilly, nutmeg", price: 4.8, category: "espresso", station: "BAR", image: "/images/hero-card.jpg" },
  // ——— Slow Brews ———
  { id: "siphon", name: "Siphon Theatre", note: "Tableside vacuum brew, floral & theatrical", price: 9.0, tag: "Tableside", category: "brews", station: "BAR", image: "/images/barista-alt.jpg" },
  { id: "chemex", name: "Chemex for Two", note: "600ml slow pour, shared ritual", price: 11.0, category: "brews", station: "BAR", image: "/images/interior-square.jpg" },
  { id: "coldbrew", name: "Cold Brew Noir", note: "18-hour steep, black cherry finish", price: 5.5, category: "brews", station: "BAR", image: "/images/hero-bg.jpg" },
  { id: "kyoto", name: "Kyoto Drip", note: "Ice-dripped for 8 hours, wine-like clarity", price: 8.5, tag: "Limited", category: "brews", station: "BAR", image: "/images/barista-alt.jpg" },
  { id: "matcha", name: "Matcha Ceremony", note: "Ceremonial-grade, whisked to order", price: 6.5, category: "brews", station: "BAR", image: "/images/interior-square.jpg" },
  { id: "chai", name: "Chai Reverie", note: "House-ground spice, slow-simmered milk", price: 5.8, category: "brews", station: "BAR", image: "/images/hero-bg.jpg" },
  // ——— Patisserie ———
  { id: "croissant", name: "Croissant au Beurre", note: "72-hour laminated, French butter", price: 4.2, tag: "Baked daily", category: "patisserie", station: "KITCHEN", image: "/images/pastry-main.jpg" },
  { id: "painchoc", name: "Pain au Chocolat", note: "Dual batons of 70% Guanaja", price: 4.6, category: "patisserie", station: "KITCHEN", image: "/images/pastry-alt.jpg" },
  { id: "basque", name: "Burnt Basque Cheesecake", note: "Caramelised top, molten heart", price: 7.0, category: "patisserie", station: "KITCHEN", image: "/images/pastry-main.jpg" },
  { id: "knot", name: "Cardamom Knot", note: "Brioche, cardamom sugar, orange zest", price: 4.8, category: "patisserie", station: "KITCHEN", image: "/images/pastry-alt.jpg" },
  { id: "eclair", name: "Pistachio Éclair", note: "Sicilian pistachio crème, gold leaf", price: 6.2, tag: "Signature", category: "patisserie", station: "KITCHEN", image: "/images/pastry-main.jpg" },
  { id: "galette", name: "Seasonal Galette", note: "Ask the counter — always local fruit", price: 5.4, category: "patisserie", station: "KITCHEN", image: "/images/pastry-alt.jpg" },
];

/** Kitchen-only items that never appear on the public menu but live in the KDS. */
export const KITCHEN_ONLY: { id: string; name: string; price: number; station: Station }[] = [
  { id: "toastie", name: "Truffle Grilled Cheese", price: 9.5, station: "KITCHEN" },
  { id: "avo", name: "Avocado Sourdough Toast", price: 10.5, station: "KITCHEN" },
  { id: "quiche", name: "Garden Quiche Slice", price: 8.0, station: "KITCHEN" },
  { id: "banana", name: "Torched Banana Bread", price: 5.5, station: "KITCHEN" },
];

export const MENU_BY_ID = new Map(MENU.map((m) => [m.id, m]));

export const CATEGORIES: { id: Category; label: string; hint: string }[] = [
  { id: "espresso", label: "Espresso Bar", hint: "Pulled to 25 seconds" },
  { id: "brews", label: "Slow Brews", hint: "Steeped, not rushed" },
  { id: "patisserie", label: "Patisserie", hint: "Baked at 5 AM" },
];

export const CATEGORY_OF: Record<Category, Category> = {
  espresso: "espresso",
  brews: "brews",
  patisserie: "patisserie",
};

export function formatPrice(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/0$/, "");
}
