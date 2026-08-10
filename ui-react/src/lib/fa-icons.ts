import {
  Ban,
  BarChart2,
  Bell,
  Bookmark,
  Box,
  Calendar,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  DollarSign,
  File,
  FileText,
  Filter,
  Folder,
  Globe,
  Heart,
  Image,
  Inbox,
  LayoutDashboard,
  Link,
  List,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  Percent,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Star,
  Table,
  Tag,
  Trash2,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

// ─── FA → Lucide icon mapping ────────────────────────────────────────────────

const FA_ICON_MAP: Record<string, LucideIcon> = {
  cube:              Box,
  cubes:             Package,
  // `cog`/`file` : le dessin montré par le sélecteur du Dashboard Plugin Creator fait foi (Settings,
  // File), l'écart sur la nav est imperceptible (engrenage plein, page nue vs page lignée).
  cog:               Settings,
  cogs:              Sliders,
  wrench:            Wrench,
  sliders:           Sliders,
  users:             Users,
  user:              Users,
  'user-circle':     Users,
  globe:             Globe,
  file:              File,
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
  bookmark:          Bookmark,
  database:          Database,
  server:            Database,
  'shopping-cart':   ShoppingCart,
  'shopping-bag':    ShoppingCart,
  cart:              ShoppingCart,
  truck:             Truck,
  shipping:          Truck,
  map:               Map,
  'map-marker':      MapPin,
  'map-marker-alt':  MapPin,
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
  link:              Link,
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

  // ─── Icônes proposées par le Dashboard Plugin Creator ──────────────────────
  // Le créateur ne laisse choisir l'icône d'un plugin QUE dans cette liste fermée
  // (`melisdashboardplugincreator/datas/dashboardTabIcons`, app.interface.php), et son
  // sélecteur les dessine en SVG lucide (ui-react/src/icons.tsx de melis-dashboard-plugin-creator).
  // Chaque entrée ci-dessous est donc le JUMEAU lucide du dessin montré dans le sélecteur :
  // ce qu'on choisit à la création est exactement ce qu'on voit sur la tuile du dashboard.
  // ⚠️ En retirer une ne rend pas l'icône « générique » : elle retombe sur le repli `Wrench`
  //    passé par buildLegacyWidgetDef → toutes les tuiles concernées affichent une clé anglaise.
  'bar-chart-o':     BarChart2,   // charts
  warning:           TriangleAlert,
  table:             Table,
  comment:           MessageSquare,
  chain:             Link,        // FA4 nomme `fa-chain` ce que le sélecteur libelle « Link »
  'trash-o':         Trash2,
  filter:            Filter,
  search:            Search,
  group:             Users,
  'clock-o':         Clock,
  ban:               Ban,
  share:             Share2,
  list:              List,
  heart:             Heart,
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
