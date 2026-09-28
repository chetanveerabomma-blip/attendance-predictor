import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface NBTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const NBTabs: React.FC<NBTabsProps> = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-2 border-b-[3px] border-nb-ink pb-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`font-heading uppercase font-bold text-xs tracking-wider px-4 py-2 border-[3px] border-nb-ink transition-all select-none ${
              isActive
                ? "bg-nb-yellow text-nb-ink shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5"
                : "bg-white text-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_#0A0A0A]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-2 font-mono text-[10px] bg-nb-ink text-white px-1.5 py-0.5 rounded-none font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
