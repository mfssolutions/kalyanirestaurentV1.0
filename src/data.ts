import { MenuItem } from "./types";

export const MENU_ITEMS: MenuItem[] = [
  // --- Breakfast ---
  {
    id: "bf1",
    name: "Classic Idli with Sambar & Chutney",
    category: "Breakfast",
    description: "Steam-cooked, fluffy rice cakes served with authentic hot sambar and fresh coconut chutney.",
    mrp: 80,
    price: 60,
    image: "src/assets/menu/idli.png",
    fallbackImage: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80&sig=idli",
    isVeg: true,
    popular: true
  },
  {
    id: "bf2",
    name: "Kerala Ghee Roast Dosa",
    category: "Breakfast",
    description: "Thin, crispy rice and lentil crepe roasted golden brown with pure ghee, served with chutney and sambar.",
    mrp: 120,
    price: 99,
    image: "src/assets/menu/dosa.png",
    fallbackImage: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    isVeg: true,
    popular: true
  },
  {
    id: "bf3",
    name: "Golden Appam with Vegetable Stew",
    category: "Breakfast",
    description: "Soft and pillowy center pancake with crisp lace-like edges, served with rich, coconut-milk vegetable stew.",
    mrp: 150,
    price: 120,
    image: "src/assets/menu/appam_stew.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80&sig=appam",
    isVeg: true
  },
  {
    id: "bf4",
    name: "Nadan Puttu with Kadala Curry",
    category: "Breakfast",
    description: "Steamed ground rice and grated coconut cylinders, served with a spiced, black chickpeas gravy.",
    mrp: 110,
    price: 85,
    image: "src/assets/menu/puttu.png",
    fallbackImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80&sig=puttu",
    isVeg: true
  },

  // --- Lunch ---
  {
    id: "lh1",
    name: "Kalyani Special Thali Meals",
    category: "Lunch",
    description: "Premium lunch platter with Matta rice, traditional sambar, rasam, avial, thoran, pickle, payasam, and papadam.",
    mrp: 220,
    price: 180,
    image: "src/assets/menu/meals.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    isVeg: true,
    popular: true
  },
  {
    id: "lh2",
    name: "Kakkanad Style Pepper Chicken Thali",
    category: "Lunch",
    description: "Matta or white rice served with dry pepper chicken, aromatic curry, pickle, side dishes, and papadam.",
    mrp: 250,
    price: 199,
    image: "src/assets/menu/chicken_meals.png",
    fallbackImage: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },

  // --- Starters ---
  {
    id: "st1",
    name: "Crispy Paneer Tikka",
    category: "Starters",
    description: "Marinated cottage cheese cubes grilled with bell peppers and onions in traditional clay oven spices.",
    mrp: 240,
    price: 199,
    image: "src/assets/menu/paneer_tikka.png",
    fallbackImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    isVeg: true
  },
  {
    id: "st2",
    name: "Spiced Kerala Beef Fry (Ularthiyathu)",
    category: "Starters",
    description: "Slow-roasted tender beef chunks sauteed with coconut slivers, garlic, and freshly ground spices.",
    mrp: 250,
    price: 210,
    image: "src/assets/menu/beef_fry.png",
    fallbackImage: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80&sig=beef",
    isVeg: false,
    popular: true
  },
  {
    id: "st3",
    name: "Nadan Chicken 65",
    category: "Starters",
    description: "Deep-fried spicy chicken morsels tempered with garlic, curry leaves, and green chillies.",
    mrp: 220,
    price: 180,
    image: "src/assets/menu/chicken_65.png",
    fallbackImage: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?w=600&auto=format&fit=crop&q=80",
    isVeg: false,
    popular: true
  },
  {
    id: "st4",
    name: "Gobi Manchurian Dry",
    category: "Starters",
    description: "Crispy cauliflower florets tossed in a tangy and sweet dark soy-garlic glaze.",
    mrp: 160,
    price: 130,
    image: "src/assets/menu/gobi_manchurian.png",
    fallbackImage: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80&sig=gobi",
    isVeg: true
  },

  // --- Snacks ---
  {
    id: "sn1",
    name: "Malabar Pazham Pori (Banana Fritters)",
    category: "Snacks",
    description: "2 pieces. Sweet ripe plantain slices dipped in a light yellow batter and deep-fried to crisp perfection.",
    mrp: 50,
    price: 40,
    image: "src/assets/menu/pazham_pori.png",
    fallbackImage: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop&q=80&sig=banana",
    isVeg: true,
    popular: true
  },
  {
    id: "sn2",
    name: "Crispy Parippu Vada with Chutney",
    category: "Snacks",
    description: "3 pieces. Crunchy, coarse lentil fritters spiced with ginger, shallots, curry leaves, and green chillies.",
    mrp: 45,
    price: 35,
    image: "src/assets/menu/parippu_vada.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80&sig=vada",
    isVeg: true
  },
  {
    id: "sn3",
    name: "Golden Spicy Egg Puffs",
    category: "Snacks",
    description: "Flaky multilayered bakery puff pastry stuffed with spiced onion masala and hardboiled egg.",
    mrp: 40,
    price: 30,
    image: "src/assets/menu/egg_puffs.png",
    fallbackImage: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80&sig=puffs",
    isVeg: false
  },

  // --- Chicken Dishes ---
  {
    id: "ch1",
    name: "Nadan Chicken Curry (Kerala Style)",
    category: "Chicken Dishes",
    description: "Tender chicken pieces simmered in a aromatic roasted coconut gravy with local spices.",
    mrp: 240,
    price: 180,
    image: "src/assets/menu/chicken_curry.png",
    fallbackImage: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80",
    isVeg: false,
    popular: true
  },
  {
    id: "ch2",
    name: "Rich Creamy Butter Chicken",
    category: "Chicken Dishes",
    description: "Tandoori grilled chicken pieces folded into an absolute luxury of mild tomato butter cream sauce.",
    mrp: 280,
    price: 230,
    image: "src/assets/menu/butter_chicken.png",
    fallbackImage: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },
  {
    id: "ch3",
    name: "Spiced Malabar Chicken Roast",
    category: "Chicken Dishes",
    description: "Thick, semi-dry preparation of spiced chicken sauteed with caramelised onions, tomatoes, and curry leaves.",
    mrp: 260,
    price: 210,
    image: "src/assets/menu/chicken_roast.png",
    fallbackImage: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },

  // --- Beef Dishes ---
  {
    id: "bf_curry",
    name: "Nadan Beef Curry",
    category: "Beef Dishes",
    description: "Kerala classic beef recipe cooked in heavy iron skillet with fresh ground spices and toasted coconut oil.",
    mrp: 240,
    price: 199,
    image: "src/assets/menu/beef_curry.png",
    fallbackImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    isVeg: false,
    popular: true
  },
  {
    id: "bf_roast",
    name: "Caramelized Beef Onion Roast",
    category: "Beef Dishes",
    description: "Spiced beef strips wok-tossed with plenty of fried red onions, ginger, and garlic paste.",
    mrp: 250,
    price: 210,
    image: "src/assets/menu/beef_roast.png",
    fallbackImage: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },

  // --- Seafood Dishes ---
  {
    id: "sf1",
    name: "Nadan Fish Curry (with Kudampuli)",
    category: "Seafood Dishes",
    description: "Authentic, spicy, red fish curry cooked in a traditional clay pot using tangy sun-dried cambodge.",
    mrp: 280,
    price: 240,
    image: "src/assets/menu/fish_curry.png",
    fallbackImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    isVeg: false,
    popular: true
  },
  {
    id: "sf2",
    name: "Spiced Chemmeen (Prawns) Roast",
    category: "Seafood Dishes",
    description: "Juicy prawns cooked in a rich, dry roast masala of handpicked shallots, ginger, tomato, and kokum.",
    mrp: 320,
    price: 275,
    image: "src/assets/menu/prawn_roast.png",
    fallbackImage: "https://images.unsplash.com/photo-1559737605-de68a254039a?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },

  // --- Egg Dishes ---
  {
    id: "eg1",
    name: "Nadan Egg Curry",
    category: "Egg Dishes",
    description: "Two hard-boiled eggs in a smooth, spiced, medium-spicy coconut milk yellow broth.",
    mrp: 120,
    price: 99,
    image: "src/assets/menu/egg_curry.png",
    fallbackImage: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },
  {
    id: "eg2",
    name: "Egg Masala Roast",
    category: "Egg Dishes",
    description: "Thick onion-tomato spiced semi-gravy coat with boiled eggs, perfect with appam or parotta.",
    mrp: 130,
    price: 110,
    image: "src/assets/menu/egg_roast.png",
    fallbackImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    isVeg: false
  },

  // --- Vegetarian Dishes ---
  {
    id: "vg1",
    name: "Paneer Butter Masala",
    category: "Vegetarian Dishes",
    description: "Soft fresh paneer cubes cooked in a delightfully thick, buttery, orange-tinted cream gravy.",
    mrp: 220,
    price: 180,
    image: "src/assets/menu/paneer_butter.png",
    fallbackImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    isVeg: true,
    popular: true
  },
  {
    id: "vg2",
    name: "Nadan Mix Vegetable Kurma",
    category: "Vegetarian Dishes",
    description: "Assorted fresh seasonal vegetables gently simmered with mild cashew nuts and coconut milk extract paste.",
    mrp: 180,
    price: 150,
    image: "src/assets/menu/veg_kurma.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    isVeg: true
  },
  {
    id: "vg3",
    name: "Yellow Dal Fry Tadka",
    category: "Vegetarian Dishes",
    description: "Yellow lentils cooked simple and finished with a hot ghee crackling of garlic, cumin, and red dry chilis.",
    mrp: 140,
    price: 110,
    image: "src/assets/menu/dal_tadka.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80&sig=dal",
    isVeg: true
  },

  // --- Special Biryanis ---
  {
    id: "by1",
    name: "Kalyani Special Chicken Biryani",
    category: "Special Biryanis",
    description: "Famous local recipe with short-grain Kaima rice layered with secret herb masalas, ghee, fried onions, and chicken.",
    mrp: 250,
    price: 199,
    image: "src/assets/menu/chicken_biryani.png",
    fallbackImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    isVeg: false,
    popular: true
  },
  {
    id: "by2",
    name: "Malabar Dum Mutton Biryani",
    category: "Special Biryanis",
    description: "Delicate mutton chunks cooked inside slow-fired layers of Kaima rice, served with raita, pickle, and chammanthi.",
    mrp: 380,
    price: 320,
    image: "src/assets/menu/mutton_biryani.png",
    fallbackImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80&sig=mutton",
    isVeg: false,
    popular: true
  },
  {
    id: "by3",
    name: "Nadan Egg Dum Biryani",
    category: "Special Biryanis",
    description: "Spicy boiled eggs layered with ghee-roasted Kaima rice, toasted cashew nuts, raisings, and crisp onions.",
    mrp: 160,
    price: 130,
    image: "src/assets/menu/egg_biryani.png",
    fallbackImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80&sig=eggbiryani",
    isVeg: false
  },
  {
    id: "by4",
    name: "Flavorsome Veg Dum Biryani",
    category: "Special Biryanis",
    description: "Medley of seasonal organic vegetables cooked in hand-pounded spices, styled inside dum kaima rice.",
    mrp: 180,
    price: 149,
    image: "src/assets/menu/veg_biryani.png",
    fallbackImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80&sig=vegbiryani",
    isVeg: true
  },

  // --- Kerala Meals ---
  {
    id: "km1",
    name: "Nadan Kerala Sadya Meals",
    category: "Kerala Meals",
    description: "The grand harvest platter on banana leaf overlay: avial, sambar, olan, kalan, payasam, and unpolished Matta rice.",
    mrp: 250,
    price: 199,
    image: "src/assets/menu/kerala_sadya.png",
    fallbackImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    isVeg: true,
    popular: true
  },
  {
    id: "km2",
    name: "Special Fish Curry Meals",
    category: "Kerala Meals",
    description: "Traditional parboiled Matta rice meals featuring sour Kudampuli red seer fish curry, meen thoran, and hot butter milk.",
    mrp: 290,
    price: 240,
    image: "src/assets/menu/fish_meals.png",
    fallbackImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80&sig=fishmeals",
    isVeg: false
  },

  // --- Combo Offers ---
  {
    id: "comb1",
    name: "Combo 1: Porotta + Beef Fry",
    category: "Combo Offers",
    description: "3 pieces of soft flaky Kerala Malabar Porotta served alongside our legendary dry beef roast fry.",
    mrp: 300,
    price: 249,
    image: "src/assets/menu/combo_porotta_beef.png",
    fallbackImage: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80&sig=combo1",
    isVeg: false,
    popular: true
  },
  {
    id: "comb2",
    name: "Combo 2: Appam + Chicken Roast",
    category: "Combo Offers",
    description: "3 pieces of soft lattice Appams coupled perfectly with a semi-dry premium chicken curry roast.",
    mrp: 280,
    price: 229,
    image: "src/assets/menu/combo_appam_chicken.png",
    fallbackImage: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80&sig=combo2",
    isVeg: false
  },
  {
    id: "comb3",
    name: "Combo 3: Chappathi + Paneer Masala",
    category: "Combo Offers",
    description: "3 pieces of healthy soft whole wheat chappathi served with a side of lip-smacking paneer masala curry.",
    mrp: 220,
    price: 179,
    image: "src/assets/menu/combo_chap_paneer.png",
    fallbackImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80&sig=combo3",
    isVeg: true
  }
];

export const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Starters",
  "Snacks",
  "Chicken Dishes",
  "Beef Dishes",
  "Seafood Dishes",
  "Egg Dishes",
  "Vegetarian Dishes",
  "Special Biryanis",
  "Kerala Meals",
  "Combo Offers"
];

