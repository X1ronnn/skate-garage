// Catalog rebuilt from the original Skate Garage (PHP) product photos.
// Prices come from the original image filenames (in Philippine pesos).
export const categories = [
  { name: "Decks", slug: "decks", description: "7-ply maple decks from Justice, Turf, Boiling and our blank line." },
  { name: "Complete Skateboards", slug: "completes", description: "Ready-to-ride setups and deck bundles." },
  { name: "Tools & Accessories", slug: "tools", description: "Skate tools to keep your setup dialed." },
];

const deck = (o) => ({ category: "decks", material: "7-ply Canadian maple", size: '8.0"', stock: 12, ...o });

export const products = [
  // Tools
  { src: "99.JPEG", slug: "schlauch-mini-t-tool", name: "Schlauch Mini T-Tool", brand: "Schlauch", category: "tools", price: 99, stock: 40, color: "Assorted", size: "One size", material: "Steel", description: "Compact all-in-one skate tool with 3/8\", 1/2\" and 9/16\" sockets plus a Phillips/Allen driver. Fits in any pocket." },
  { src: "129.JPEG", slug: "classic-black-t-tool", name: "Classic Black T-Tool", brand: "Skate Garage", category: "tools", price: 129, stock: 35, color: "Black", size: "One size", material: "Steel", description: "Everyday T-tool with all the sockets you need for trucks and wheels, plus a separate Allen key for hardware." },
  { src: "150.JPEG", slug: "pastel-pink-t-tool", name: "Pastel Pink T-Tool", brand: "Skate Garage", category: "tools", price: 150, stock: 30, color: "Pink", size: "One size", material: "Steel / rubber grip", description: "Soft-grip T-tool in pastel pink. Truck, wheel and hardware sockets in one tool." },
  { src: "199.JPEG", slug: "silver-pro-t-tool", name: "Silver Pro T-Tool", brand: "Silver", category: "tools", price: 199, stock: 25, color: "Red", size: "One size", material: "Aluminum / steel", description: "Pro-grade T-tool with an integrated bearing press and threader for cleaning up truck axles." },
  // Blank decks
  deck({ src: "1600(1).JPEG", slug: "blank-deck-olive", name: "Blank Deck – Olive", brand: "Skate Garage", price: 1600, color: "Olive green", description: "Our house blank: medium concave, mellow kicks and a clean stain finish. Great for street and park." }),
  deck({ src: "1600(2).JPEG", slug: "blank-deck-ocean", name: "Blank Deck – Ocean Blue", brand: "Skate Garage", price: 1600, color: "Blue", description: "House blank with a deep blue stain. Medium concave, symmetrical shape." }),
  deck({ src: "1600(3).JPEG", slug: "blank-deck-espresso", name: "Blank Deck – Espresso", brand: "Skate Garage", price: 1600, color: "Brown", description: "House blank with a dark espresso stain. Medium concave, symmetrical shape." }),
  deck({ src: "1600(4).JPEG", slug: "blank-deck-cherry", name: "Blank Deck – Cherry Red", brand: "Skate Garage", price: 1600, color: "Red", size: '8.25"', description: "House blank in cherry red, slightly wider for more stability on transition." }),
  deck({ src: "1600.JPEG", slug: "blank-deck-chrome-fade", name: "Blank Deck – Chrome Fade", brand: "Skate Garage", price: 1600, color: "Silver fade", description: "House blank with a reflective chrome-to-black fade." }),
  // Branded decks
  deck({ src: "1800.JPEG", slug: "justice-classic-logo-deck", name: "Justice Classic Logo Deck", brand: "Justice", price: 1800, color: "Maroon", featured: true, description: "Justice's oversized outline logo on a maroon base. Steep concave with a responsive pop." }),
  deck({ src: "2000(1).JPEG", slug: "justice-street-cart-deck", name: "Justice Street Cart Deck", brand: "Justice", price: 2000, color: "Pastel", featured: true, description: "Illustrated street-cart graphic in soft pastels. Medium concave, 14\" wheelbase." }),
  deck({ src: "2000.JPEG", slug: "justice-orbit-deck", name: "Justice Orbit Deck", brand: "Justice", price: 2000, color: "Maroon", size: '8.25"', description: "Concentric orbit graphic with red accents. Slightly wider for park and bowl skating." }),
  deck({ src: "2100.JPEG", slug: "justice-cosmos-deck", name: "Justice Cosmos Deck", brand: "Justice", price: 2100, color: "Purple", featured: true, description: "Space-themed graphic with planets and constellations. Medium concave, durable top ply." }),
  deck({ src: "2100(1).JPEG", slug: "turf-stamp-deck-forest", name: "Turf Stamp Deck – Forest", brand: "Turf", price: 2100, color: "Forest green", description: "Turf's stamp logo on a forest green stain. All-round shape for street and park." }),
  deck({ src: "2100(2).JPEG", slug: "turf-wordmark-deck-grey", name: "Turf Wordmark Deck – Grey", brand: "Turf", price: 2100, color: "Grey", description: "Bold Turf wordmark across a light grey base." }),
  deck({ src: "2100(3).JPEG", slug: "turf-blackout-deck", name: "Turf Blackout Deck", brand: "Turf", price: 2100, color: "Black", size: '8.125"', description: "Tonal black-on-black Turf graphic. Stealthy look, classic shape." }),
  deck({ src: "2199(1).JPEG", slug: "turf-rose-deck", name: "Turf Rose Deck", brand: "Turf", price: 2199, color: "Yellow", featured: true, description: "Hand-drawn rose on a sunflower yellow base. Medium concave." }),
  deck({ src: "2199.JPEG", slug: "turf-night-cat-deck", name: "Turf Night Cat Deck", brand: "Turf", price: 2199, color: "Black", description: "Moonlit cat illustration on black. Medium concave, mellow kicks." }),
  // Completes / bundles
  { src: "2499(1).JPEG", slug: "boiling-boombox-bundle", name: "Boiling Boombox Bundle", brand: "Boiling", category: "completes", price: 2499, stock: 8, color: "Multicolor", size: '8.0"', material: "Maple deck, aluminum trucks", featured: true, description: "Boiling 'Boombox' deck bundled with trucks, bearings and grip tape. Assemble it your way." },
  { src: "2499.JPEG", slug: "boiling-love-peace-bundle", name: "Boiling Love & Peace Bundle", brand: "Boiling", category: "completes", price: 2499, stock: 8, color: "Rasta", size: '8.0"', material: "Maple deck, aluminum trucks", description: "Boiling 'Love & Peace' deck bundled with trucks, bearings and grip tape." },
  { src: "4500(1).JPEG", slug: "complete-skateboard-ocean", name: "Complete Skateboard – Ocean", brand: "Skate Garage", category: "completes", price: 4500, stock: 6, color: "Blue", size: '8.0"', material: "Maple deck, aluminum trucks, 52mm wheels", featured: true, description: "Fully assembled and ready to ride: deck, trucks, 52mm wheels, ABEC-7 bearings, grip tape and hardware." },
  { src: "4500.JPEG", slug: "complete-skateboard-crimson", name: "Complete Skateboard – Crimson", brand: "Skate Garage", category: "completes", price: 4500, stock: 6, color: "Red", size: '8.0"', material: "Maple deck, aluminum trucks, 52mm wheels", featured: true, description: "Fully assembled and ready to ride: deck, trucks, 52mm wheels, ABEC-7 bearings, grip tape and hardware." },
];

// Demo reviews (sample data for the portfolio demo)
export const reviewPool = [
  ["Migs R.", 5, "Solid pop and the graphic looks even better in person."],
  ["Ana L.", 4, "Great quality for the price. Shipping was quick."],
  ["Carlo D.", 5, "Exactly as described. Will buy again."],
  ["Jessa M.", 4, "Nice concave, took a few sessions to break in."],
  ["Paolo S.", 5, "Perfect for street. Grip and hardware were included."],
  ["Bea T.", 3, "Good board, the color is a bit darker than the photo."],
];
