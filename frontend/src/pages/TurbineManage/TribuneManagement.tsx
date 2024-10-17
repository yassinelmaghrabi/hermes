import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Book, User, Info, Search, Bell, Settings, Edit2 } from 'lucide-react';
import './TribuneManagement.css';

interface Tribune {
  ID: string;
  Name: string;
  Description: string;
  Maintainers: string[];
}

const TribuneManagement: React.FC = () => {
  const [tribunes, setTribunes] = useState<Tribune[]>([]);
  const [newTribune, setNewTribune] = useState({ Name: '', Description: '', Maintainers: [''] });
  const [error, setError] = useState('');
  const [isAddingTribune, setIsAddingTribune] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTribune, setEditingTribune] = useState<Tribune | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTribunes = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token")?.split(" ")[1]; // Extract the token
      
      try {
        const response = await axios.get('https://hermes-1.onrender.com/api/tribune/getall', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setTribunes(response.data.tribunes);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch tribunes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTribunes();
  }, []);

  const handleAddTribune = async () => {
    try {
      const token = localStorage.getItem("token")?.split(" ")[1];
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const response = await axios.post('https://hermes-1.onrender.com/api/tribune/add', newTribune, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setTribunes([...tribunes, response.data]);
      setNewTribune({ Name: '', Description: '', Maintainers: [''] });
      setIsAddingTribune(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Handle session expiration or refresh token logic if applicable
      } else {
        console.error('Failed to add tribune:', error);
        setError('Failed to add tribune. Please try again.');
      }
    }
  };

  const handleEditTribune = async () => {
    if (!editingTribune) return;

    try {
      const token = localStorage.getItem("token")?.split(" ")[1];
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const response = await axios.put(`https://hermes-1.onrender.com/api/tribune/update/${editingTribune.ID}`, editingTribune, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setTribunes(tribunes.map(t => t.ID === editingTribune.ID ? response.data : t));
      setEditingTribune(null);
    } catch (error) {
      console.error('Failed to edit tribune:', error);
      setError('Failed to edit tribune. Please try again later.');
    }
  };

  const filteredTribunes = tribunes.filter(tribune =>
    tribune.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tribune.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo-container">
          <img src="flux-image.png" alt="Hermes Logo" className="logo-image" />
          <h1 className="app-title">Hermes</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>
          <ul className="nav-list">
            <li className="nav-item active">
              <Book className="nav-icon" />
              <span>Tribunes</span>
            </li>
            <li className="nav-item">
              <User className="nav-icon" />
              <span>Instructors</span>
            </li>
            <li className="nav-item">
              <Info className="nav-icon" />
              <span>About</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search tribunes..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="header-actions">
            <button className="icon-button">
              <Bell />
            </button>
            <button className="icon-button">
              <Settings />
            </button>
            <div className="user-avatar">
              <img src="user.png" alt="User" />
            </div>
          </div>
        </div>

        <div className="tribune-section">
          <div className="section-header">
            <h2>Tribunes</h2>
            <button className="add-button" onClick={() => setIsAddingTribune(true)}>
              <PlusCircle /> Add Tribune
            </button>
          </div>

          {isAddingTribune && (
            <div className="tribune-form">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddTribune();
              }}>
                <input
                  type="text"
                  placeholder="Tribune Name"
                  value={newTribune.Name}
                  onChange={(e) => setNewTribune({ ...newTribune, Name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tribune Description"
                  value={newTribune.Description}
                  onChange={(e) => setNewTribune({ ...newTribune, Description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Maintainer"
                  value={newTribune.Maintainers[0]}
                  onChange={(e) => setNewTribune({ ...newTribune, Maintainers: [e.target.value] })}
                />
                <div className="form-buttons">
                  <button type="submit" className="submit-button">Add Tribune</button>
                  <button type="button" className="cancel-button" onClick={() => setIsAddingTribune(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="tribune-grid">
              {filteredTribunes.map((tribune) => (
                <div key={tribune.ID} className="tribune-card">
                  <div className="tribune-card-content">
                    <h3>{tribune.Name}</h3>
                    <p>{tribune.Description}</p>
                    <div className="maintainers">
                      <User /> Maintainer: {tribune.Maintainers.join(', ')}
                    </div>
                    <div className="card-actions">
                      <button className="icon-button" onClick={() => setEditingTribune(tribune)}>
                        <Edit2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingTribune && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Tribune</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditTribune();
            }}>
              <input
                type="text"
                placeholder="Tribune Name"
                value={editingTribune.Name}
                onChange={(e) => setEditingTribune({ ...editingTribune, Name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Tribune Description"
                value={editingTribune.Description}
                onChange={(e) => setEditingTribune({ ...editingTribune, Description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Maintainer ID"
                value={editingTribune.Maintainers[0]}
                onChange={(e) => setEditingTribune({ ...editingTribune, Maintainers: [e.target.value] })}
              />
              <div className="form-buttons">
                <button type="submit" className="submit-button">Update Tribune</button>
                <button type="button" className="cancel-button" onClick={() => setEditingTribune(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TribuneManagement;
