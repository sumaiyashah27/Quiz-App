import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { faTachometerAlt, faUser, faBook, faChalkboardTeacher, faBookOpen, faChevronLeft, faChevronRight  } from '@fortawesome/free-solid-svg-icons';
import Dashboard from './Usepanel/DashBoard';
import Profile from './Usepanel/Profile';
import BookTest from './Usepanel/BookTest';
import ScheduleTest from './Usepanel/ScheduleTest'; 
import Material from './Usepanel/Material';
import { useNavigate } from 'react-router-dom';

const Userpanel = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userMongoId, setUserMongoId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  localStorage.setItem('userMongoId', userMongoId);
  // Fetch user details, quiz enrollment data, and scheduled tests
  useEffect(() => {
    // Fetch user details only if userId exists
    if (userId) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`/api/users/${userId}`);
          const userData = response.data;
          setUserName(userData.firstName);
          setUserMongoId(userData._id);
          setUserEmail(userData.email);
        } catch (error) {
          console.error('Error fetching user details:', error);
        } finally {
          setIsLoading(false); // Ensure loading state is updated
        }
      };
  
      fetchUserDetails();
    } else {
      setIsLoading(false); // If no userId, stop loading
    }
  }, [userId]);
  
  
  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', panel: 'dashboard', icon: faTachometerAlt, className: 'menu-item' },
    { name: 'Book Test', panel: 'book test', icon: faUser, className: 'menu-item' },
    { name: 'Schedule Test', panel: 'schedule test', icon: faBook, className: 'menu-item' },
    { name: 'Study Material', panel: 'material', icon: faBookOpen, className: 'menu-item' }, // Updated icon for Material
    { name: 'Profile', panel: 'profile', icon: faChalkboardTeacher, className: 'menu-item' },
  ];
  

  const renderContent = () => {
    switch (activePanel) {
      case 'dashboard': return <Dashboard />;
      case 'book test': return <BookTest/>;
      case 'schedule test': return <ScheduleTest/>;
      case 'material': return <Material />;
      case 'profile': return <Profile />;
      default: return <h2>Welcome! Please select an option.</h2>;
    }
  };

  const pulseAnimation = {
    animation: 'pulse 1.5s infinite',
  };

  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.innerHTML = keyframes;
  document.head.appendChild(styleTag);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#100b5c' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', color: 'white' }}>
          <div className="row topbar">
            {/* Render user details */}
            <div style={{ paddingBottom: '2px'}}>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 'bold', color: '#FFF' }}>Welcome, {isLoading ? 'Loading...' : userName}</h2>
              {/* {userMongoId && (
                <p style={{ fontSize: '1rem', color: '#555' }}>
                  <strong>MongoDB ID:</strong> {userMongoId}
                </p>
              )}
              {userEmail && (
                <p style={{ fontSize: '1rem', color: '#555' }}>
                  <strong>Email:</strong> {userEmail}
                </p>
              )} */}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ width: sidebarOpen ? '250px' : '70px', backgroundColor: '#100b5c', padding: '20px', color: 'white', overflow: 'hidden', transition: 'width 0.3s ease' }}>
          <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          style={{ 
            backgroundColor: '#fff', 
            color: '#100b5c', 
            border: 'none', 
            padding: '10px', 
            cursor: 'pointer', 
            marginBottom: '10px', 
            borderRadius: '5px' 
          }}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faChevronLeft : faChevronRight} />
        </button>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.panel} style={{ marginBottom: '15px' }}>
              <button 
                onClick={() => handlePanelChange(item.panel)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px', 
                  backgroundColor: activePanel === item.panel ? '#ffdf5c' : '#ECF0F1', // Active tab color (yellow)
                  border: 'none', 
                  color: activePanel === item.panel ? 'white' : '#100b5c', // Active tab text color
                  textAlign: 'left', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  fontSize: '18px', 
                  justifyContent: 'flex-start', 
                  width: sidebarOpen ? '100%' : '50px', 
                  transition: 'background-color 0.3s ease, color 0.3s ease' 
                }}>
                <FontAwesomeIcon 
                  icon={item.icon} 
                  style={{ 
                    marginRight: '10px', 
                    fontSize: '20px', 
                    color: activePanel === item.panel ? 'white' : '#100b5c', // Active tab icon color
                    transition: 'transform 0.2s ease', 
                    transform: 'scale(1)', 
                  }} 
                />
                {sidebarOpen && item.name}
              </button>
            </li>
          ))}
        </ul>
          </div>
          <div style={{ flex: 1, padding: '10px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
            <div style={{ padding: '10px', margin: '0 auto', maxWidth: '100%', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userpanel;
