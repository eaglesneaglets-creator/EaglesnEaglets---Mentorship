/**
 * Role-specific welcome-tour content.
 *
 * Each step: { icon (material-symbols name), title, body, cta? }.
 * Only the LAST step's `cta` is used — it's the "where do I go now" button that
 * drops the user into the most valuable first action for their role.
 *
 * Copy is intentionally short and benefit-led. Refine the wording to match the
 * product voice — the mechanism doesn't care how many steps you add.
 */

export const EAGLET_TOUR_STEPS = [
  {
    icon: 'waving_hand',
    title: 'Welcome to your nest',
    body: "You're an Eaglet — here to grow with a mentor's guidance. Here's how to get the most out of the platform in under a minute.",
  },
  {
    icon: 'travel_explore',
    title: 'Find your mentor',
    body: 'Browse Eagles whose experience matches your goals, then request to join their nest. Once they accept, their program and resources appear on your dashboard.',
  },
  {
    icon: 'local_fire_department',
    title: 'Show up daily',
    body: 'Check in each day to build your streak and earn points. Complete assignments your mentor sets to climb your level and unlock badges.',
  },
  {
    icon: 'rocket_launch',
    title: 'Ready to grow?',
    body: 'The first step is finding a mentor. Let’s go discover the nest that fits you.',
    cta: { label: 'Find a mentor', to: '/eaglet/nest' },
  },
];

export const EAGLE_TOUR_STEPS = [
  {
    icon: 'waving_hand',
    title: 'Welcome, mentor',
    body: "You're an Eagle — here to guide the next generation. Here's a quick tour of the tools you'll use to lead your nest.",
  },
  {
    icon: 'add_home',
    title: 'Build your nest',
    body: 'Create a nest and share it so Eaglets can request to join. You control who enters and shape the program they follow.',
  },
  {
    icon: 'upload_file',
    title: 'Share content & set the path',
    body: 'Upload videos, documents, and assignments. Structure them into a program so every Eaglet has a clear path to follow.',
  },
  {
    icon: 'military_tech',
    title: 'Recognize progress',
    body: 'Award points as your Eaglets grow. Your dashboard tracks their progress so you always know who needs a nudge.',
  },
  {
    icon: 'rocket_launch',
    title: 'Ready to lead?',
    body: 'Start by setting up the nest your Eaglets will call home.',
    cta: { label: 'Set up your nest', to: '/eagle/nests' },
  },
];

export const getTourSteps = (role) => {
  if (role === 'eagle') return EAGLE_TOUR_STEPS;
  if (role === 'eaglet') return EAGLET_TOUR_STEPS;
  return null; // no tour for admin / other roles
};
