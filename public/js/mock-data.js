/**
 * The Bead Room by Pallas - Fallback Client Data
 */
const DEFAULT_STORE_DATA = {
  settings: {
    storeName: "The Bead Room by Pallas",
    tagline: "Handcrafted Jewellery 🌸 & Curated Art Workshops in Nagpur 🎨",
    description: "At The Bead Room by Pallas, we craft unique handmade beaded jewellery with pan-India delivery, and host fun, relaxed creative art workshops in Nagpur where you create and take home something beautiful.",
    email: "sarakamdar26@gmail.com",
    phone: "+91 98230 45678",
    address: "107, Amba Appts., Surendranagar, Nagpur, Maharashtra - 440033",
    currencySymbol: "₹",
    shippingFee: 79,
    freeShippingThreshold: 999
  },
  products: [
    {
      id: "prod-1",
      name: "Pastel Bloom Daisy & Freshwater Pearl Choker",
      category: "Necklaces",
      type: "jewellery",
      price: 899,
      originalPrice: 1199,
      image: "/images/necklace_floral.jpg",
      badge: "Bestseller",
      stock: 14,
      rating: 4.9,
      reviewsCount: 38,
      description: "Exquisite handmade choker combining delicate pastel pink & lavender glass seed beads, woven daisy florals, and genuine organic freshwater pearls. Finished with 18k gold-plated hypoallergenic lobster clasp and extension chain.",
      details: {
        materials: "Miyuki Seed Beads, Freshwater Pearls, 18K Gold Plated Clasp",
        length: "14 inches + 2 inch extender",
        care: "Avoid contact with direct water, perfumes, and sprays. Store in the provided pouch.",
        delivery: "Pan-India delivery within 3-5 business days"
      },
      featured: true
    },
    {
      id: "prod-2",
      name: "Aurora Rainbow & Gold Bead Charm Bracelet Stack",
      category: "Bracelets",
      type: "jewellery",
      price: 649,
      originalPrice: 850,
      image: "/images/bracelet_stack.jpg",
      badge: "Trending",
      stock: 20,
      rating: 5.0,
      reviewsCount: 42,
      description: "A radiant stack of 3 coordinating handcrafted elastic bracelets featuring pastel candy beads, 18k gold spacer accents, and whimsical heart & butterfly charms. Elastic stretch fits most wrist sizes comfortably.",
      details: {
        materials: "Czech Crystal Beads, Acrylic Charms, 18K Gold Brass Spacers",
        size: "Standard 6.5 - 7.0 inch stretch",
        care: "Wipe gently with soft cloth after wear.",
        delivery: "Pan-India delivery within 3-5 business days"
      },
      featured: true
    },
    {
      id: "prod-3",
      name: "Celestial Starlight Beaded Lariat Necklace",
      category: "Necklaces",
      type: "jewellery",
      price: 799,
      originalPrice: 999,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      badge: "New Drop",
      stock: 9,
      rating: 4.8,
      reviewsCount: 19,
      description: "A dainty lariat-style necklace featuring shimmering midnight blue and champagne seed beads, punctuated with micro starburst charms.",
      details: {
        materials: "Glass Seed Beads, Gold Plated Star Charms",
        length: "16 inches with 2 inch drop",
        delivery: "Pan-India delivery within 3-5 business days"
      },
      featured: true
    },
    {
      id: "prod-4",
      name: "Aesthetic Pastel Phone Charm & Wristlet",
      category: "Accessories",
      type: "jewellery",
      price: 349,
      originalPrice: 499,
      image: "https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=800&q=80",
      badge: "Popular",
      stock: 35,
      rating: 4.9,
      reviewsCount: 56,
      description: "Add whimsical charm to your phone with this sturdy handcrafted beaded wristlet with daisy beads, smileys and pearls.",
      details: {
        materials: "High-durability nylon cord, acrylic & glass beads",
        delivery: "Pan-India delivery within 3-5 business days"
      },
      featured: true
    },
    {
      id: "prod-7",
      name: "Nagpur Weekend Beading & Jewellery Masterclass",
      category: "Art Workshops",
      type: "workshop",
      price: 1299,
      originalPrice: 1599,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      badge: "Nagpur Workshop",
      stock: 8,
      rating: 5.0,
      reviewsCount: 64,
      description: "Join our fun, relaxed 3-hour weekend creative session at Surendranagar, Nagpur! Learn floral beading techniques, design your own necklace and bracelet stack, and take home everything you make.",
      details: {
        venue: "107, Amba Appts., Surendranagar, Nagpur",
        duration: "3 Hours (Saturday / Sunday, 3:00 PM - 6:00 PM)",
        inclusions: "All premium beads, tools, findings, snacks & refreshments",
        level: "Beginner Friendly (Ages 12+)"
      },
      featured: true
    },
    {
      id: "prod-8",
      name: "Resin Floral Jewellery & Keychain Workshop",
      category: "Art Workshops",
      type: "workshop",
      price: 1499,
      originalPrice: 1800,
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      badge: "Nagpur Workshop",
      stock: 6,
      rating: 4.9,
      reviewsCount: 31,
      description: "A hands-on creative session in Nagpur where you preserve real dried botanical flowers into crystal-clear UV resin jewellery pendants and custom keychains.",
      details: {
        venue: "107, Amba Appts., Surendranagar, Nagpur",
        duration: "2.5 Hours (Sunday 11:00 AM - 1:30 PM)",
        inclusions: "UV Resin, UV lamps, real pressed flowers, silicone molds, metal bezels",
        level: "Beginner Friendly"
      },
      featured: true
    }
  ]
};
