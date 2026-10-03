export type Business = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  group: string;
};

export const BUSINESSES: Business[] = [
  { slug: "restaurant", name: "Restaurant", icon: "UtensilsCrossed", description: "Menus, reservations and delivery", group: "Food & Hospitality" },
  { slug: "coffee-shop", name: "Coffee Shop", icon: "Coffee", description: "Menu, loyalty and opening hours", group: "Food & Hospitality" },
  { slug: "bakery", name: "Bakery", icon: "CakeSlice", description: "Products, orders and pickup", group: "Food & Hospitality" },
  { slug: "hotel", name: "Hotel", icon: "BedDouble", description: "Rooms, booking and reviews", group: "Food & Hospitality" },
  { slug: "travel-agency", name: "Travel Agency", icon: "Plane", description: "Packages, quotes and booking", group: "Food & Hospitality" },
  { slug: "medical-clinic", name: "Medical Clinic", icon: "Stethoscope", description: "Appointments and patient info", group: "Health" },
  { slug: "dental-clinic", name: "Dental Clinic", icon: "Smile", description: "Services and appointment booking", group: "Health" },
  { slug: "pharmacy", name: "Pharmacy", icon: "Pill", description: "Catalog, stock and orders", group: "Health" },
  { slug: "gym", name: "Gym", icon: "Dumbbell", description: "Classes, memberships and plans", group: "Health" },
  { slug: "school", name: "School", icon: "GraduationCap", description: "Programs, admissions and portal", group: "Education" },
  { slug: "training-center", name: "Training Center", icon: "BookOpen", description: "Courses, sign-ups and payments", group: "Education" },
  { slug: "real-estate", name: "Real Estate", icon: "Home", description: "Listings, search and enquiries", group: "Professional" },
  { slug: "construction", name: "Construction Company", icon: "HardHat", description: "Projects, portfolio and quotes", group: "Professional" },
  { slug: "law-firm", name: "Law Firm", icon: "Scale", description: "Practice areas and consultations", group: "Professional" },
  { slug: "accounting", name: "Accounting Office", icon: "Calculator", description: "Services and client portal", group: "Professional" },
  { slug: "corporate", name: "Corporate Company", icon: "Building2", description: "Company site with rich content", group: "Professional" },
  { slug: "grocery-store", name: "Grocery Store", icon: "ShoppingBasket", description: "Products, delivery and stock", group: "Retail" },
  { slug: "supermarket", name: "Supermarket", icon: "ShoppingCart", description: "Large catalog and promotions", group: "Retail" },
  { slug: "furniture-store", name: "Furniture Store", icon: "Sofa", description: "Showroom catalog and orders", group: "Retail" },
  { slug: "clothing-store", name: "Clothing Store", icon: "Shirt", description: "Collections, sizes and checkout", group: "Retail" },
  { slug: "shoe-store", name: "Shoe Store", icon: "Footprints", description: "Catalog with variants", group: "Retail" },
  { slug: "electronics-store", name: "Electronics Store", icon: "Tv", description: "Specs, stock and warranty", group: "Retail" },
  { slug: "phone-shop", name: "Phone Shop", icon: "Smartphone", description: "Devices, accessories and repair", group: "Retail" },
  { slug: "computer-shop", name: "Computer Shop", icon: "Laptop", description: "Builds, parts and services", group: "Retail" },
  { slug: "beauty-salon", name: "Beauty Salon", icon: "Sparkles", description: "Services and online booking", group: "Services" },
  { slug: "barber-shop", name: "Barber Shop", icon: "Scissors", description: "Booking and price list", group: "Services" },
  { slug: "laundry", name: "Laundry", icon: "WashingMachine", description: "Pickup, delivery and tracking", group: "Services" },
  { slug: "car-garage", name: "Car Repair Garage", icon: "Wrench", description: "Services, booking and quotes", group: "Automotive" },
  { slug: "car-rental", name: "Car Rental", icon: "Car", description: "Fleet, availability and booking", group: "Automotive" },
  { slug: "delivery", name: "Delivery Company", icon: "Truck", description: "Tracking, pricing and orders", group: "Logistics" },
  { slug: "logistics", name: "Logistics Company", icon: "Package", description: "Fleet, shipments and clients", group: "Logistics" },
  { slug: "pet-shop", name: "Pet Shop", icon: "PawPrint", description: "Products, care and grooming", group: "Retail" },
  { slug: "flower-shop", name: "Flower Shop", icon: "Flower2", description: "Bouquets, orders and delivery", group: "Retail" },
  { slug: "printing", name: "Printing Company", icon: "Printer", description: "Custom orders and file upload", group: "Services" },
  { slug: "photography", name: "Photography Studio", icon: "Camera", description: "Galleries and session booking", group: "Creative" },
  { slug: "event-planner", name: "Event Planner", icon: "PartyPopper", description: "Portfolio, packages and enquiries", group: "Creative" },
  { slug: "ecommerce", name: "E-commerce Store", icon: "Store", description: "Full online store with payments", group: "Digital" },
  { slug: "portfolio", name: "Portfolio Website", icon: "User", description: "Personal showcase site", group: "Digital" },
  { slug: "blog", name: "Blog", icon: "PenLine", description: "Articles, categories and SEO", group: "Digital" },
  { slug: "news", name: "News Website", icon: "Newspaper", description: "High-volume publishing platform", group: "Digital" },
  { slug: "ngo", name: "NGO", icon: "HeartHandshake", description: "Causes, donations and volunteers", group: "Public" },
  { slug: "government", name: "Government Organization", icon: "Landmark", description: "Services, forms and documents", group: "Public" },
  { slug: "custom", name: "Custom Business", icon: "Shapes", description: "Something else entirely", group: "Public" },
];

export function getBusiness(slug: string): Business | undefined {
  return BUSINESSES.find((b) => b.slug === slug);
}
