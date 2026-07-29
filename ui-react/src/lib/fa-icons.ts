import {
  BarChart2,
  Bell,
  Box,
  Calendar,
  ChevronRight,
  Cog,
  Cpu,
  Database,
  DollarSign,
  FileText,
  Folder,
  Globe,
  Image,
  Inbox,
  LayoutDashboard,
  Mail,
  Map,
  Package,
  Palette,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Star,
  Tag,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

// ─── FA → Lucide icon mapping ────────────────────────────────────────────────

const FA_ICON_MAP: Record<string, LucideIcon> = {
  cube:              Box,
  cubes:             Package,
  cog:               Cog,
  cogs:              Sliders,
  wrench:            Wrench,
  sliders:           Sliders,
  users:             Users,
  user:              Users,
  'user-circle':     Users,
  globe:             Globe,
  file:              FileText,
  'file-text':       FileText,
  'file-alt':        FileText,
  image:             Image,
  images:            Image,
  photo:             Image,
  folder:            Folder,
  'folder-open':     Folder,
  chart:             BarChart2,
  'bar-chart':       BarChart2,
  'line-chart':      BarChart2,
  analytics:         BarChart2,
  dashboard:         LayoutDashboard,
  tachometer:        LayoutDashboard,
  'tachometer-alt':  LayoutDashboard,
  calendar:          Calendar,
  envelope:          Mail,
  mail:              Mail,
  tag:               Tag,
  tags:              Tag,
  percent:           Percent,
  star:              Star,
  bookmark:          Star,
  database:          Database,
  server:            Database,
  'shopping-cart':   ShoppingCart,
  'shopping-bag':    ShoppingCart,
  cart:              ShoppingCart,
  truck:             Truck,
  shipping:          Truck,
  map:               Map,
  'map-marker':      Map,
  'map-marker-alt':  Map,
  shield:            ShieldCheck,
  'shield-alt':      ShieldCheck,
  lock:              ShieldCheck,
  robot:             Cpu,
  android:           Cpu,
  microchip:         Cpu,
  palette:           Palette,
  'paint-brush':     Palette,
  'chevron-right':   ChevronRight,
  'puzzle-piece':    Package,
  language:          Globe,
  flag:              Tag,
  comments:          Mail,
  bell:              Bell,
  'bell-o':          Bell,
  shopping:          ShoppingCart,
  'list-alt':        FileText,
  tasks:             FileText,
  sitemap:           Folder,
  paint:             Palette,
  'paint-bucket':    Palette,
  desktop:           LayoutDashboard,
  columns:           LayoutDashboard,
  th:                LayoutDashboard,
  'th-large':        LayoutDashboard,
  home:              LayoutDashboard,
  book:              FileText,
  'book-open':       FileText,
  newspaper:         FileText,
  rss:               Globe,
  link:              Globe,
  'external-link':   Globe,
  'external-link-alt': Globe,
  download:          Database,
  upload:            Database,
  'cloud-upload':    Database,
  'cloud-download':  Database,
  tools:             Wrench,
  hammer:            Wrench,
  'magic':           Palette,
  brain:             Cpu,
  'bolt':            Cpu,
  eye:               ShieldCheck,
  fingerprint:       ShieldCheck,
  key:               ShieldCheck,
  store:             ShoppingCart,
  box:               Package,
  boxes:             Package,
  layer:             Package,
  layers:            Package,
  dollar:            DollarSign,
  usd:               DollarSign,
  money:             DollarSign,
  'money-bill':      DollarSign,
  inbox:             Inbox,
  'envelope-open':   Inbox,
}


/** Classes FontAwesome purement décoratives (taille, alignement, préfixe de famille) : à ignorer
 *  lors de la résolution, sinon `fa fa-list-alt fa-2x` ne matche jamais. */
const FA_MODIFIERS = new Set(['fa', 'fas', 'far', 'fab', 'fal', 'fw', 'lg', 'glyphicons', 'icon'])

/**
 * Résout une classe d'icône Melis (FontAwesome 4 / glyphicons, telle que déclarée dans les configs
 * PHP : `'icon' => 'fa fa-calendar'`) vers une icône lucide.
 *
 * On teste d'abord le token COMPLET (`list-alt`, `bar-chart-o`) puis ses fragments, pour que les
 * clés composées du mapping l'emportent sur un fragment générique.
 */
export function faToLucide(faClass: string, fallback: LucideIcon = Box): LucideIcon {
  const tokens = (faClass || '')
    .split(/\s+/)
    .map((t) => t.replace(/^(fa|fas|far|fab|fal|icon)-/, '').trim())
    .filter((t) => t && !FA_MODIFIERS.has(t) && !/^\d+x$/.test(t))

  // 1) token complet ("list-alt"), 2) token sans suffixe FA4 ("-o", "-alt") , 3) fragments.
  for (const token of tokens) {
    if (FA_ICON_MAP[token]) return FA_ICON_MAP[token]
    const stripped = token.replace(/-(o|alt)$/, '')
    if (FA_ICON_MAP[stripped]) return FA_ICON_MAP[stripped]
  }
  for (const token of tokens) {
    for (const part of token.split('-')) {
      if (FA_ICON_MAP[part]) return FA_ICON_MAP[part]
    }
  }
  return fallback
}
