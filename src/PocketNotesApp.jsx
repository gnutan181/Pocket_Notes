import backgroundImage from '../assets/backgroundImage.png';


import React, { useState, useEffect } from 'react';

const COLORS = [
  '#B38BFA',
  '#FF79F2', 
  '#43E6FC',
  '#F19576',
  '#0047FF',
  '#6691FF'
];

// Use a unique storage key to avoid conflicts with other apps
const STORAGE_KEY = 'pocket_notes_groups_v1';

// const styles = `

// `;

const PocketNotesApp = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [noteText, setNoteText] = useState('');
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
  
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      // document.head.removeChild(styleSheet);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const savedGroups = localStorage.getItem(STORAGE_KEY);
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        // Validate the data structure
        if (Array.isArray(parsed)) {
          const validGroups = parsed.filter(g => 
            g && 
            typeof g === 'object' && 
            g.id && 
            g.name && 
            g.color && 
            g.initials && 
            Array.isArray(g.notes)
          );
          setGroups(validGroups);
        } else {
          setGroups([]);
        }
      } catch (e) {
        console.error('Error loading groups:', e);
        setGroups([]);
      }
    }
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups]);

  const getInitials = (name) => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const validateGroupName = (name) => {
    if (!name.trim()) {
      return 'Group name is required';
    }
    if (name.trim().length < 2) {
      return 'Group name must be at least 2 characters';
    }
    const exists = groups.some(g => g.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      return 'Group name already exists';
    }
    return null;
  };

  const handleCreateGroup = () => {
    const error = validateGroupName(groupName);
    if (error) {
      setErrors({ groupName: error });
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupName.trim(),
      color: selectedColor,
      initials: getInitials(groupName.trim()),
      notes: []
    };

    setGroups([...groups, newGroup]);
    setShowModal(false);
    setGroupName('');
    setSelectedColor(COLORS[0]);
    setErrors({});
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      setErrors({ note: 'Note cannot be empty' });
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const newNote = {
      id: Date.now(),
      text: noteText.trim(),
      date: dateStr,
      time: timeStr
    };

    const updatedGroups = groups.map(g => {
      if (g.id === selectedGroup.id) {
        return { ...g, notes: [...g.notes, newNote] };
      }
      return g;
    });

    setGroups(updatedGroups);
    setSelectedGroup({ 
      ...selectedGroup, 
      notes: [...selectedGroup.notes, newNote] 
    });
    setNoteText('');
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar" style={{ display: isMobile && selectedGroup ? 'none' : 'flex' }}>
        <h1 className="app-title">Pocket Notes</h1>
        <div className="groups-list">
          {groups.map(group => (
            <div
              key={group.id}
              className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              <div 
                className="group-avatar" 
                style={{ backgroundColor: group.color }}
              >
                {group.initials}
              </div>
              <div className="group-name">{group.name}</div>
            </div>
          ))}
        </div>
        <button 
          className="add-group-btn"
          onClick={() => setShowModal(true)}
        >
          +
        </button>
      </div>

      <div className="main-content" style={{ display: isMobile && !selectedGroup ? 'none' : 'flex' }}>
        {selectedGroup ? (
          <>
            <div className="notes-header">
              {isMobile && (
                <button 
                  className="back-btn"
                  onClick={() => setSelectedGroup(null)}
                >
                  ←
                </button>
              )}
              <div 
                className="header-avatar" 
                style={{ backgroundColor: selectedGroup.color }}
              >
                {selectedGroup.initials}
              </div>
              <h2 className="header-title">{selectedGroup.name}</h2>
            </div>
            <div className="notes-area">
              {selectedGroup.notes.map(note => (
                <div key={note.id} className="note-card">
                  <p className="note-text">{note.text}</p>
                  <div className="note-meta">
                    <span>{note.date}</span>
                    <span className="bullet">•</span>
                    <span>{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="notes-input-container">
              <div className="input-wrapper">
                <textarea
                  className="notes-input"
                  placeholder="Enter your text here..........."
                  value={noteText}
                  onChange={(e) => {
                    setNoteText(e.target.value);
                    setErrors({});
                  }}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className={`send-btn-inline ${noteText.trim() ? 'active' : ''}`}
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <svg width="24" height="24" viewBox="0 0 35 35" fill="none">
                    <path d="M0 35L35 17.5L0 0L0 13.5938L25 17.5L0 21.4063L0 35Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <img 
             src={backgroundImage}
              alt="Notes illustration"
              className="empty-illustration"
            />
            <h2 className="empty-title">Pocket Notes</h2>
            <p className="empty-description">
              Send and receive messages without keeping your phone online.<br/>
              Use Pocket Notes on up to 4 linked devices and 1 mobile phone
            </p>
            <div className="encryption-note">
              <span className="lock-icon">🔒</span>
              end-to-end encrypted
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New group</h2>
            
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                type="text"
                className={`form-input ${errors.groupName ? 'error' : ''}`}
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setErrors({});
                }}
                maxLength={50}
              />
              {errors.groupName && (
                <span className="error-text">{errors.groupName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Choose colour</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <button 
              className="create-btn"
              onClick={handleCreateGroup}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PocketNotesApp;