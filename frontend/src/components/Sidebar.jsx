import React from 'react';
import { LayoutDashboard, MessageSquare, Calendar, BookOpen, Clock, BrainCircuit, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'AI Planner', icon: MessageSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
  ];

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <div className="brand" style={{ marginBottom: '32px' }}>
          <BrainCircuit size={32} />
          <span>StudyFlow</span>
        </div>
        
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
