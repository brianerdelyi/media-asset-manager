import { Library, HardDrive, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

type View = 'library' | 'drives' | 'settings';
interface SidebarProps { view: View; onViewChange: (view: View) => void; }
interface NavItem { id: View; label: string; icon: React.ReactNode; }

const NAV_ITEMS: NavItem[] = [
  { id: 'library', label: 'Library', icon: <Library size={18} /> },
  { id: 'drives',  label: 'Drives',  icon: <HardDrive size={18} /> },
];
const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Sidebar({ view, onViewChange }: SidebarProps) {
  const { sidebarExpanded, toggleSidebar } = useThemeStore();
  return (
    <nav style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: '12px', paddingBottom: '12px', background: 'var(--nav-bg)', borderRight: '1px solid var(--nav-border)', width: sidebarExpanded ? '160px' : '56px', transition: 'width 200ms ease' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {NAV_ITEMS.map(item => <NavButton key={item.id} item={item} active={view === item.id} expanded={sidebarExpanded} onClick={() => onViewChange(item.id)} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {BOTTOM_ITEMS.map(item => <NavButton key={item.id} item={item} active={view === item.id} expanded={sidebarExpanded} onClick={() => onViewChange(item.id)} />)}
        <button onClick={toggleSidebar} title={sidebarExpanded ? 'Collapse' : 'Expand'}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', padding: sidebarExpanded ? '7px 10px' : '7px', justifyContent: sidebarExpanded ? 'flex-start' : 'center', color: 'var(--nav-text)', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '4px', width: '100%' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--nav-item-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {sidebarExpanded && <span style={{ fontSize: '12px' }}>Collapse</span>}
        </button>
      </div>
    </nav>
  );
}

function NavButton({ item, active, expanded, onClick }: { item: NavItem; active: boolean; expanded: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick} title={!expanded ? item.label : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', padding: expanded ? '7px 10px' : '7px', justifyContent: expanded ? 'flex-start' : 'center', background: active ? 'var(--color-accent)' : 'transparent', color: active ? 'var(--nav-text-active)' : 'var(--nav-text)', border: 'none', cursor: 'pointer', width: '100%' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--nav-item-hover)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {item.icon}
      {expanded && <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>}
    </button>
  );
}
