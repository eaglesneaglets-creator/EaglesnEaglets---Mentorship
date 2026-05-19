/**
 * Rule templates — the 5 measurable rule types from BE ProgramObjectiveRule.RuleType
 * (plan 14-06 T3). Single source of truth for the template-driven objective builder.
 */
export const RULE_TEMPLATES = [
    {
        type: 'modules_completed',
        label: 'Modules Completed',
        icon: 'school',
        helpText: 'Mentee must complete N modules.',
        unit: 'modules',
        defaultTarget: 5,
    },
    {
        type: 'assignments_passed',
        label: 'Assignments Passed',
        icon: 'task_alt',
        helpText: 'Mentee must pass N graded assignments.',
        unit: 'assignments',
        defaultTarget: 3,
    },
    {
        type: 'points_earned',
        label: 'Points Earned',
        icon: 'stars',
        helpText: 'Mentee must accumulate N growth points.',
        unit: 'points',
        defaultTarget: 500,
    },
    {
        type: 'posts_count',
        label: 'Community Posts',
        icon: 'forum',
        helpText: 'Mentee must make N posts in the community.',
        unit: 'posts',
        defaultTarget: 10,
    },
    {
        type: 'streak_days',
        label: 'Activity Streak',
        icon: 'local_fire_department',
        helpText: 'Mentee must maintain an N-day check-in streak.',
        unit: 'days',
        defaultTarget: 7,
    },
];

export const RULE_TEMPLATE_BY_TYPE = Object.fromEntries(
    RULE_TEMPLATES.map((t) => [t.type, t])
);
