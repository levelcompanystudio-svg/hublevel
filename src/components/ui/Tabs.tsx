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
    <div className="overflow-x-auto border-b border-border">
      <div className="flex min-w-max gap-5" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={`relative shrink-0 border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors duration-150 ${
                active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
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
