import {
  Activity,
  Apple,
  Baby,
  Backpack,
  Banknote,
  Bath,
  Bed,
  Beef,
  Beer,
  Bell,
  Bike,
  Bird,
  Bitcoin,
  Bone,
  Book,
  BookOpen,
  Brain,
  Briefcase,
  Building,
  Building2,
  Bus,
  Cake,
  Calculator,
  Calendar,
  Camera,
  Car,
  CarTaxiFront,
  Carrot,
  Cat,
  ChartLine,
  Church,
  Cigarette,
  CircleDollarSign,
  CircleParking,
  Clapperboard,
  Clock,
  Cloud,
  Coffee,
  Coins,
  Compass,
  Cookie,
  CreditCard,
  Croissant,
  Dice5,
  Dog,
  Drama,
  Droplets,
  Dumbbell,
  Egg,
  FileText,
  Film,
  Fish,
  Flag,
  Flame,
  Flower2,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  Globe,
  GraduationCap,
  Guitar,
  Hammer,
  HandCoins,
  Handshake,
  Headphones,
  Heart,
  HeartHandshake,
  Hospital,
  Hourglass,
  House,
  IceCreamCone,
  Key,
  Lamp,
  Landmark,
  Laptop,
  Leaf,
  Lightbulb,
  Lock,
  Luggage,
  Mail,
  Map,
  MapPin,
  Monitor,
  Mountain,
  Music,
  Package,
  PaintRoller,
  Palette,
  PartyPopper,
  PawPrint,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Plug,
  Popcorn,
  Printer,
  Rabbit,
  Receipt,
  Recycle,
  Refrigerator,
  Repeat,
  Rocket,
  Sandwich,
  Scale,
  Scissors,
  Shield,
  ShieldCheck,
  Ship,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Siren,
  Smartphone,
  Smile,
  Sofa,
  Soup,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Store,
  Sun,
  Syringe,
  Tag,
  Tent,
  Ticket,
  TrainFront,
  Trash2,
  TreePalm,
  TreePine,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  Turtle,
  Tv,
  Umbrella,
  User,
  UserRound,
  Users,
  Utensils,
  Wallet,
  WashingMachine,
  Watch,
  Wifi,
  Wine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps an icon key (one of the backend's GET /categories/options `icons`
 * - see category.schema.ts for why that whitelist is fetched rather than
 * duplicated here) to the LucideIcon component that renders it, plus the
 * Spanish words the icon picker's search matches against. The mapping
 * itself can only live on the frontend - lucide-react components don't
 * exist on the backend - so it is not something a fetch could replace.
 * Keep it in step with the backend's ICON_KEYS
 * (src/categories/constants/icon-keys.ts): a key the backend added that
 * isn't in here yet falls back to Tag (see resolveIcon below) and is
 * found by its key alone.
 */
interface IconEntry {
  Icon: LucideIcon;
  /** Lower-case, accent-free Spanish words people would search by. */
  keywords: string;
}

const ICON_REGISTRY: Record<string, IconEntry> = {
  house: { Icon: House, keywords: "casa hogar vivienda arriendo alquiler" },
  car: { Icon: Car, keywords: "carro auto coche vehiculo" },
  "piggy-bank": { Icon: PiggyBank, keywords: "ahorro ahorros alcancia" },
  briefcase: { Icon: Briefcase, keywords: "trabajo maletin empleo oficina" },
  user: { Icon: User, keywords: "persona personal perfil" },
  "paw-print": { Icon: PawPrint, keywords: "mascota mascotas huella animal" },
  plane: { Icon: Plane, keywords: "viaje avion vuelo vacaciones" },
  ticket: { Icon: Ticket, keywords: "entrada boleta evento cine" },
  heart: { Icon: Heart, keywords: "salud corazon amor favorito" },
  "shopping-bag": { Icon: ShoppingBag, keywords: "compras bolsa tienda ropa" },
  utensils: { Icon: Utensils, keywords: "comida restaurante comer cubiertos" },
  "graduation-cap": {
    Icon: GraduationCap,
    keywords: "educacion estudio universidad colegio",
  },
  gift: { Icon: Gift, keywords: "regalo regalos cumpleanos detalle" },
  zap: { Icon: Zap, keywords: "energia luz electricidad rayo" },
  tag: { Icon: Tag, keywords: "etiqueta otro general" },
  "building-2": {
    Icon: Building2,
    keywords: "edificio apartamento propiedad conjunto",
  },
  bed: { Icon: Bed, keywords: "cama dormir habitacion" },
  sofa: { Icon: Sofa, keywords: "sofa muebles sala" },
  lamp: { Icon: Lamp, keywords: "lampara decoracion" },
  bath: { Icon: Bath, keywords: "bano ducha aseo" },
  key: { Icon: Key, keywords: "llave arriendo acceso" },
  hammer: { Icon: Hammer, keywords: "reparaciones martillo construccion" },
  wrench: {
    Icon: Wrench,
    keywords: "mantenimiento reparacion herramienta taller",
  },
  "paint-roller": { Icon: PaintRoller, keywords: "pintura remodelacion obra" },
  plug: { Icon: Plug, keywords: "enchufe electrico" },
  lightbulb: { Icon: Lightbulb, keywords: "bombillo idea luz" },
  droplets: { Icon: Droplets, keywords: "agua acueducto gotas" },
  flame: { Icon: Flame, keywords: "gas calefaccion fuego" },
  wifi: { Icon: Wifi, keywords: "internet wifi red" },
  tv: { Icon: Tv, keywords: "television streaming cable" },
  "washing-machine": {
    Icon: WashingMachine,
    keywords: "lavadora lavanderia ropa",
  },
  refrigerator: { Icon: Refrigerator, keywords: "nevera electrodomestico" },
  "trash-2": { Icon: Trash2, keywords: "basura aseo" },
  bus: { Icon: Bus, keywords: "bus transporte publico" },
  "train-front": { Icon: TrainFront, keywords: "tren metro transporte" },
  bike: { Icon: Bike, keywords: "bicicleta moto ciclismo" },
  fuel: { Icon: Fuel, keywords: "gasolina combustible tanqueo" },
  "circle-parking": {
    Icon: CircleParking,
    keywords: "parqueadero estacionamiento",
  },
  ship: { Icon: Ship, keywords: "barco crucero" },
  truck: { Icon: Truck, keywords: "camion envio domicilio mudanza" },
  "car-taxi-front": { Icon: CarTaxiFront, keywords: "taxi uber transporte" },
  coffee: { Icon: Coffee, keywords: "cafe desayuno" },
  pizza: { Icon: Pizza, keywords: "pizza comida rapida" },
  beer: { Icon: Beer, keywords: "cerveza bar licor" },
  wine: { Icon: Wine, keywords: "vino licor cena" },
  apple: { Icon: Apple, keywords: "fruta manzana mercado saludable" },
  carrot: { Icon: Carrot, keywords: "verduras mercado vegetales" },
  cake: { Icon: Cake, keywords: "pastel postre cumpleanos" },
  "ice-cream-cone": { Icon: IceCreamCone, keywords: "helado postre" },
  sandwich: { Icon: Sandwich, keywords: "sandwich almuerzo" },
  soup: { Icon: Soup, keywords: "sopa almuerzo comida" },
  cookie: { Icon: Cookie, keywords: "galleta snack" },
  "shopping-cart": {
    Icon: ShoppingCart,
    keywords: "supermercado mercado compras carrito",
  },
  "shopping-basket": {
    Icon: ShoppingBasket,
    keywords: "canasta mercado compras",
  },
  store: { Icon: Store, keywords: "tienda negocio local" },
  croissant: { Icon: Croissant, keywords: "panaderia pan desayuno" },
  beef: { Icon: Beef, keywords: "carne asado" },
  fish: { Icon: Fish, keywords: "pescado mariscos pecera" },
  egg: { Icon: Egg, keywords: "huevo desayuno" },
  stethoscope: { Icon: Stethoscope, keywords: "medico doctor consulta salud" },
  pill: { Icon: Pill, keywords: "medicina pastillas farmacia droga" },
  activity: { Icon: Activity, keywords: "salud pulso actividad" },
  dumbbell: { Icon: Dumbbell, keywords: "gimnasio gym ejercicio pesas" },
  syringe: { Icon: Syringe, keywords: "vacuna inyeccion" },
  hospital: { Icon: Hospital, keywords: "hospital clinica urgencias" },
  baby: { Icon: Baby, keywords: "bebe hijo ninos panales" },
  smile: { Icon: Smile, keywords: "dentista sonrisa cuidado" },
  glasses: { Icon: Glasses, keywords: "gafas lentes optica" },
  brain: { Icon: Brain, keywords: "terapia psicologia mente" },
  music: { Icon: Music, keywords: "musica spotify concierto" },
  film: { Icon: Film, keywords: "cine pelicula" },
  "gamepad-2": { Icon: Gamepad2, keywords: "juegos videojuegos consola" },
  clapperboard: { Icon: Clapperboard, keywords: "cine video produccion" },
  popcorn: { Icon: Popcorn, keywords: "cine palomitas" },
  tent: { Icon: Tent, keywords: "camping acampar" },
  camera: { Icon: Camera, keywords: "foto camara fotografia" },
  palette: { Icon: Palette, keywords: "arte pintura diseno" },
  "book-open": { Icon: BookOpen, keywords: "libros lectura estudio" },
  book: { Icon: Book, keywords: "libro lectura" },
  headphones: { Icon: Headphones, keywords: "audifonos musica podcast" },
  "party-popper": { Icon: PartyPopper, keywords: "fiesta celebracion" },
  guitar: { Icon: Guitar, keywords: "guitarra musica instrumento" },
  drama: { Icon: Drama, keywords: "teatro obra" },
  trophy: { Icon: Trophy, keywords: "deporte premio torneo" },
  "dice-5": { Icon: Dice5, keywords: "juegos azar dados casino" },
  mountain: { Icon: Mountain, keywords: "montana senderismo naturaleza" },
  umbrella: { Icon: Umbrella, keywords: "playa sombrilla lluvia seguro" },
  sun: { Icon: Sun, keywords: "sol verano playa" },
  "tree-palm": { Icon: TreePalm, keywords: "playa vacaciones isla" },
  luggage: { Icon: Luggage, keywords: "maleta equipaje viaje" },
  map: { Icon: Map, keywords: "mapa viaje turismo" },
  "map-pin": { Icon: MapPin, keywords: "lugar ubicacion sitio" },
  compass: { Icon: Compass, keywords: "brujula aventura explorar" },
  globe: { Icon: Globe, keywords: "mundo internacional viajes" },
  wallet: { Icon: Wallet, keywords: "billetera dinero efectivo" },
  "credit-card": { Icon: CreditCard, keywords: "tarjeta credito debito pagos" },
  banknote: { Icon: Banknote, keywords: "billete efectivo dinero" },
  coins: { Icon: Coins, keywords: "monedas dinero cambio" },
  landmark: { Icon: Landmark, keywords: "banco impuestos gobierno" },
  receipt: { Icon: Receipt, keywords: "recibo factura cuenta" },
  "trending-up": {
    Icon: TrendingUp,
    keywords: "inversion ganancia crecimiento ingresos",
  },
  "trending-down": { Icon: TrendingDown, keywords: "perdida gastos baja" },
  "chart-line": { Icon: ChartLine, keywords: "grafica inversion bolsa" },
  percent: { Icon: Percent, keywords: "interes descuento porcentaje cuota" },
  calculator: { Icon: Calculator, keywords: "calculo contabilidad cuentas" },
  "hand-coins": { Icon: HandCoins, keywords: "prestamo deuda pago" },
  "circle-dollar-sign": {
    Icon: CircleDollarSign,
    keywords: "dolar dinero moneda",
  },
  bitcoin: { Icon: Bitcoin, keywords: "cripto bitcoin inversion" },
  laptop: { Icon: Laptop, keywords: "computador portatil trabajo tecnologia" },
  monitor: { Icon: Monitor, keywords: "pantalla computador" },
  smartphone: { Icon: Smartphone, keywords: "celular telefono plan datos" },
  printer: { Icon: Printer, keywords: "impresora papeleria" },
  "file-text": {
    Icon: FileText,
    keywords: "documento contrato papeles tramite",
  },
  mail: { Icon: Mail, keywords: "correo email" },
  phone: { Icon: Phone, keywords: "llamada telefono" },
  handshake: { Icon: Handshake, keywords: "negocio acuerdo cliente" },
  building: { Icon: Building, keywords: "empresa oficina edificio" },
  scale: { Icon: Scale, keywords: "legal abogado justicia balanza" },
  shirt: { Icon: Shirt, keywords: "ropa camisa vestuario" },
  scissors: { Icon: Scissors, keywords: "peluqueria corte barberia" },
  sparkles: { Icon: Sparkles, keywords: "belleza estetica cuidado brillo" },
  gem: { Icon: Gem, keywords: "joyas lujo diamante" },
  watch: { Icon: Watch, keywords: "reloj accesorios" },
  backpack: { Icon: Backpack, keywords: "mochila colegio escuela" },
  "heart-handshake": {
    Icon: HeartHandshake,
    keywords: "donacion caridad ayuda",
  },
  church: { Icon: Church, keywords: "iglesia diezmo religion" },
  users: { Icon: Users, keywords: "familia amigos grupo" },
  "user-round": { Icon: UserRound, keywords: "persona cuenta perfil" },
  dog: { Icon: Dog, keywords: "perro mascota" },
  cat: { Icon: Cat, keywords: "gato mascota" },
  bird: { Icon: Bird, keywords: "ave pajaro mascota" },
  bone: { Icon: Bone, keywords: "hueso perro veterinario" },
  rabbit: { Icon: Rabbit, keywords: "conejo mascota" },
  turtle: { Icon: Turtle, keywords: "tortuga mascota" },
  star: { Icon: Star, keywords: "favorito estrella" },
  flag: { Icon: Flag, keywords: "meta objetivo bandera" },
  bell: { Icon: Bell, keywords: "recordatorio alerta notificacion" },
  calendar: { Icon: Calendar, keywords: "fecha mensual cita calendario" },
  clock: { Icon: Clock, keywords: "tiempo hora" },
  hourglass: { Icon: Hourglass, keywords: "plazo espera tiempo" },
  shield: { Icon: Shield, keywords: "seguro proteccion" },
  "shield-check": { Icon: ShieldCheck, keywords: "seguro poliza proteccion" },
  lock: { Icon: Lock, keywords: "seguridad candado" },
  repeat: { Icon: Repeat, keywords: "suscripcion recurrente mensual" },
  siren: { Icon: Siren, keywords: "emergencia imprevistos urgencia" },
  recycle: { Icon: Recycle, keywords: "reciclaje ambiente" },
  leaf: { Icon: Leaf, keywords: "naturaleza jardin ecologia" },
  "flower-2": { Icon: Flower2, keywords: "flores jardin" },
  "tree-pine": { Icon: TreePine, keywords: "arbol naturaleza navidad" },
  sprout: { Icon: Sprout, keywords: "planta cultivo crecimiento" },
  cloud: { Icon: Cloud, keywords: "nube almacenamiento hosting" },
  rocket: { Icon: Rocket, keywords: "emprendimiento proyecto inicio" },
  package: { Icon: Package, keywords: "paquete envio compras" },
  cigarette: { Icon: Cigarette, keywords: "cigarrillo vicio" },
};

/** Resolves an icon key to its LucideIcon component. An unknown key (the
 * backend added one this registry doesn't have yet, or corrupt data)
 * falls back to Tag rather than throwing - same "never invented, always
 * a deliberate fallback" rule category-palette.ts's OTHER_CATEGORY
 * already follows. */
export function resolveIcon(key: string): LucideIcon {
  return ICON_REGISTRY[key]?.Icon ?? Tag;
}

/** Lower-cases and strips accents, so "baño" finds "bano" and the other
 * way round. */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * The icon keys that match what the user typed, in their original order.
 * Matches the key itself ("shopping-bag") and the Spanish keywords
 * ("compras"); every word typed has to match somewhere, so "casa
 * arriendo" narrows instead of widening. An empty query returns all.
 */
export function searchIcons(keys: readonly string[], query: string): string[] {
  // Hyphens are word breaks on both sides, so "shopping-bag" finds the key
  // it names.
  const words = normalize(query.replace(/-/g, " "))
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [...keys];

  return keys.filter((key) => {
    const haystack = `${key.replace(/-/g, " ")} ${ICON_REGISTRY[key]?.keywords ?? ""}`;
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * A readable name for an icon, for tooltips and screen readers: the stored
 * key ("shopping-bag") is an identifier, not something to read out. In
 * Spanish it is the first search keyword, which is the icon's Spanish name
 * by construction; elsewhere it is the key with its hyphens undone.
 */
export function iconLabel(key: string, locale: string): string {
  const spanish = locale.startsWith("es")
    ? ICON_REGISTRY[key]?.keywords.split(" ")[0]
    : undefined;
  const text = spanish ?? key.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
