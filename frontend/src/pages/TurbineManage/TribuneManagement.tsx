import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Book, User, Info, Search, Bell, Settings, Edit2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TribuneManagement.css';

interface Tribune {
  ID: string;
  Name: string;
  Description: string;
  Maintainers: string[];
}

interface UserData {
  ID: string;
}

const TribuneManagement: React.FC = () => {
  const [tribunes, setTribunes] = useState<Tribune[]>([]);
  const [newTribune, setNewTribune] = useState({ Name: '', Description: '', Maintainers: [''] });
  const [error, setError] = useState('');
  const [isAddingTribune, setIsAddingTribune] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTribune, setEditingTribune] = useState<Tribune | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>('user.png');
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchTribunes = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token")?.split(" ")[1];

    try {
      const response = await axios.get('https://hermes-1.onrender.com/api/tribune/getall', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTribunes(response.data.tribunes || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tribunes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")?.split(" ")[1];
      if (!token) return;

      try {
        const response = await axios.get('https://hermes-1.onrender.com/api/user/data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        if (response.data.ID) {
          fetchProfilePicture(response.data.ID);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
    fetchTribunes();
  }, []);

  const fetchProfilePicture = async (userId: string) => {
    const token = localStorage.getItem("token")?.split(" ")[1];
    if (!token) return;

    try {
      const response = await axios.get(`https://hermes-1.onrender.com/api/user/getprofilepic?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePicture(imageUrl);
      }
    } catch (err) {
      console.error('Failed to fetch profile picture:', err);
    }
  };

  const handleAddTribune = async () => {
    try {
      const token = localStorage.getItem("token")?.split(" ")[1];
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      await axios.post('https://hermes-1.onrender.com/api/tribune/add', newTribune, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setNewTribune({ Name: '', Description: '', Maintainers: [''] });
      setIsAddingTribune(false);
      toast.success('Tribune added successfully!');

      await fetchTribunes();

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error: any) {
      setError(`Failed to add tribune: ${error.response?.data?.error || error.message}`);
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

      await axios.patch(`https://hermes-1.onrender.com/api/tribune/update?id=${editingTribune.ID}`, editingTribune, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setEditingTribune(null);
      toast.success('✅ Tribune updated successfully!');

      await fetchTribunes();

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error: any) {
      setError('Failed to edit tribune. Please try again later.');
    }
  };

  const filteredTribunes = tribunes.filter(
    (tribune) =>
      tribune.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribune.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
       <ToastContainer />
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
              <img src={profilePicture} alt="User" />
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTribune();
                }}
              >
                <input
                  type="text"
                  placeholder="Tribune Name"
                  value={newTribune.Name}
                  onChange={(e) => setNewTribune({ ...newTribune, Name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Tribune Description"
                  value={newTribune.Description}
                  onChange={(e) => setNewTribune({ ...newTribune, Description: e.target.value })}
                  required
                />

                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    Add Tribune
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsAddingTribune(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {notification && <div className="notification-message fade-in">{notification}</div>}

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="tribune-grid">
              {filteredTribunes.length > 0 ? (
                filteredTribunes.map((tribune) => (
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
                ))
              ) : (
                <div>No tribunes found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {editingTribune && (
        <div className="modal fade-in">
          <div className="modal-content">
            <h3>Edit Tribune</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditTribune();
              }}
            >
              <input
                type="text"
                value={editingTribune.Name}
                onChange={(e) => setEditingTribune({ ...editingTribune, Name: e.target.value })}
                required
              />
              <input
                type="text"
                value={editingTribune.Description}
                onChange={(e) => setEditingTribune({ ...editingTribune, Description: e.target.value })}
                required
              />

              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Save
                </button>
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
