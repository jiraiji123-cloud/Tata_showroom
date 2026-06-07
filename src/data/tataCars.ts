import { TataCar } from '../types';

export const INITIAL_TATA_CARS: TataCar[] = [
  {
    id: "tata-curvv-ev",
    name: "TATA CURVV.ev",
    tagline: "The SUV Coupe",
    description: "An extraordinary blend of spectacular coupe architecture & electric versatility. Tailored to command attention with multi-mood sensory light bars, panoramic viewports, and exceptional 0-100 capabilities.",
    type: "EV",
    startingPrice: 17.49,
    priceSuffix: "Lakh*",
    badge: "New Launch",
    rangeOrEngine: "502 km Range",
    power: "167 PS EV Power",
    acceleration: "8.6s (0-100 km/h)",
    seating: "5 Seater",
    transmission: "Automatic Only",
    images: {
      hero: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=1200", // Sleek dark electric coupe
      interior: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "Level 2 ADAS (Advanced Driver Assistance System)",
      "Powered Tailgate with Gesture Activation",
      "Liquid-Cooled 55 kWh Battery Pac",
      "V2V & V2L (Vehicle to Vehicle / Vehicle to Load) Technology",
      "9 speaker high-fidelity JBL Cinematic Audio"
    ],
    isFeatured: true,
    displayActive: true
  },
  {
    id: "tata-safari",
    name: "TATA SAFARI",
    tagline: "Reclaim Your Life",
    description: "The grand high-luxury 3-row flagship SUV. Merging royal lounge aesthetics with solid Kryotec 2.0L diesel power, intelligent terrain modes, and pristine space craftsmanship.",
    type: "SUV",
    startingPrice: 16.19,
    priceSuffix: "Lakh*",
    badge: "Flagship SUV",
    rangeOrEngine: "1.5L Kryotec",
    power: "170 PS Power",
    acceleration: "10.2s (0-100 km/h)",
    seating: "6 or 7 Seater",
    transmission: "6-Speed AT / MT",
    images: {
      hero: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200", // Luxurious SUV
      interior: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "Panoramic Sunroof with Mood Lighting",
      "Ventilated Front & 2nd Row Captain Seats",
      "Dual Zone Fully Automatic Temperature Control",
      "Bejeweled Phased LED DRLs & Connected Bumper Bars",
      "7 Airbags (Best-in-class structural shield)"
    ],
    isFeatured: true,
    displayActive: true
  },
  {
    id: "tata-nexon-ev",
    name: "TATA NEXON.ev",
    tagline: "Smart. Electric. Bold.",
    description: "India's highest selling electric SUV, evolved to be smarter than ever. Packed with hyper-advanced telemetry, virtual assistant commands, and a sporty modular aerodynamic stance.",
    type: "EV",
    startingPrice: 13.99,
    priceSuffix: "Lakh*",
    badge: "Highest Seller",
    rangeOrEngine: "465 km Range",
    power: "145 PS EV Power",
    acceleration: "8.9s (0-100 km/h)",
    seating: "5 Seater",
    transmission: "Automatic Only",
    images: {
      hero: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200", // Smart Electric EV compact SUV
      interior: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "31.24 cm (12.3-inch) Cinematic Touchscreen by HARMAN",
      "Voice Assisted Electric Electric Sunroof",
      "Pure EV architecture with gen-2 electric motor",
      "Regenerative Braking paddle controls",
      "360-degree high-definition Camera System"
    ],
    isFeatured: false,
    displayActive: true
  },
  {
    id: "tata-harrier",
    name: "TATA HARRIER",
    tagline: "Born of Pedigree",
    description: "Designed on the legendary Land Rover D8-derived OMEGARC architecture. The Harrier redefines command presence with an athletic posture, absolute high-rigidity high-tensile steel, and supreme safety credentials.",
    type: "SUV",
    startingPrice: 15.49,
    priceSuffix: "Lakh*",
    badge: "5-Star Safety",
    rangeOrEngine: "2.0L Diesel Kryo",
    power: "170 PS Power",
    acceleration: "9.8s (0-100 km/h)",
    seating: "5 Seater",
    transmission: "6-Speed AT / MT",
    images: {
      hero: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200", // Aggressive SUV look
      interior: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "5-Star GNCAP and BNCAP rating",
      "Paddle Shifters on 6-Speed Automatic Gearbox",
      "Electric parking brake with Auto-Hold",
      "Acoustic Windshield Glass for whispering quiet NVH",
      "Intellectual Terrain Response Controller"
    ],
    isFeatured: false,
    displayActive: true
  },
  {
    id: "tata-punch-ev",
    name: "TATA PUNCH.ev",
    tagline: "The Smart Electric Compact",
    description: "Groundbreaking compact electric SUV built on the active modular acti.ev platform. Perfect for dense city commutes yet ready to conquer unmapped terrains with high ground clearance.",
    type: "EV",
    startingPrice: 9.99,
    priceSuffix: "Lakh*",
    badge: "Trending",
    rangeOrEngine: "421 km Range",
    power: "122 PS power",
    acceleration: "9.5s (0-100 km/h)",
    seating: "5 Seater",
    transmission: "Automatic Only",
    images: {
      hero: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200", // Compact look
      interior: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "190mm outstanding ground clearance",
      "Frunk (Front Trunk storage facility)",
      "Multi-Mode Regenerative braking",
      "Sleek aero alloy wheels",
      "Twin digital displays"
    ],
    isFeatured: false,
    displayActive: true
  },
  {
    id: "tata-altroz",
    name: "TATA ALTROZ",
    tagline: "The Premium Hatchback",
    description: "Redefining hatchback luxury with sharp laser-cut athletic lines, 5-star build integrity, and innovative first-in-class dual-cylinder smart iCNG and Turbo petrol engine choices.",
    type: "Hatchback",
    startingPrice: 6.65,
    priceSuffix: "Lakh*",
    badge: "Premium Quality",
    rangeOrEngine: "1.2L i-Turbo",
    power: "110 PS Power",
    acceleration: "11.1s (0-100 km/h)",
    seating: "5 Seater",
    transmission: "DCA Automatic / MT",
    images: {
      hero: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200", // Hatchback profile
      interior: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1200",
      profile: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200"
    },
    features: [
      "ALFA Architecture Platform (5-Star Crash safety)",
      "90-degree wide opening side doors (Easy Entry)",
      "Smart Twin-Cylinder iCNG tech options (under-floor launch)",
      "Ambient blue dashboard light trails",
      "Cruise Control & customizable steering settings"
    ],
    isFeatured: false,
    displayActive: true
  }
];
