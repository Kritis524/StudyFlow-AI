import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Schedule = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const [blocks, setBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({ day: 0, startHour: 9, duration: 1, title: '' });
  const colors = ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)'];

  const handleAddBlock = (e) => {
    e.preventDefault();
    if (!newBlock.title.trim()) return;
    setBlocks([...blocks, {
      ...newBlock,
      id: Date.now(),
      day: parseInt(newBlock.day),
      startHour: parseFloat(newBlock.startHour),
      duration: parseFloat(newBlock.duration),
      color: colors[blocks.length % colors.length]
    }]);
    setNewBlock({ ...newBlock, title: '' }); // reset title
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Weekly Schedule</h1>
        <p className="page-subtitle">Your time-blocked study plan for the week.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 className="card-title" style={{ marginBottom: '16px' }}>Schedule a Study Block</h2>
        <form onSubmit={handleAddBlock} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto auto auto auto', gap: '16px' }}>
          <input 
            type="text" placeholder="Title (e.g. Calculus Practice)" required
            value={newBlock.title} onChange={e => setNewBlock({...newBlock, title: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          />
          <select 
            value={newBlock.day} onChange={e => setNewBlock({...newBlock, day: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          >
            {days.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
          </select>
          <select 
            value={newBlock.startHour} onChange={e => setNewBlock({...newBlock, startHour: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          >
            {hours.map(h => <option key={h} value={h}>{h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}</option>)}
          </select>
          <select 
            value={newBlock.duration} onChange={e => setNewBlock({...newBlock, duration: e.target.value})}
            style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
          >
            <option value="1">1 hr</option>
            <option value="1.5">1.5 hrs</option>
            <option value="2">2 hrs</option>
            <option value="3">3 hrs</option>
          </select>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>
            <Plus size={20} /> Add
          </button>
        </form>
      </div>

      <div className="schedule-grid">
        {/* Header row */}
        <div className="schedule-header" style={{backgroundColor: 'var(--background)'}}></div>
        {days.map(day => (
          <div key={day} className="schedule-header">{day}</div>
        ))}

        {/* Time rows */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="schedule-time text-muted">
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
            </div>
            {days.map((day, dayIndex) => {
              // Check if there's a block starting here
              const currentBlock = blocks.find(b => b.day === dayIndex && Math.floor(b.startHour) === hour);
              
              return (
                <div key={`${day}-${hour}`} className="schedule-cell" style={{ position: 'relative' }}>
                  {currentBlock && (
                    <div 
                      className="schedule-block" 
                      style={{
                        top: `${(currentBlock.startHour - Math.floor(currentBlock.startHour)) * 100}%`,
                        height: `calc(${currentBlock.duration * 100}% - 4px)`, // account for padding
                        backgroundColor: currentBlock.color,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentBlock.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(currentBlock.id); }} style={{ color: 'rgba(255,255,255,0.7)', padding: 0 }} title="Delete Block">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
