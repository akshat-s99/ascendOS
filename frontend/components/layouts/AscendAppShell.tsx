'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Command,
  Compass,
  Flame,
  Gauge,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Moon,
  MoreHorizontal,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trash2,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/lib/constants/branding';
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '@/utils/categoryPresentation';
import { useThemeSync } from '@/hooks/useThemeSync';
import type { Activity as ActivityRecord, CategoryGroup, Goal, LifeCategory, UserProfile } from '@/lib/types/ascend';
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
  | 'focus'
  | 'journal'
  | 'insights'
  | 'profile'
  | 'settings';

type ActivityMode = 'board' | 'timeline' | 'heatmap';

const NAV_GROUPS: { label: string; items: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'evolution', label: 'Evolution', icon: Sparkles },
      { id: 'activities', label: 'Activities', icon: Activity },
      { id: 'goals', label: 'Goals', icon: Target },
      { id: 'analytics', label: 'Analytics', icon: LineChart },
    ],
  },
  {
    label: 'Life System',
    items: [
      { id: 'focus', label: 'Focus Sessions', icon: Gauge },
      { id: 'journal', label: 'Journal', icon: NotebookPen },
      { id: 'insights', label: 'Insights', icon: WandSparkles },
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

const ACCENT_OPTIONS = ['#2f80ed', '#1f9d72', '#7c6cf2', '#c95f8f', '#b38b2e', '#d1843f', '#2f9db3', '#4f6fa8'];

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

function ProgressRing({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-ring" style={{ '--ring-value': `${safe * 3.6}deg` } as React.CSSProperties}>
      <div className="progress-ring__inner">
        <strong>{safe}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function MetricTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

function CategoryPill({ category }: { category: LifeCategory }) {
  const Icon = getCategoryIcon(category.icon);
  return (
    <span className="category-pill" style={{ '--category-color': category.color } as React.CSSProperties}>
      <Icon className="size-3.5" />
      {category.label}
    </span>
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
          <div>
            <strong>{APP_NAME}</strong>
            <span>{APP_VERSION} adaptive OS</span>
          </div>
        ) : null}
        <button
          type="button"
          className="icon-button ml-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <div className="sidebar-profile">
        <div className="avatar-shell">
          {state.profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.profile.avatarUrl} alt="" />
          ) : (
            initials(state.profile?.name)
          )}
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <strong>{state.profile?.name ?? 'Operator'}</strong>
            <span>{scores.tierLabel} | index {scores.evolutionIndex}</span>
          </div>
        ) : null}
      </div>

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

function TopNav({
  activeSection,
  api,
  setActiveSection,
}: {
  activeSection: SectionId;
  api: AscendApi;
  setActiveSection: (section: SectionId) => void;
}) {
  const { state, scores, updatePreferences } = api;
  const nextTheme = state.preferences.theme === 'dark' ? 'light' : state.preferences.theme === 'light' ? 'system' : 'dark';

  return (
    <header className="top-nav">
      <div className="top-nav__title">
        <span>{APP_NAME}</span>
        <strong>{sectionTitle(activeSection)}</strong>
      </div>
      <label className="global-search">
        <Search className="size-4" />
        <input placeholder="Search activities, goals, categories" />
        <Command className="size-3.5" />
      </label>
      <div className="top-nav__actions">
        <button type="button" className="icon-button" onClick={() => setActiveSection('activities')} aria-label="Log activity">
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => updatePreferences({ theme: nextTheme })}
          aria-label="Toggle theme"
        >
          {state.preferences.theme === 'dark' ? <Moon className="size-4" /> : state.preferences.theme === 'light' ? <Sun className="size-4" /> : <SlidersHorizontal className="size-4" />}
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="notification-dot" />
        </button>
        <button type="button" className="top-avatar" onClick={() => setActiveSection('profile')}>
          <span>{scores.evolutionIndex}</span>
          <div className="avatar-shell avatar-shell--small">
            {state.profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.profile.avatarUrl} alt="" />
            ) : (
              initials(state.profile?.name)
            )}
          </div>
        </button>
      </div>
    </header>
  );
}

