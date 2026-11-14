/**
 * Guided tour content, per role and situation.
 *
 * Step: { target, mobileTarget?, title, body, side? }
 *   target        data-tour id on desktop (sidebar items, header controls)
 *   mobileTarget  data-tour id below lg (bottom tab bar); omitted -> target,
 *                 and a target that isn't on screen falls back to a centred card
 *
 * Bump the version suffix of a tour id when its content changes enough that
 * everyone should see it again.
 */

const SEARCH = {
  target: 'search',
  mobileTarget: 'tab-more',
  title: 'Find anything in seconds',
  body: 'Press Ctrl K (⌘K on a Mac) or use this box to jump to any page or action without hunting through menus.',
  side: 'bottom',
};
const NOTIFICATIONS = {
  target: 'notifications',
  title: 'Stay in the loop',
  body: 'New messages, grades, badges and nest activity land here. A red dot means something is waiting for you.',
  side: 'bottom',
};
const ACCOUNT = {
  target: 'user-menu',
  mobileTarget: 'tab-more',
  title: 'Your account',
  body: 'Profile, notification preferences, help and log out live here. You can replay this tour from this menu any time.',
  side: 'right',
};

const eagletSteps = ({ hasActiveProgram }) => [
  {
    target: 'nav-dashboard',
    mobileTarget: 'tab-dashboard',
    title: 'Your daily home',
    body: 'Check in each day, pick up your next lesson and see today’s verse. Small, steady steps build your streak.',
  },
  hasActiveProgram
    ? {
        target: 'nav-nest',
        mobileTarget: 'tab-nest',
        title: 'Your nest',
        body: 'Your mentor and fellow eaglets gather here: updates, events and your program’s objectives.',
      }
    : {
        target: 'nav-nest',
        mobileTarget: 'tab-nest',
        title: 'Find your mentor',
        body: 'Start here. Browse mentors whose experience matches your goals and ask to join their nest. Assignments and messages open up once you’re in.',
      },
  {
    target: 'nav-assignments',
    mobileTarget: 'tab-assignments',
    title: 'Lessons and assignments',
    body: hasActiveProgram
      ? 'Work your mentor sets you appears here. Submit it, track grades and earn points as you go.'
      : 'Once you join a nest, the lessons and assignments your mentor sets will appear here.',
  },
  {
    target: 'nav-messages',
    mobileTarget: 'tab-messages',
    title: 'Talk to your mentor',
    body: 'Message your mentor directly or chat with your whole nest.',
  },
  SEARCH,
  NOTIFICATIONS,
  ACCOUNT,
];

const eagleSteps = () => [
  {
    target: 'nav-dashboard',
    mobileTarget: 'tab-dashboard',
    title: 'What needs you today',
    body: 'Your dashboard shows submissions waiting for a grade, new join requests and how your eaglets are progressing.',
  },
  {
    target: 'nav-nest',
    mobileTarget: 'tab-nest',
    title: 'Your nest',
    body: 'Run your community: approve eaglets, post updates, schedule events and set up your program.',
  },
  {
    target: 'nav-grading',
    mobileTarget: 'tab-grading',
    title: 'Grade and give feedback',
    body: 'Review submitted work, score it and leave feedback. Eaglets are notified straight away.',
  },
  {
    target: 'nav-content',
    mobileTarget: 'tab-more',
    title: 'Share lessons',
    body: 'Upload videos, documents and quizzes, then share them with your nest.',
  },
  {
    target: 'nav-messages',
    mobileTarget: 'tab-messages',
    title: 'Stay close to your eaglets',
    body: 'Message eaglets one to one or talk to the whole nest.',
  },
  SEARCH,
  NOTIFICATIONS,
  ACCOUNT,
];

const adminSteps = ({ isSuperAdmin }) => [
  {
    target: 'nav-dashboard',
    mobileTarget: 'tab-dashboard',
    title: 'Platform at a glance',
    body: 'Sign-ups, active mentors and mentees, and anything waiting on an admin decision.',
  },
  {
    target: 'nav-users',
    mobileTarget: 'tab-users',
    title: 'People and verification',
    body: 'Review identity checks, approve mentors and manage accounts. The number on this item is reviews waiting for you.',
  },
  isSuperAdmin && {
    target: 'nav-nests',
    mobileTarget: 'tab-more',
    title: 'Nests',
    body: 'Create nests, assign mentors and keep an eye on each community’s health.',
  },
  {
    target: 'nav-content',
    mobileTarget: 'tab-content',
    title: 'Platform content',
    body: 'Publish resources every mentee can see and keep the library tidy.',
  },
  SEARCH,
  ACCOUNT,
].filter(Boolean);

const WELCOME = {
  eaglet: {
    title: 'Welcome to Eagles & Eaglets',
    body: 'This is your space to grow with a mentor and a community that walks with you. Take a one-minute tour of where everything is?',
  },
  eagle: {
    title: 'Welcome, mentor',
    body: 'Thank you for investing in the next generation. Take a one-minute tour of the tools you’ll use to lead your nest?',
  },
  admin: {
    title: 'Welcome to the admin console',
    body: 'Here’s a quick look at where reviews, people and platform settings live.',
  },
};

/**
 * @param {{ view: 'eaglet'|'eagle'|'admin', hasActiveProgram?: boolean, isSuperAdmin?: boolean }} ctx
 */
export function getTour({ view, hasActiveProgram = false, isSuperAdmin = false }) {
  if (view === 'admin') {
    return { id: 'admin-intro-v1', welcome: WELCOME.admin, steps: adminSteps({ isSuperAdmin }) };
  }
  if (view === 'eagle') {
    return { id: 'eagle-intro-v1', welcome: WELCOME.eagle, steps: eagleSteps() };
  }
  return { id: 'eaglet-intro-v1', welcome: WELCOME.eaglet, steps: eagletSteps({ hasActiveProgram }) };
}

/** Pages where the tour may start by itself (never interrupt deep links). */
export const AUTO_START_PATHS = ['/eaglet/dashboard', '/eagle/dashboard', '/admin/dashboard'];