export const ADS_BANNERS = [
  {
    id: 1,
    title: "Savor the True Flavors of Kerala",
    subtitle: "Kalyani Kitchen brings you traditional spices and generation-old secret recipes direct to your table.",
    tag: "SIGNATURE DISHES",
    image: "src/Public/Heroads/HEROADS1.PNG",
    fallback: "src/Public/Heroads/HEROADS1.PNG",
    gradient: "from-brand-green to-teal-950"
  },
  {
    id: 2,
    title: "Legendary Malabar Dum Biryani",
    subtitle: "Aromatic Kaima rice, slow dum-cooked with country fowl, pristine saffron, onions, and select herbs.",
    tag: "BEST SELLER",
    image: "src/Public/Heroads/HEROADS2.PNG",
    fallback: "src/Public/Heroads/HEROADS2.PNG",
    gradient: "from-brand-green to-emerald-950"
  },
  {
    id: 3,
    title: "Nadan Beef Fry & Malabar Porotta",
    subtitle: "Flaky crispy layers of porotta combined with thick iron-skillet spiced slow roast caramelized beef.",
    tag: "KERALA CLASSIC",
    image: "src/Public/Heroads/HEROADS3.PNG",
    fallback: "src/Public/Heroads/HEROADS3.PNG",
    gradient: "from-brand-green to-neutral-950"
  },
  {
    id: 4,
    title: "Delectable Coastal Seafood Specials",
    subtitle: "Clay-pot red seer fish curry infused with cambodge rind and pan-fried spicy chemmeen prawns.",
    tag: "FRESH CATCH",
    image: "src/Public/Heroads/HEROADS4.PNG",
    fallback: "src/Public/Heroads/HEROADS4.PNG",
    gradient: "from-brand-green to-emerald-950"
  },
  {
    id: 5,
    title: "Irresistible Combo Meals & Offers",
    subtitle: "Order any special meal combo and get free hot pazham pori and payasam with your delivery today.",
    tag: "LTD WEEKLY COMBO",
    image: "src/Public/Heroads/HEROADS5.PNG",
    fallback: "src/Public/Heroads/HEROADS5.PNG",
    gradient: "from-brand-green to-emerald-950"
  }
];