function DashboardHome({ api, setActiveSection }: { api: AscendApi; setActiveSection: (section: SectionId) => void }) {
  const { state, scores, analytics, insights, toggleWidget } = api;
  const widgets = state.dashboardWidgets.filter((widget) => widget.visible).sort((a, b) => a.order - b.order);
  const topCategories = analytics.categoryBreakdown.filter((item) => item.minutes > 0).slice(0, 4);
  const maxTrend = Math.max(...analytics.productivityTrend, 1);

  return (
    <section className="workspace-section fade-in">
      <div className="hero-system">
        <div>
          <p className="eyebrow">Adaptive life operating system</p>
          <h1>{state.profile?.evolutionFocus || 'Build a calmer, sharper personal system.'}</h1>
          <p>
            Your week is reading as {scores.tierLabel.toLowerCase()} with {formatHours(analytics.weeklySummary.totalMinutes)}
            {' '}logged across {analytics.weeklySummary.activitiesCount} completed sessions.
          </p>
        </div>
        <ProgressRing value={scores.evolutionIndex} label="index" />
      </div>

      <div className="widget-grid">
        {widgets.map((widget) => {
          if (widget.id === 'mission-control') {
            return (
              <article key={widget.id} className="product-panel product-panel--wide">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Mission Control</p>
                    <h2>Today at a glance</h2>
                  </div>
                  <button type="button" className="icon-button" onClick={() => toggleWidget(widget.id)} aria-label="Hide widget">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
                <div className="metric-grid">
                  <MetricTile label="Evolution points" value={scores.evolutionPoints} detail={`${scores.pointsToNextTier} to next tier`} />
                  <MetricTile label="Current streak" value={`${state.streak.current}d`} detail={`Longest ${state.streak.longest}d`} />
                  <MetricTile label="Week focus" value={`${scores.focus}%`} detail={`${scores.discipline}% discipline`} />
                  <MetricTile label="Balance" value={`${analytics.balanceScore}%`} detail={analytics.weeklySummary.topCategory} />
                </div>
              </article>
            );
          }

          if (widget.id === 'category-balance') {
            return (
              <article key={widget.id} className="product-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Category System</p>
                    <h2>Life balance</h2>
                  </div>
                  <button type="button" className="text-button" onClick={() => setActiveSection('evolution')}>Manage</button>
                </div>
                <div className="stack-list">
                  {(topCategories.length ? topCategories : analytics.categoryBreakdown.slice(0, 4)).map((item) => (
                    <div key={item.id} className="balance-row">
                      <span style={{ backgroundColor: item.color }} />
                      <div>
                        <strong>{item.label}</strong>
                        <small>{formatHours(item.minutes)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          }

          if (widget.id === 'focus-rhythm') {
            return (
              <article key={widget.id} className="product-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Focus Rhythm</p>
                    <h2>Weekly graph</h2>
                  </div>
                </div>
                <div className="bar-chart">
                  {analytics.productivityTrend.map((value, index) => (
                    <div key={index}>
                      <span style={{ height: `${Math.max(8, (value / maxTrend) * 100)}%` }} />
                      <small>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</small>
                    </div>
                  ))}
                </div>
              </article>
            );
          }

          if (widget.id === 'activity-snapshot') {
            return (
              <article key={widget.id} className="product-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Activity Snapshot</p>
                    <h2>Latest signals</h2>
                  </div>
                  <button type="button" className="text-button" onClick={() => setActiveSection('activities')}>Open</button>
                </div>
                <ActivityList activities={state.activities.slice(0, 4)} categories={state.categories} toggleActivity={api.toggleActivity} deleteActivity={api.deleteActivity} compact />
              </article>
            );
          }

          if (widget.id === 'evolution-graph') {
            return (
              <article key={widget.id} className="product-panel product-panel--wide">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Evolution Graph</p>
                    <h2>Behavioral dimensions</h2>
                  </div>
                </div>
                <div className="dimension-grid">
                  {[
                    ['Focus', scores.focus],
                    ['Discipline', scores.discipline],
                    ['Balance', scores.balance],
                    ['Consistency', scores.consistency],
                    ['Growth', scores.growth],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="dimension-label">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                      <div className="soft-track"><span style={{ width: `${value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </article>
            );
          }

          return (
            <article key={widget.id} className="product-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Insights</p>
                  <h2>System prompts</h2>
                </div>
              </div>
              <div className="insight-stack">
                {insights.map((insight) => <p key={insight.id}>{insight.message}</p>)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityComposer({ api }: { api: AscendApi }) {
  const { state, logActivity } = api;
  const activeCategories = state.categories.filter((category) => category.active);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(activeCategories[0]?.id ?? 'coding');
  const [duration, setDuration] = useState(String(state.preferences.defaultActivityMinutes));
  const [notes, setNotes] = useState('');

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
      completed: true,
    });
    setTitle('');
    setNotes('');
  }

  return (
    <form onSubmit={submit} className="composer-panel">
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
      <div className="composer-notes">
        <Label htmlFor="activity-notes">Notes</Label>
        <Textarea id="activity-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
      </div>
      <Button type="submit">
        <Plus className="size-4" />
        Log
      </Button>
    </form>
  );
}

function ActivityList({
  activities,
  categories,
  toggleActivity,
  deleteActivity,
  compact = false,
}: {
  activities: ActivityRecord[];
  categories: LifeCategory[];
  toggleActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
  compact?: boolean;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  if (activities.length === 0) {
    return <div className="empty-state">No activities logged yet.</div>;
  }

  return (
    <div className={cn('activity-list', compact && 'activity-list--compact')}>
      {activities.map((activity) => {
        const category = categoryMap.get(activity.category);
        return (
          <article
            key={activity.id}
            className={cn('activity-card', draggedId === activity.id && 'activity-card--dragging')}
            draggable
            onDragStart={() => setDraggedId(activity.id)}
            onDragEnd={() => setDraggedId(null)}
          >
            <button type="button" onClick={() => toggleActivity(activity.id)} aria-label="Toggle activity">
              {activity.completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            </button>
            <div className="min-w-0">
              <strong>{activity.title}</strong>
              <span>{formatHours(activity.durationMinutes)} | {category?.label ?? activity.category}</span>
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
      <SectionHeader eyebrow="Activity Management" title="A flexible daily logging surface" action={<ActivityModeSwitch mode={mode} setMode={setMode} />} />
      <ActivityComposer api={api} />
      {mode === 'board' ? (
        <ActivityList activities={state.activities} categories={state.categories} toggleActivity={api.toggleActivity} deleteActivity={api.deleteActivity} />
      ) : mode === 'timeline' ? (
        <div className="timeline-panel">
          {state.evolutionLog.slice(0, 16).map((entry) => (
            <div key={entry.id} className="timeline-item">
              <span />
              <div>
                <strong>{entry.title}</strong>
                <small>{entry.detail ?? entry.type} | {entry.dateKey}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <HeatmapPanel heatmap={analytics.heatmap} />
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
        ['heatmap', Flame],
      ].map(([id, Icon]) => (
        <button key={id as string} type="button" className={mode === id ? 'active' : ''} onClick={() => setMode(id as ActivityMode)} aria-label={`${id} mode`}>
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

function HeatmapPanel({ heatmap }: { heatmap: { dateKey: string; minutes: number; intensity: number }[] }) {
  return (
    <div className="product-panel">
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
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}

function CategoryStudio({ api }: { api: AscendApi }) {
  const { state, addCategory, updateCategory, deleteCategory, moveCategory, analytics } = api;
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState<CategoryGroup>('productive');
  const [color, setColor] = useState(ACCENT_OPTIONS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICON_OPTIONS[0]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    addCategory({ label: label.trim(), group, color, icon, description: 'Custom life category.' });
    setLabel('');
  }

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Evolution Architecture" title="Design your life categories" />
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
            <button
              key={option}
              type="button"
              className={color === option ? 'active' : ''}
              style={{ backgroundColor: option }}
              onClick={() => setColor(option)}
              aria-label={`Use ${option}`}
            />
          ))}
        </div>
        <Button type="submit"><Plus className="size-4" />Create</Button>
      </form>
      <div className="category-grid">
        {state.categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const minutes = analytics.categoryBreakdown.find((item) => item.id === category.id)?.minutes ?? 0;
          return (
            <article key={category.id} className="category-card" style={{ '--category-color': category.color } as React.CSSProperties}>
              <div>
                <div className="category-icon"><Icon className="size-5" /></div>
                <div>
                  <strong>{category.label}</strong>
                  <span>{category.group} | {formatHours(minutes)} this week</span>
                </div>
              </div>
              <p>{category.description}</p>
              <div className="category-actions">
                <button type="button" onClick={() => moveCategory(category.id, -1)} aria-label="Move category up"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => moveCategory(category.id, 1)} aria-label="Move category down"><ChevronRight className="size-4" /></button>
                <button type="button" onClick={() => updateCategory({ ...category, active: !category.active })}>{category.active ? 'Active' : 'Hidden'}</button>
                <button type="button" onClick={() => deleteCategory(category.id)} aria-label="Delete category"><Trash2 className="size-4" /></button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
        {state.goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          return (
            <article key={goal.id} className="product-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{goal.period}</p>
                  <h2>{goal.title}</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="soft-track"><span style={{ width: `${pct}%` }} /></div>
              <div className="goal-footer">
                <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                <strong>{pct}%</strong>
              </div>
              <input type="range" min={0} max={goal.targetValue} value={goal.currentValue} onChange={(event) => updateGoal({ ...goal, currentValue: Number(event.target.value) })} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AnalyticsSection({ api }: { api: AscendApi }) {
  const { scores, analytics } = api;
  const max = Math.max(...analytics.categoryBreakdown.map((item) => item.minutes), 1);

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Analytics" title="Minimal behavioral intelligence" />
      <div className="analytics-layout">
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Balance</p><h2>Category distribution</h2></div></div>
          <div className="category-bars">
            {analytics.categoryBreakdown.slice(0, 8).map((item) => (
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
            <ProgressRing value={scores.focus} label="focus" />
            <ProgressRing value={scores.balance} label="balance" />
            <ProgressRing value={scores.growth} label="growth" />
          </div>
        </article>
      </div>
      <HeatmapPanel heatmap={analytics.heatmap} />
    </section>
  );
}

function ProfileSection({ api }: { api: AscendApi }) {
  const { state, updateProfile, scores } = api;
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

  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Account Center" title="Profile and personal operating preferences" />
      <div className="profile-layout">
        <article className="profile-card">
          <div className="avatar-shell avatar-shell--large">
            {draft.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.avatarUrl} alt="" />
            ) : (
              initials(draft.name)
            )}
          </div>
          <h2>{draft.name || 'Operator'}</h2>
          <p>{draft.evolutionFocus || 'Adaptive personal evolution path'}</p>
          <div className="metric-grid">
            <MetricTile label="Profile" value="82%" detail="completion" />
            <MetricTile label="Tier" value={scores.tierLabel} />
          </div>
        </article>
        <article className="product-panel">
          <div className="settings-grid">
            <div><Label>Name</Label><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div><Label>Avatar URL</Label><Input value={draft.avatarUrl ?? ''} onChange={(event) => setDraft({ ...draft, avatarUrl: event.target.value })} /></div>
            <div><Label>Location</Label><Input value={draft.location ?? ''} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></div>
            <div><Label>Focus window</Label><Input value={draft.focusWindow ?? ''} onChange={(event) => setDraft({ ...draft, focusWindow: event.target.value })} placeholder="Morning, evening, night" /></div>
            <div className="settings-wide"><Label>Evolution focus</Label><Input value={draft.evolutionFocus ?? ''} onChange={(event) => setDraft({ ...draft, evolutionFocus: event.target.value })} /></div>
            <div className="settings-wide"><Label>Bio</Label><Textarea value={draft.bio ?? ''} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
          </div>
          <Button type="button" onClick={save}>Save profile</Button>
        </article>
      </div>
    </section>
  );
}

function SettingsSection({ api }: { api: AscendApi }) {
  const { state, updatePreferences, toggleWidget } = api;
  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow="Settings" title="System behavior and dashboard layout" />
      <div className="settings-layout">
        <article className="product-panel">
          <div className="panel-heading"><div><p className="eyebrow">Theme</p><h2>Visual system</h2></div></div>
          <div className="settings-grid">
            <div>
              <Label>Theme</Label>
              <select value={state.preferences.theme} onChange={(event) => updatePreferences({ theme: event.target.value as typeof state.preferences.theme })}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <Label>Density</Label>
              <select value={state.preferences.density} onChange={(event) => updatePreferences({ density: event.target.value as typeof state.preferences.density })}>
                <option value="calm">Calm</option>
                <option value="compact">Compact</option>
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
          <div className="panel-heading"><div><p className="eyebrow">Dashboard</p><h2>Widget visibility</h2></div></div>
          <div className="widget-settings">
            {state.dashboardWidgets.map((widget) => (
              <label key={widget.id}>
                <input type="checkbox" checked={widget.visible} onChange={() => toggleWidget(widget.id)} />
                <span>{widget.title}</span>
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function PlaceholderSection({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <section className="workspace-section fade-in">
      <SectionHeader eyebrow={title} title={subtitle} />
      <div className="product-panel product-panel--wide">{children}</div>
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
        return <CategoryStudio api={api} />;
      case 'activities':
        return <ActivitiesSection api={api} />;
      case 'goals':
        return <GoalsSection api={api} />;
      case 'analytics':
        return <AnalyticsSection api={api} />;
      case 'profile':
        return <ProfileSection api={api} />;
      case 'settings':
        return <SettingsSection api={api} />;
      case 'focus':
        return (
          <PlaceholderSection title="Focus Sessions" subtitle="Deep work cockpit">
            <div className="focus-cockpit">
              <ProgressRing value={api.scores.focus} label="focus" />
              <div>
                <h2>{formatHours(api.state.profile?.dailyTargetMinutes ?? 240)} daily active target</h2>
                <p>Start with one clean session, then let activity logs build the focus rhythm.</p>
                <Button type="button" onClick={() => setActiveSection('activities')}><Plus className="size-4" />Log focus block</Button>
              </div>
            </div>
          </PlaceholderSection>
        );
      case 'journal':
        return (
          <PlaceholderSection title="Journal" subtitle="Reflection stream">
            <div className="timeline-panel">
              {api.state.evolutionLog.slice(0, 10).map((entry) => (
                <div key={entry.id} className="timeline-item"><span /><div><strong>{entry.title}</strong><small>{entry.dateKey}</small></div></div>
              ))}
            </div>
          </PlaceholderSection>
        );
      case 'insights':
        return (
          <PlaceholderSection title="Insights" subtitle="Adaptive weekly summary">
            <div className="insight-stack">
              {api.insights.map((insight) => <p key={insight.id}>{insight.message}</p>)}
            </div>
          </PlaceholderSection>
        );
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
