import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIPlanner from './components/AIPlanner';
import Schedule from './components/Schedule';
import Subjects from './components/Subjects';
import FocusTimer from './components/FocusTimer';
import AuthPage from './components/AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plannerQuery, setPlannerQuery] = useState('');

  // Function to navigate to planner with a preset query
  const navigateToPlanner = (query) => {
    setPlannerQuery(query);
    setActiveTab('planner');
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'planner' && <AIPlanner externalQuery={plannerQuery} user={user} />}
        {activeTab === 'schedule' && <Schedule user={user} />}
        {activeTab === 'subjects' && <Subjects user={user} onPlanSubject={(subjectName) => navigateToPlanner(`Generate a study plan for ${subjectName}`)} />}
        {activeTab === 'timer' && <FocusTimer user={user} />}
      </main>
    </div>
  );
}

export default App;
