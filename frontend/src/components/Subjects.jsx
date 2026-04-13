import React, { useState } from 'react';
import { Calendar, Bot, Target, Plus, Trash2 } from 'lucide-react';

const Subjects = ({ onPlanSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', examDate: '', totalTopics: '' });
  const colors = ['var(--primary)', 'var(--warning)', 'var(--success)', 'var(--secondary)'];

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    
    setSubjects([...subjects, {
      id: Date.now(),
      name: newSubject.name,
      code: newSubject.code,
      progress: 0,
      examDate: newSubject.examDate || 'TBD',
      totalTopics: parseInt(newSubject.totalTopics) || 10,
      completedTopics: 0,
      color: colors[subjects.length % colors.length]
    }]);
    
    setNewSubject({ name: '', code: '', examDate: '', totalTopics: '' });
  };

  const handleDelete = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Subjects</h1>
        <p className="page-subtitle">Track your progress and get AI-generated study plans.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 className="card-title" style={{ marginBottom: '16px' }}>Add a New Subject</h2>
        <form onSubmit={handleAddSubject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px' }}>
          <input 
            type="text" placeholder="Subject Name (e.g. Calculus)" required
            value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          />
          <input 
            type="text" placeholder="Course Code" 
            value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          />
          <input 
            type="text" placeholder="Exam Date" 
            value={newSubject.examDate} onChange={e => setNewSubject({...newSubject, examDate: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          />
          <input 
            type="number" placeholder="Total Topics" title="Total Topics"
            value={newSubject.totalTopics} onChange={e => setNewSubject({...newSubject, totalTopics: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>
            <Plus size={20} /> Add
          </button>
        </form>
      </div>

      {subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <Target size={48} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
          <h3>No subjects added yet</h3>
          <p>Add your classes above to start tracking your progress.</p>
        </div>
      ) : (
        <div className="grid-3">
          {subjects.map(subject => (
            <div key={subject.id} className="card subject-card" style={{'--color': subject.color}}>
              <div className="subject-header">
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>{subject.name}</h3>
                  <span className="text-muted" style={{fontSize: '0.875rem'}}>{subject.code}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button onClick={() => handleDelete(subject.id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={18} />
                  </button>
                  <div 
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%', 
                      background: `conic-gradient(${subject.color} ${subject.progress}%, var(--surface-hover) 0)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 10px ${subject.color}40`,
                      marginLeft: '8px'
                    }}
                  >
                    <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'}}>
                      {subject.progress}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="subject-stats">
                <div className="subject-stat">
                  <div className="subject-stat-value text-main">{subject.completedTopics}/{subject.totalTopics}</div>
                  <div className="subject-stat-label">Topics Done</div>
                </div>
                <div className="subject-stat">
                  <div className="subject-stat-value flex items-center gap-2" style={{justifyContent: 'center'}}>
                    <Target size={16} color={subject.color} /> 
                    {subject.totalTopics - subject.completedTopics}
                  </div>
                  <div className="subject-stat-label">Remaining</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-muted" style={{fontSize: '0.875rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px'}}>
                <Calendar size={16} /> Exam: {subject.examDate}
              </div>

              <button 
                className="btn-primary mt-4" 
                style={{backgroundColor: subject.color}}
                onClick={() => onPlanSubject(subject.name)}
              >
                <Bot size={18} /> Generate AI Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
