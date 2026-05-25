'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Command,
  Compass,
  Edit3,
  Flame,
  Focus,
  GripVertical,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LogOut,
  Moon,
  MoreHorizontal,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/lib/constants/branding';
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '@/utils/categoryPresentation';
import { useThemeSync } from '@/hooks/useThemeSync';
import type {
  Activity as ActivityRecord,
  CategoryGroup,
  Goal,
  LifeCategory,
  ThemePreference,
  UserProfile,
} from '@/lib/types/ascend';
import type { useAscend } from '@/hooks/useAscend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type AscendApi = ReturnType<typeof useAscend>;
type SectionId =
  | 'dashboard'
  | 'evolution'
  | 'activities'
  | 'goals'
  | 'analytics'
  | 'timeline'
  | 'insights'
  | 'focus'
  | 'categories'
  | 'profile'
  | 'settings';

type ActivityMode = 'board' | 'timeline' | 'calendar' | 'analytics';

const NAV_GROUPS: { label: string; items: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: 'Command',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'evolution', label: 'Evolution', icon: Sparkles },
      { id: 'activities', label: 'Activities', icon: Activity },
      { id: 'goals', label: 'Goals', icon: Target },
      { id: 'analytics', label: 'Analytics', icon: LineChart },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'timeline', label: 'Timeline', icon: CalendarDays },
      { id: 'insights', label: 'Insights', icon: WandSparkles },
      { id: 'focus', label: 'Focus', icon: Focus },
      { id: 'categories', label: 'Categories', icon: Compass },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: UserRound },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const ACCENT_OPTIONS = ['#68a7ff', '#34d399', '#a78bfa', '#fb7185', '#f59e0b', '#22d3ee', '#f472b6', '#94a3b8'];
const THEME_OPTIONS: { id: ThemePreference; label: string; detail: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'deep-midnight', label: 'Deep Midnight', detail: 'Matte black, navy depth', icon: Moon },
  { id: 'aurora-blue', label: 'Aurora Blue', detail: 'Cool cinematic blue', icon: Sparkles },
  { id: 'crimson-gradient', label: 'Crimson Gradient', detail: 'Warm focused contrast', icon: Flame },
  { id: 'arctic-light', label: 'Arctic Light', detail: 'Soft premium light', icon: Sun },
  { id: 'system', label: 'System Sync', detail: 'Follow device theme', icon: Palette },
];

