import { memo } from 'react';
import PropTypes from 'prop-types';
import * as L from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Icon — the app's single icon component (lucide SVGs).
 *
 * Replaces the Material Symbols icon FONT, whose ligature text ("chevron_left",
 * "home") was read aloud by screen readers and became buttons' accessible
 * names, and which shipped a large render-blocking font.
 *
 * - `name` accepts the old Material Symbols names, so data like
 *   `{ icon: 'diversity_3' }` keeps working.
 * - Sized in `em`, so existing `text-xl` / `text-2xl` classes still size it.
 * - Decorative by default (aria-hidden). Icon-only buttons must carry their
 *   own aria-label; pass `label` only when the icon itself conveys meaning.
 * - `filled` fills the shape (the old FILL=1 variation).
 */
export const ICON_MAP = {
  // navigation & chrome
  home: L.House, dashboard: L.LayoutDashboard, menu: L.Menu, apps: L.LayoutGrid, grid_view: L.LayoutGrid,
  view_list: L.List, list_alt: L.ListChecks, more_vert: L.EllipsisVertical, close: L.X, cancel: L.CircleX,
  arrow_back: L.ArrowLeft, arrow_forward: L.ArrowRight, arrow_forward_ios: L.ChevronRight,
  chevron_left: L.ChevronLeft, chevron_right: L.ChevronRight, expand_more: L.ChevronDown,
  keyboard_arrow_down: L.ChevronDown, open_in_new: L.ExternalLink, launch: L.ExternalLink, link: L.Link,
  link_off: L.Unlink, search: L.Search, search_off: L.SearchX, filter_list: L.ListFilter, tune: L.SlidersHorizontal,
  sort: L.ArrowUpDown, refresh: L.RefreshCw, sync: L.RefreshCw, replay: L.RotateCcw, restart_alt: L.RotateCcw,
  undo: L.Undo2, settings: L.Settings, preferences: L.Settings2, logout: L.LogOut, login: L.LogIn, help: L.CircleHelp,
  info: L.Info, language: L.Globe, public: L.Globe, hub: L.Network, explore: L.Compass, travel_explore: L.Compass,
  // actions
  add: L.Plus, add_circle: L.CirclePlus, remove: L.Minus, edit: L.Pencil, edit_note: L.NotebookPen,
  delete: L.Trash2, archive: L.Archive, download: L.Download, upload: L.Upload, publish: L.Upload,
  cloud_upload: L.CloudUpload, cloud_off: L.CloudOff, upload_file: L.FileUp, attach_file: L.Paperclip,
  attachment: L.Paperclip, share: L.Share2, send: L.SendHorizontal, check: L.Check, done_all: L.CheckCheck,
  check_circle: L.CircleCheck, task_alt: L.CircleCheckBig, radio_button_checked: L.CircleDot, block: L.Ban,
  do_not_disturb_on: L.CircleMinus, visibility: L.Eye, visibility_off: L.EyeOff, lock: L.Lock, lock_open: L.LockOpen,
  lock_clock: L.LockKeyhole, fingerprint: L.Fingerprint, password: L.KeyRound, flag: L.Flag, bolt: L.Zap,
  // status & feedback
  error: L.CircleAlert, error_outline: L.CircleAlert, warning: L.TriangleAlert, gpp_bad: L.ShieldAlert,
  verified: L.BadgeCheck, verified_user: L.ShieldCheck, shield_person: L.ShieldUser,
  admin_panel_settings: L.ShieldUser, pending: L.Clock, pending_actions: L.ClipboardClock, schedule: L.Clock,
  hourglass_empty: L.Hourglass, hourglass_top: L.Hourglass, history: L.History, progress_activity: L.LoaderCircle,
  circle: L.Circle, star: L.Star, stars: L.Sparkles, grade: L.Star, favorite: L.Heart, auto_awesome: L.Sparkles,
  local_fire_department: L.Flame, trending_up: L.TrendingUp, trending_down: L.TrendingDown,
  show_chart: L.ChartLine, bar_chart: L.ChartColumn, donut_large: L.ChartPie, timeline: L.ChartNoAxesGantt,
  leaderboard: L.ChartColumnIncreasing, rocket_launch: L.Rocket, flight_takeoff: L.PlaneTakeoff,
  // people
  person: L.User, person_add: L.UserPlus, person_check: L.UserCheck, person_off: L.UserX, person_remove: L.UserMinus,
  people: L.Users, group: L.Users, groups: L.UsersRound, group_add: L.UserPlus, group_off: L.UserX,
  diversity_3: L.UsersRound, manage_accounts: L.UserCog, badge: L.IdCard, how_to_reg: L.UserCheck,
  handshake: L.Handshake, waving_hand: L.Hand, mood: L.Smile, sentiment_satisfied: L.Smile, psychology: L.Brain,
  psychiatry: L.Sprout, volunteer_activism: L.HandHeart, work: L.BriefcaseBusiness, workspaces: L.Boxes,
  // learning & content
  school: L.GraduationCap, menu_book: L.BookOpen, auto_stories: L.BookOpenText, library_books: L.Library,
  article: L.Newspaper, description: L.FileText, document: L.FileText, picture_as_pdf: L.FileText,
  find_in_page: L.FileSearch, folder: L.Folder, folder_open: L.FolderOpen, assignment: L.ClipboardList,
  assignment_add: L.ClipboardPlus, assignment_turned_in: L.ClipboardCheck, grading: L.ClipboardCheck,
  quiz: L.CircleQuestionMark, lightbulb: L.Lightbulb, sticky_note_2: L.StickyNote, format_quote: L.Quote,
  play_arrow: L.Play, play_circle: L.CirclePlay, videocam: L.Video, video: L.Video, video_call: L.Video,
  image: L.Image, add_photo_alternate: L.ImagePlus, broken_image: L.ImageOff, category: L.Shapes, style: L.Palette,
  palette: L.Palette, military_tech: L.Medal, workspace_premium: L.Award, emoji_events: L.Trophy,
  // community & communication
  chat: L.MessageSquare, chat_bubble: L.MessageCircle, chat_bubble_outline: L.MessageCircle, forum: L.MessagesSquare,
  sms: L.MessageSquareText, rate_review: L.MessageSquareText, mail: L.Mail, alternate_email: L.AtSign,
  mark_email_read: L.MailCheck, mark_email_unread: L.Mail, notifications: L.Bell, notifications_off: L.BellOff,
  campaign: L.Megaphone, add_reaction: L.SmilePlus, call: L.Phone, smartphone: L.Smartphone,
  inbox: L.Inbox, event: L.Calendar, event_available: L.CalendarCheck, calendar_today: L.Calendar,
  calendar_month: L.CalendarDays, location_on: L.MapPin,
  // nest metaphor
  nest_eco_leaf: L.Leaf, nest_cam_wired_stand: L.Bird, cottage: L.House, add_home: L.HousePlus, spring: L.Sprout,
  // commerce & giving
  storefront: L.Store, shopping_bag: L.ShoppingBag, shopping_cart: L.ShoppingCart, inventory: L.Package,
  local_shipping: L.Truck, receipt: L.Receipt, receipt_long: L.ReceiptText, payment: L.CreditCard,
  payments: L.Banknote, savings: L.PiggyBank, database: L.Database,
};

const Icon = memo(function Icon({ name, className, filled = false, label, strokeWidth = 2, ...rest }) {
  const Component = ICON_MAP[name];
  if (!Component) {
    if (import.meta.env.DEV && name) {
      console.warn(`[Icon] No lucide mapping for "${name}". Add it to ICON_MAP in shared/components/ui/Icon.jsx.`);
    }
    return null;
  }
  return (
    <Component
      width="1em"
      height="1em"
      strokeWidth={strokeWidth}
      fill={filled ? 'currentColor' : 'none'}
      className={cn('app-icon inline-block flex-shrink-0 align-[-0.125em]', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      data-icon={name}
      {...rest}
    />
  );
});

Icon.propTypes = {
  /** Material Symbols-style name, e.g. "chevron_left". */
  name: PropTypes.string,
  className: PropTypes.string,
  filled: PropTypes.bool,
  /** Accessible name — only when the icon alone carries meaning. */
  label: PropTypes.string,
  strokeWidth: PropTypes.number,
};

export default Icon;
