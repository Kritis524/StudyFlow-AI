import React, { useState } from 'react';
import { Clock, CheckSquare, Flame, Sparkles, Plus, Trash2 } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
    setNewTask('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name || 'User'} </h1>
        <p className="page-subtitle">Here's your study overview for today. Add your tasks and subjects to get started!</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div>
            <div className="stat-value">0h</div>
            <div className="stat-label">Study Hours Today</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><CheckSquare size={24} /></div>
          <div>
            <div className="stat-value">{tasks.filter(t => t.completed).length}/{tasks.length}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)'}}><Flame size={24} /></div>
          <div>
            <div className="stat-value">0</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h2 className="card-title">Today's Tasks</h2>
          </div>
          
          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="What do you need to study today?" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              style={{ flex: 1, backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} />
            </button>
          </form>

          <div className="task-list" style={{ flex: 1, overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                No tasks added yet. Start by adding a task above!
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed && <CheckSquare size={14} color="white" />}
                    </div>
                    <span>{task.title}</span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex" style={{flexDirection: 'column', gap: '24px'}}>


          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Subject Progress</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>
                Add your subjects in the Subjects tab to track your progress here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
