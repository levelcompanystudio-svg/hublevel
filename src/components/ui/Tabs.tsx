interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
}

export function Tabs({ tabs, activeKey, onChange, ariaLabel }: TabsProps) {
  return (
    <div className="overflow-x-auto border-b border-border/70 pb-2">
      <div className="flex min-w-max gap-1" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? 'bg-primary/10 font-semibold text-foreground'
                  : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