function formatHours(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function initials(name?: string) {
  return (name || 'A')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function sectionTitle(id: SectionId) {
  return NAV_GROUPS.flatMap((group) => group.items).find((item) => item.id === id)?.label ?? 'Dashboard';
}

function getCategory(categoryId: string, categories: LifeCategory[]) {
  return categories.find((category) => category.id === categoryId);
}

function ProgressRing({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('os-ring', compact && 'os-ring--compact')} style={{ '--ring-value': `${safe * 3.6}deg` } as React.CSSProperties}>
      <div>
        <strong>{safe}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function MetricTile({ label, value, detail, tone }: { label: string; value: string | number; detail?: string; tone?: string }) {
  return (
    <div className="metric-tile" style={{ '--metric-tone': tone ?? 'var(--primary)' } as React.CSSProperties}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

function SectionHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {detail ? <span>{detail}</span> : null}
      </div>
      {action}
    </div>
  );
}

function ShellSidebar({
  activeSection,
  collapsed,
  setActiveSection,
  setCollapsed,
  api,
}: {
  activeSection: SectionId;
  collapsed: boolean;
  setActiveSection: (id: SectionId) => void;
  setCollapsed: (value: boolean) => void;
  api: AscendApi;
}) {
  const { state, scores } = api;

  return (
    <aside className={cn('app-sidebar', collapsed && 'app-sidebar--collapsed')}>
      <div className="sidebar-brand">
        <button type="button" className="brand-mark" onClick={() => setActiveSection('dashboard')} aria-label="Open dashboard">
          <Compass className="size-4" />
        </button>
        {!collapsed ? (
          <div className="sidebar-copy">
            <strong>{APP_NAME}</strong>
            <span>{APP_VERSION} adaptive OS</span>
          </div>
        ) : null}
        <button type="button" className="icon-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <button type="button" className="sidebar-profile" onClick={() => setActiveSection('profile')} title={collapsed ? 'Profile' : undefined}>
        <div className="avatar-shell">
          {state.profile?.avatarUrl ? <img src={state.profile.avatarUrl} alt="" /> : initials(state.profile?.name)}
        </div>
        {!collapsed ? (
          <div>
            <strong>{state.profile?.name ?? 'Operator'}</strong>
            <span>{scores.tierLabel} | index {scores.evolutionIndex}</span>
          </div>
        ) : null}
      </button>

      <nav className="sidebar-nav" aria-label="AscendOS sections">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-group">
            {!collapsed ? <p>{group.label}</p> : null}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn('sidebar-link', active && 'sidebar-link--active')}
                  onClick={() => setActiveSection(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function TopNav({ activeSection, api, setActiveSection }: { activeSection: SectionId; api: AscendApi; setActiveSection: (section: SectionId) => void }) {
  const { state, scores, updatePreferences } = api;
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [clearedLogIds, setClearedLogIds] = useState<string[]>([]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [
      ...state.activities
        .filter((activity) => activity.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map((activity) => ({ id: activity.id, label: activity.title, detail: 'Activity', section: 'activities' as SectionId })),
      ...state.goals
        .filter((goal) => goal.title.toLowerCase().includes(q))
        .slice(0, 3)
        .map((goal) => ({ id: goal.id, label: goal.title, detail: 'Goal', section: 'goals' as SectionId })),
      ...state.categories
        .filter((category) => category.label.toLowerCase().includes(q))
        .slice(0, 3)
        .map((category) => ({ id: category.id, label: category.label, detail: 'Category', section: 'categories' as SectionId })),
    ];
  }, [query, state.activities, state.categories, state.goals]);

  const notifications = state.evolutionLog.filter((entry) => !clearedLogIds.includes(entry.id)).slice(0, 6);

  return (
    <header className="top-nav">
      <div className="top-nav__title">
        <span>{APP_NAME}</span>
        <strong>{sectionTitle(activeSection)}</strong>
      </div>

      <div className="search-shell">
        <label className="global-search">
          <Search className="size-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities, goals, categories" />
          <Command className="size-3.5" />
        </label>
        {query ? (
          <div className="dropdown-panel search-results">
            {results.length ? (
              results.map((result) => (
                <button
                  key={`${result.detail}-${result.id}`}
                  type="button"
                  onClick={() => {
                    setActiveSection(result.section);
                    setQuery('');
                  }}
                >
                  <strong>{result.label}</strong>
                  <span>{result.detail}</span>
                </button>
              ))
            ) : (
              <p>No matching signal found.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="top-nav__actions">
        <div className="menu-anchor">
          <button type="button" className="icon-button" onClick={() => setQuickOpen(!quickOpen)} aria-label="Quick actions">
            <Plus className="size-4" />
          </button>
          {quickOpen ? (
            <div className="dropdown-panel action-menu">
              {[
                ['Log activity', 'activities', Activity],
                ['Create goal', 'goals', Target],
                ['Start focus', 'focus', Focus],
                ['Customize system', 'settings', Settings],
              ].map(([label, section, Icon]) => (
                <button
                  key={label as string}
                  type="button"
                  onClick={() => {
                    setActiveSection(section as SectionId);
                    setQuickOpen(false);
                  }}
                >
                  <Icon className="size-4" />
                  <span>{label as string}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="menu-anchor">
          <button type="button" className="icon-button" onClick={() => setThemeOpen(!themeOpen)} aria-label="Choose theme">
            <Palette className="size-4" />
          </button>
          {themeOpen ? (
            <div className="dropdown-panel theme-menu">
              {THEME_OPTIONS.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={state.preferences.theme === theme.id ? 'active' : ''}
                    onClick={() => {
                      updatePreferences({ theme: theme.id });
                      setThemeOpen(false);
                    }}
                  >
                    <Icon className="size-4" />
                    <span>
                      <strong>{theme.label}</strong>
                      <small>{theme.detail}</small>
                    </span>
                    {state.preferences.theme === theme.id ? <Check className="size-4" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="menu-anchor">
          <button type="button" className="icon-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notifications">
            <Bell className="size-4" />
            {notifications.length ? <span className="notification-dot" /> : null}
          </button>
          {notificationsOpen ? (
            <div className="dropdown-panel notifications-panel">
              <div className="mini-heading">
                <strong>Live updates</strong>
                <button type="button" onClick={() => setClearedLogIds(state.evolutionLog.map((entry) => entry.id))}>Clear</button>
              </div>
              {notifications.length ? (
                notifications.map((entry) => (
                  <button key={entry.id} type="button" onClick={() => setActiveSection('timeline')}>
                    <span className="pulse-dot" />
                    <span>
                      <strong>{entry.title}</strong>
                      <small>{entry.detail ?? entry.dateKey}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p>No unread updates.</p>
              )}
            </div>
          ) : null}
        </div>

        <button type="button" className="top-avatar" onClick={() => setActiveSection('profile')}>
          <span>{scores.evolutionIndex}</span>
          <div className="avatar-shell avatar-shell--small">
            {state.profile?.avatarUrl ? <img src={state.profile.avatarUrl} alt="" /> : initials(state.profile?.name)}
          </div>
        </button>
      </div>
    </header>
  );
}

function DashboardHome({ api, setActiveSection }: { api: AscendApi; setActiveSection: (section: SectionId) => void }) {
  const { state, scores, analytics, insights, toggleWidget, moveDashboardWidget } = api;
  const widgets = state.dashboardWidgets.filter((widget) => widget.visible).sort((a, b) => a.order - b.order);
  const latest = state.activities[0];
  const maxTrend = Math.max(...analytics.productivityTrend, 1);

  return (
    <section className="workspace-section fade-in">
      <div className="hero-system">
        <div className="hero-copy">
          <p className="eyebrow">Adaptive life operating system</p>
          <h1>{state.profile?.evolutionFocus || 'Build a calmer, sharper personal system.'}</h1>
          <p>
            {formatHours(analytics.weeklySummary.totalMinutes)} logged this week across {analytics.weeklySummary.activitiesCount} sessions.
            Your current operating tier is {scores.tierLabel.toLowerCase()}.
          </p>
          <div className="hero-actions">
            <Button type="button" onClick={() => setActiveSection('activities')}><Plus className="size-4" />Log activity</Button>
            <button type="button" className="ghost-button" onClick={() => setActiveSection('analytics')}>View analytics</button>
          </div>
        </div>
        <div className="hero-orbit">
          <ProgressRing value={scores.evolutionIndex} label="index" />
          <div>
            <strong>{scores.evolutionPoints}</strong>
            <span>evolution points</span>
          </div>
        </div>
      </div>

      <div className="metric-grid metric-grid--dashboard">
        <MetricTile label="Current streak" value={`${state.streak.current}d`} detail={`Longest ${state.streak.longest}d`} tone="#fb7185" />
        <MetricTile label="Focus score" value={`${scores.focus}%`} detail={`${scores.discipline}% discipline`} tone="#68a7ff" />
        <MetricTile label="Balance" value={`${analytics.balanceScore}%`} detail={analytics.weeklySummary.topCategory} tone="#34d399" />
        <MetricTile label="Latest signal" value={latest ? formatHours(latest.durationMinutes) : 'None'} detail={latest?.title ?? 'Log your first activity'} tone="#a78bfa" />
      </div>

      <div className="widget-grid">
        {widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            api={api}
            maxTrend={maxTrend}
            insights={insights}
            setActiveSection={setActiveSection}
            onHide={() => toggleWidget(widget.id)}
            onMoveUp={() => moveDashboardWidget(widget.id, -1)}
            onMoveDown={() => moveDashboardWidget(widget.id, 1)}
          />
        ))}
      </div>
    </section>
  );
}

function WidgetChrome({
  title,
  eyebrow,
  children,
  action,
  onHide,
  onMoveUp,
  onMoveDown,
  wide = false,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onHide?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  wide?: boolean;
}) {
  return (
    <article className={cn('product-panel', wide && 'product-panel--wide')}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="panel-tools">
          {action}
          {onMoveUp ? <button type="button" className="icon-button" onClick={onMoveUp} aria-label="Move widget up"><ArrowUp className="size-4" /></button> : null}
          {onMoveDown ? <button type="button" className="icon-button" onClick={onMoveDown} aria-label="Move widget down"><ArrowDown className="size-4" /></button> : null}
          {onHide ? <button type="button" className="icon-button" onClick={onHide} aria-label="Hide widget"><MoreHorizontal className="size-4" /></button> : null}
        </div>
      </div>
      {children}
    </article>
  );
}

function DashboardWidget({
  id,
  title,
  api,
  maxTrend,
  insights,
  setActiveSection,
  onHide,
  onMoveUp,
  onMoveDown,
}: {
  id: string;
  title: string;
  api: AscendApi;
  maxTrend: number;
  insights: { id: string; message: string }[];
  setActiveSection: (section: SectionId) => void;
  onHide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { state, scores, analytics } = api;

  if (id === 'mission-control') {
    return (
      <WidgetChrome title="Today at a glance" eyebrow="Mission Control" wide onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <div className="control-grid">
          <ProgressRing value={scores.tierProgressPct} label="tier" compact />
          <div className="dimension-grid">
            {[
              ['Focus', scores.focus],
              ['Discipline', scores.discipline],
              ['Balance', scores.balance],
              ['Consistency', scores.consistency],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="dimension-label"><span>{label}</span><strong>{value}</strong></div>
                <div className="soft-track"><span style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </WidgetChrome>
    );
  }

  if (id === 'category-balance') {
    return (
      <WidgetChrome title="Life balance" eyebrow="Category System" action={<button type="button" className="text-button" onClick={() => setActiveSection('categories')}>Manage</button>} onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <div className="stack-list">
          {analytics.categoryBreakdown.slice(0, 5).map((item) => (
            <div key={item.id} className="balance-row">
              <span style={{ backgroundColor: item.color }} />
              <div>
                <strong>{item.label}</strong>
                <small>{formatHours(item.minutes)}</small>
              </div>
            </div>
          ))}
        </div>
      </WidgetChrome>
    );
  }

  if (id === 'focus-rhythm') {
    return (
      <WidgetChrome title="Weekly graph" eyebrow="Focus Rhythm" onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <div className="bar-chart">
          {analytics.productivityTrend.map((value, index) => (
            <div key={`${value}-${index}`}>
              <span style={{ height: `${Math.max(8, (value / maxTrend) * 100)}%` }} />
              <small>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</small>
            </div>
          ))}
        </div>
      </WidgetChrome>
    );
  }

  if (id === 'activity-snapshot') {
    return (
      <WidgetChrome title="Latest signals" eyebrow="Activity Snapshot" action={<button type="button" className="text-button" onClick={() => setActiveSection('activities')}>Open</button>} onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <ActivityList activities={state.activities.slice(0, 4)} categories={state.categories} toggleActivity={api.toggleActivity} deleteActivity={api.deleteActivity} reorderActivities={api.reorderActivities} compact />
      </WidgetChrome>
    );
  }

  if (id === 'evolution-graph') {
    return (
      <WidgetChrome title="Behavioral dimensions" eyebrow="Evolution Graph" wide onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <div className="evolution-matrix">
          {[
            ['Focus', scores.focus, '#68a7ff'],
            ['Discipline', scores.discipline, '#a78bfa'],
            ['Balance', scores.balance, '#34d399'],
            ['Consistency', scores.consistency, '#f59e0b'],
            ['Growth', scores.growth, '#fb7185'],
          ].map(([label, value, color]) => (
            <MetricTile key={label} label={label as string} value={`${value}%`} detail="live score" tone={color as string} />
          ))}
        </div>
      </WidgetChrome>
    );
  }

  return (
    <WidgetChrome title={title} eyebrow="Insights" onHide={onHide} onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
      <div className="insight-stack">
        {insights.map((insight) => <p key={insight.id}>{insight.message}</p>)}
      </div>
    </WidgetChrome>
  );
}

function ActivityComposer({ api }: { api: AscendApi }) {
  const { state, logActivity } = api;
  const activeCategories = state.categories.filter((category) => category.active);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(activeCategories[0]?.id ?? 'coding');
  const [duration, setDuration] = useState(String(state.preferences.defaultActivityMinutes));
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(true);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    if (!activeCategories.some((item) => item.id === category)) setCategory(activeCategories[0]?.id ?? 'coding');
  }, [activeCategories, category]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    logActivity({
      title: title.trim(),
      category,
      durationMinutes: Math.max(1, Number(duration) || state.preferences.defaultActivityMinutes),
      notes: notes.trim() || undefined,
      completed,
    });
    setTitle('');
    setNotes('');
    setJustLogged(true);
    window.setTimeout(() => setJustLogged(false), 900);
  }

  return (
    <form onSubmit={submit} className={cn('composer-panel', justLogged && 'composer-panel--success')}>
      <div>
        <Label htmlFor="activity-title">Activity</Label>
        <Input id="activity-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Deep work, workout, edit session" />
      </div>
      <div>
        <Label htmlFor="activity-category">Category</Label>
        <select id="activity-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          {activeCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="activity-duration">Minutes</Label>
        <Input id="activity-duration" type="number" min={1} value={duration} onChange={(event) => setDuration(event.target.value)} />
      </div>
      <label className="toggle-row composer-toggle">
        <input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />
        Completed
      </label>
      <div className="composer-notes">
        <Label htmlFor="activity-notes">Notes</Label>
        <Textarea id="activity-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Optional signal, context, or reflection" />
      </div>
      <Button type="submit"><Plus className="size-4" />Log</Button>
    </form>
  );
}

function ActivityList({
  activities,
  categories,
  toggleActivity,
  deleteActivity,
  reorderActivities,
  compact = false,
}: {
  activities: ActivityRecord[];
  categories: LifeCategory[];
  toggleActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
  reorderActivities: (sourceId: string, targetId: string) => void;
  compact?: boolean;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (activities.length === 0) {
    return <div className="empty-state">No activities logged yet.</div>;
  }

  return (
    <div className={cn('activity-list', compact && 'activity-list--compact')}>
      {activities.map((activity) => {
        const category = getCategory(activity.category, categories);
        return (
          <article
            key={activity.id}
            className={cn('activity-card', draggedId === activity.id && 'activity-card--dragging')}
            draggable
            onDragStart={() => setDraggedId(activity.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) reorderActivities(draggedId, activity.id);
              setDraggedId(null);
            }}
            onDragEnd={() => setDraggedId(null)}
          >
            <GripVertical className="size-4 drag-handle" />
            <button type="button" onClick={() => toggleActivity(activity.id)} aria-label="Toggle activity">
              {activity.completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            </button>
            <div>
              <strong>{activity.title}</strong>
              <span>{formatHours(activity.durationMinutes)} | {category?.label ?? activity.category} | {activity.dateKey}</span>
              {!compact && activity.notes ? <p>{activity.notes}</p> : null}
            </div>
            {category ? <span className="activity-accent" style={{ backgroundColor: category.color }} /> : null}
            <button type="button" onClick={() => deleteActivity(activity.id)} aria-label="Delete activity">
              <Trash2 className="size-4" />
            </button>
          </article>
        );
      })}
    </div>
  );
}

function ActivitiesSection({ api }: { api: AscendApi }) {
  const { state, analytics } = api;
  const [mode, setMode] = useState<ActivityMode>('board');

  return (
    <section className="workspace-section fade-in">
      <SectionHeader
        eyebrow="Activity Management"
        title="A flexible daily logging surface"
        detail="Board, timeline, calendar, and analytics modes all update from the same live activity stream."
        action={<ActivityModeSwitch mode={mode} setMode={setMode} />}
      />
      <ActivityComposer api={api} />
      {mode === 'board' ? (
        <ActivityList activities={state.activities} categories={state.categories} toggleActivity={api.toggleActivity} deleteActivity={api.deleteActivity} reorderActivities={api.reorderActivities} />
      ) : mode === 'timeline' ? (
        <TimelinePanel api={api} />
      ) : mode === 'calendar' ? (
        <HeatmapPanel heatmap={analytics.heatmap} />
      ) : (
        <AnalyticsSection api={api} embedded />
      )}
    </section>
  );
}

function ActivityModeSwitch({ mode, setMode }: { mode: ActivityMode; setMode: (mode: ActivityMode) => void }) {
  return (
    <div className="segmented-control">
      {[
        ['board', ListChecks],
        ['timeline', CalendarDays],
        ['calendar', Flame],
        ['analytics', BarChart3],
      ].map(([id, Icon]) => (
        <button key={id as string} type="button" className={mode === id ? 'active' : ''} onClick={() => setMode(id as ActivityMode)} aria-label={`${id} mode`}>
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

function TimelinePanel({ api }: { api: AscendApi }) {
  const { state } = api;
  return (
    <div className="timeline-panel">
      {state.evolutionLog.length ? state.evolutionLog.slice(0, 24).map((entry) => (
        <div key={entry.id} className="timeline-item">
          <span />
          <div>
            <strong>{entry.title}</strong>
            <small>{entry.detail ?? entry.type} | {entry.dateKey}</small>
          </div>
        </div>
      )) : <div className="empty-state">Timeline is waiting for the first signal.</div>}
    </div>
  );
}

function HeatmapPanel({ heatmap }: { heatmap: { dateKey: string; minutes: number; intensity: number }[] }) {
  return (
    <article className="product-panel product-panel--wide">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Consistency Heatmap</p>
          <h2>Last 28 days</h2>
        </div>
      </div>
      <div className="heatmap-grid">
        {heatmap.map((day) => (
          <span key={day.dateKey} title={`${day.dateKey}: ${day.minutes}m`} data-intensity={day.intensity} />
        ))}
      </div>
    </article>
  );
}

function CategoryStudio({ api }: { api: AscendApi }) {
  const { state, addCategory, updateCategory, deleteCategory, moveCategory, analytics } = api;
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState<CategoryGroup>('productive');
  const [color, setColor] = useState(ACCENT_OPTIONS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICON_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    addCategory({ label: label.trim(), group, color, icon, description: 'Custom life category.' });
    setLabel('');
  }

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Category Ecosystem" title="Design your life workspaces" detail="Create, edit, reorder, hide, and analyze every category as a living workspace." />
      <form className="category-composer" onSubmit={submit}>
        <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="New category, e.g. Editing" />
        <select value={group} onChange={(event) => setGroup(event.target.value as CategoryGroup)}>
          <option value="productive">Productive</option>
          <option value="rest">Rest</option>
          <option value="leisure">Leisure</option>
        </select>
        <select value={icon} onChange={(event) => setIcon(event.target.value)}>
          {CATEGORY_ICON_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <div className="swatch-row">
          {ACCENT_OPTIONS.map((option) => (
            <button key={option} type="button" className={color === option ? 'active' : ''} style={{ backgroundColor: option }} onClick={() => setColor(option)} aria-label={`Use ${option}`} />
          ))}
        </div>
        <Button type="submit"><Plus className="size-4" />Create</Button>
      </form>
      <div className="category-grid">
        {state.categories.map((category) => {
          const minutes = analytics.categoryBreakdown.find((item) => item.id === category.id)?.minutes ?? 0;
          return (
            <CategoryCard
              key={category.id}
              category={category}
              minutes={minutes}
              editing={editingId === category.id}
              setEditing={(editing) => setEditingId(editing ? category.id : null)}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              moveCategory={moveCategory}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  minutes,
  editing,
  setEditing,
  updateCategory,
  deleteCategory,
  moveCategory,
}: {
  category: LifeCategory;
  minutes: number;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  updateCategory: (category: LifeCategory) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, direction: -1 | 1) => void;
}) {
  const Icon = getCategoryIcon(category.icon);
  const [draft, setDraft] = useState(category);

  useEffect(() => setDraft(category), [category]);

  return (
    <article className="category-card" style={{ '--category-color': category.color } as React.CSSProperties}>
      <div className="category-card__top">
        <div className="category-icon"><Icon className="size-5" /></div>
        <div>
          <strong>{category.label}</strong>
          <span>{category.group} | {formatHours(minutes)} this week</span>
        </div>
      </div>

      {editing ? (
        <div className="category-edit">
          <Input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
          <Textarea value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2} />
          <select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })}>
            {CATEGORY_ICON_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="swatch-row">
            {ACCENT_OPTIONS.map((option) => (
              <button key={option} type="button" className={draft.color === option ? 'active' : ''} style={{ backgroundColor: option }} onClick={() => setDraft({ ...draft, color: option })} aria-label={`Use ${option}`} />
            ))}
          </div>
          <div className="category-actions">
            <button type="button" onClick={() => { updateCategory(draft); setEditing(false); }}>Save</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p>{category.description}</p>
          <div className="soft-track"><span style={{ width: `${Math.min(100, minutes / 6)}%`, backgroundColor: category.color }} /></div>
          <div className="category-actions">
            <button type="button" onClick={() => moveCategory(category.id, -1)} aria-label="Move category up"><ArrowUp className="size-4" /></button>
            <button type="button" onClick={() => moveCategory(category.id, 1)} aria-label="Move category down"><ArrowDown className="size-4" /></button>
            <button type="button" onClick={() => updateCategory({ ...category, active: !category.active })}>{category.active ? 'Active' : 'Hidden'}</button>
            <button type="button" onClick={() => setEditing(true)} aria-label="Edit category"><Edit3 className="size-4" /></button>
            <button type="button" onClick={() => deleteCategory(category.id)} aria-label="Delete category"><Trash2 className="size-4" /></button>
          </div>
        </>
      )}
    </article>
  );
}

function GoalsSection({ api }: { api: AscendApi }) {
  const { state, addGoal, updateGoal, deleteGoal } = api;
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('10');
  const [period, setPeriod] = useState<Goal['period']>('weekly');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), period, targetValue: Math.max(1, Number(target) || 1), unit: 'sessions' });
    setTitle('');
  }

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Goal System" title="Targets that shape the operating rhythm" />
      <form className="goal-composer" onSubmit={submit}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Create a goal" />
        <select value={period} onChange={(event) => setPeriod(event.target.value as Goal['period'])}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <Input type="number" min={1} value={target} onChange={(event) => setTarget(event.target.value)} />
        <Button type="submit"><Plus className="size-4" />Add</Button>
      </form>
      <div className="goal-grid">
        {state.goals.length ? state.goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          return (
            <article key={goal.id} className="product-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">{goal.period}</p><h2>{goal.title}</h2></div>
                <button type="button" className="icon-button" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal"><Trash2 className="size-4" /></button>
              </div>
              <div className="soft-track"><span style={{ width: `${pct}%` }} /></div>
              <div className="goal-footer"><span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span><strong>{pct}%</strong></div>
              <input type="range" min={0} max={goal.targetValue} value={goal.currentValue} onChange={(event) => updateGoal({ ...goal, currentValue: Number(event.target.value) })} />
            </article>
          );
        }) : <div className="empty-state">No goals yet. Create one to begin shaping your rhythm.</div>}
      </div>
    </section>
  );
}

function AnalyticsSection({ api, embedded = false }: { api: AscendApi; embedded?: boolean }) {
  const { scores, analytics } = api;
  const max = Math.max(...analytics.categoryBreakdown.map((item) => item.minutes), 1);

  return (
    <section className={cn(!embedded && 'workspace-section fade-in')}>
      {!embedded ? <SectionHeader eyebrow="Analytics" title="Behavioral intelligence cockpit" detail="Live category balance, evolution scoring, focus rhythm, and consistency signals." /> : null}
      <div className="analytics-layout">
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Balance</p><h2>Category distribution</h2></div></div>
          <div className="category-bars">
            {analytics.categoryBreakdown.slice(0, 9).map((item) => (
              <div key={item.id}>
                <div><span>{item.label}</span><strong>{formatHours(item.minutes)}</strong></div>
                <div className="soft-track"><span style={{ width: `${(item.minutes / max) * 100}%`, backgroundColor: item.color }} /></div>
              </div>
            ))}
          </div>
        </article>
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Score Model</p><h2>Evolution dimensions</h2></div></div>
          <div className="ring-row">
            <ProgressRing value={scores.focus} label="focus" compact />
            <ProgressRing value={scores.balance} label="balance" compact />
            <ProgressRing value={scores.growth} label="growth" compact />
          </div>
        </article>
      </div>
      <HeatmapPanel heatmap={analytics.heatmap} />
    </section>
  );
}

function EvolutionSection({ api }: { api: AscendApi }) {
  const { scores, state } = api;
  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Evolution Workspace" title="Your adaptive growth model" detail="Milestones, tier progress, streaks, and active dimensions in one operating view." />
      <div className="evolution-layout">
        <article className="product-panel product-panel--wide">
          <div className="control-grid">
            <ProgressRing value={scores.evolutionIndex} label="index" />
            <div className="dimension-grid">
              <MetricTile label="Tier" value={scores.tierLabel} detail={`${scores.pointsToNextTier} points to next tier`} />
              <MetricTile label="Streak" value={`${state.streak.current}d`} detail={`Longest ${state.streak.longest}d`} />
              <MetricTile label="Points" value={scores.evolutionPoints} detail="all-time evolution" />
            </div>
          </div>
        </article>
        <div className="milestone-grid">
          {state.milestones.map((milestone) => (
            <article key={milestone.id} className={cn('milestone-card', milestone.unlocked && 'milestone-card--unlocked')}>
              {milestone.unlocked ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
              <strong>{milestone.title}</strong>
              <span>{milestone.unlockedAt ? new Date(milestone.unlockedAt).toLocaleDateString() : 'Locked'}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsSection({ api }: { api: AscendApi }) {
  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Insights" title="Adaptive weekly summary" detail="Recommendations change as your activity system changes." />
      <div className="insight-grid">
        {api.insights.map((insight) => <article key={insight.id} className="product-panel"><p>{insight.message}</p></article>)}
      </div>
    </section>
  );
}

function FocusSection({ api }: { api: AscendApi }) {
  const defaultMinutes = api.state.preferences.defaultActivityMinutes;
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [remaining, setRemaining] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [title, setTitle] = useState('Focused operating block');
  const focusCategory = api.state.categories.find((category) => category.id === 'coding') ?? api.state.categories[0];

  useEffect(() => {
    if (running) return;
    setRemaining(minutes * 60);
  }, [minutes, running]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          api.logActivity({ title, category: focusCategory?.id ?? 'coding', durationMinutes: minutes, completed: true, notes: 'Completed focus session.' });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [api, focusCategory?.id, minutes, running, title]);

  const elapsedPct = Math.round(((minutes * 60 - remaining) / Math.max(1, minutes * 60)) * 100);
  const display = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Focus Cockpit" title="Deep work session control" detail="Timer completion logs an activity and updates streaks, points, analytics, and timeline instantly." />
      <div className="focus-cockpit product-panel product-panel--wide">
        <ProgressRing value={elapsedPct} label={display} />
        <div className="focus-controls">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <label>
            <span>Minutes</span>
            <input type="range" min={5} max={180} step={5} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
            <strong>{minutes}m</strong>
          </label>
          <div className="hero-actions">
            <Button type="button" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</Button>
            <button type="button" className="ghost-button" onClick={() => { setRunning(false); setRemaining(minutes * 60); }}>Reset</button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => api.logActivity({ title, category: focusCategory?.id ?? 'coding', durationMinutes: minutes, completed: true, notes: 'Logged from focus cockpit.' })}
            >
              Log now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileSection({ api }: { api: AscendApi }) {
  const { state, updateProfile, scores, resetAll } = api;
  const [draft, setDraft] = useState<UserProfile>(() => state.profile ?? {
    name: 'Operator',
    dailyTargetMinutes: 240,
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (state.profile) setDraft(state.profile);
  }, [state.profile]);

  function save() {
    updateProfile({ ...draft, onboardingComplete: true });
  }

  function uploadAvatar(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((prev) => ({ ...prev, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Account Center" title="Profile and personal operating preferences" />
      <div className="profile-layout">
        <article className="profile-card">
          <div className="avatar-shell avatar-shell--large">{draft.avatarUrl ? <img src={draft.avatarUrl} alt="" /> : initials(draft.name)}</div>
          <h2>{draft.name || 'Operator'}</h2>
          <p>{draft.evolutionFocus || 'Adaptive personal evolution path'}</p>
          <label className="upload-button">
            <Upload className="size-4" />
            Upload avatar
            <input type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
          </label>
          <div className="metric-grid">
            <MetricTile label="Profile" value="Live" detail="local account" />
            <MetricTile label="Tier" value={scores.tierLabel} />
          </div>
        </article>
        <article className="product-panel">
          <div className="settings-grid">
            <div><Label>Name</Label><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div><Label>Location</Label><Input value={draft.location ?? ''} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></div>
            <div><Label>Focus window</Label><Input value={draft.focusWindow ?? ''} onChange={(event) => setDraft({ ...draft, focusWindow: event.target.value })} placeholder="Morning, evening, night" /></div>
            <div><Label>Daily target minutes</Label><Input type="number" value={draft.dailyTargetMinutes} onChange={(event) => setDraft({ ...draft, dailyTargetMinutes: Number(event.target.value) || 0 })} /></div>
            <div className="settings-wide"><Label>Evolution focus</Label><Input value={draft.evolutionFocus ?? ''} onChange={(event) => setDraft({ ...draft, evolutionFocus: event.target.value })} /></div>
            <div className="settings-wide"><Label>Bio</Label><Textarea value={draft.bio ?? ''} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
          </div>
          <div className="hero-actions">
            <Button type="button" onClick={save}>Save profile</Button>
            <button type="button" className="danger-button" onClick={resetAll}><LogOut className="size-4" />Logout and reset</button>
          </div>
        </article>
      </div>
    </section>
  );
}

function SettingsSection({ api }: { api: AscendApi }) {
  const { state, updatePreferences, toggleWidget, moveDashboardWidget } = api;
  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Settings" title="System behavior and dashboard layout" />
      <div className="settings-layout">
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Theme</p><h2>Visual system</h2></div></div>
          <div className="theme-grid">
            {THEME_OPTIONS.map((theme) => {
              const Icon = theme.icon;
              return (
                <button key={theme.id} type="button" className={state.preferences.theme === theme.id ? 'active' : ''} onClick={() => updatePreferences({ theme: theme.id })}>
                  <Icon className="size-4" />
                  <strong>{theme.label}</strong>
                  <span>{theme.detail}</span>
                </button>
              );
            })}
          </div>
          <div className="settings-grid">
            <div>
              <Label>Density</Label>
              <select value={state.preferences.density} onChange={(event) => updatePreferences({ density: event.target.value as typeof state.preferences.density })}>
                <option value="calm">Calm</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <Label>Motion</Label>
              <select value={state.preferences.motion} onChange={(event) => updatePreferences({ motion: event.target.value as typeof state.preferences.motion })}>
                <option value="full">Full</option>
                <option value="reduced">Reduced</option>
              </select>
            </div>
            <div>
              <Label>Productivity style</Label>
              <select value={state.preferences.productivityStyle} onChange={(event) => updatePreferences({ productivityStyle: event.target.value as typeof state.preferences.productivityStyle })}>
                <option value="deep-work">Deep work</option>
                <option value="balanced">Balanced</option>
                <option value="recovery-first">Recovery first</option>
              </select>
            </div>
            <div>
              <Label>Default activity minutes</Label>
              <Input type="number" value={state.preferences.defaultActivityMinutes} onChange={(event) => updatePreferences({ defaultActivityMinutes: Number(event.target.value) || 30 })} />
            </div>
            <label className="toggle-row">
              <input type="checkbox" checked={state.preferences.notificationsEnabled} onChange={(event) => updatePreferences({ notificationsEnabled: event.target.checked })} />
              Notifications
            </label>
          </div>
        </article>
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Dashboard</p><h2>Widget visibility and order</h2></div></div>
          <div className="widget-settings">
            {[...state.dashboardWidgets].sort((a, b) => a.order - b.order).map((widget) => (
              <label key={widget.id}>
                <input type="checkbox" checked={widget.visible} onChange={() => toggleWidget(widget.id)} />
                <span>{widget.title}</span>
                <button type="button" onClick={() => moveDashboardWidget(widget.id, -1)} aria-label="Move widget up"><ArrowUp className="size-4" /></button>
                <button type="button" onClick={() => moveDashboardWidget(widget.id, 1)} aria-label="Move widget down"><ArrowDown className="size-4" /></button>
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default function AscendAppShell({ api }: { api: AscendApi }) {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useThemeSync(api.state.preferences.theme);

  useEffect(() => {
    const stored = localStorage.getItem('ascendos-sidebar-collapsed');
    if (stored) setSidebarCollapsed(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('ascendos-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const section = useMemo(() => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome api={api} setActiveSection={setActiveSection} />;
      case 'evolution':
        return <EvolutionSection api={api} />;
      case 'activities':
        return <ActivitiesSection api={api} />;
      case 'goals':
        return <GoalsSection api={api} />;
      case 'analytics':
        return <AnalyticsSection api={api} />;
      case 'timeline':
        return <section className="workspace-section fade-in"><SectionHeader eyebrow="Timeline" title="Evolution timeline workspace" /><TimelinePanel api={api} /></section>;
      case 'insights':
        return <InsightsSection api={api} />;
      case 'focus':
        return <FocusSection api={api} />;
      case 'categories':
        return <CategoryStudio api={api} />;
      case 'profile':
        return <ProfileSection api={api} />;
      case 'settings':
        return <SettingsSection api={api} />;
    }
  }, [activeSection, api]);

  return (
    <main className="app-canvas">
      <ShellSidebar activeSection={activeSection} collapsed={sidebarCollapsed} setActiveSection={setActiveSection} setCollapsed={setSidebarCollapsed} api={api} />
      <div className="app-main">
        <TopNav activeSection={activeSection} api={api} setActiveSection={setActiveSection} />
        <div className="workspace-scroll">{section}</div>
      </div>
    </main>
  );
}
