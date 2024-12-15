import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUser, faBook, faChalkboardTeacher, faImage, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import Dashboard from './Adminpanel/dashbord';
import Student from './Adminpanel/student';
import Course from './Adminpanel/course';
import Subject from './Adminpanel/subject';
import Images from './Adminpanel/images';
import QuizEnroll from './Adminpanel/quizenroll';

const Adminpanel = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', panel: 'dashboard', icon: faTachometerAlt },
    { name: 'Student', panel: 'student', icon: faUser },
    { name: 'Course', panel: 'course', icon: faBook },
    { name: 'Subject', panel: 'subject', icon: faChalkboardTeacher },
    { name: 'Images', panel: 'images', icon: faImage }, 
    { name: 'QuizEnroll', panel: 'quizenroll', icon: faClipboardList },
  ];

  const renderContent = () => {
    switch (activePanel) {
      case 'dashboard': return <Dashboard />;
      case 'student': return <Student />;
      case 'course': return <Course />;
      case 'subject': return <Subject />;
      case 'images': return <Images />;
      case 'quizenroll': return <QuizEnroll />;
      default: return <h2>Welcome! Please select an option.</h2>;
    }
  };

  // Pulse animation styles
  const pulseAnimation = {
    animation: 'pulse 1.5s infinite',
  };

  // Keyframes for pulse animation
  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }
  `;

  // Add keyframes to the page dynamically
  const styleTag = document.createElement('style');
  styleTag.innerHTML = keyframes;
  document.head.appendChild(styleTag);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ecf0f1', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'linear-gradient(135deg, #2C3E50, #34495E)', color: 'white' }}>
          <h2>Welcome, Admin!</h2>
        </div>
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ width: sidebarOpen ? '250px' : '70px', backgroundColor: '#2c3e50', padding: '20px', color: 'white', overflow: 'hidden', transition: 'width 0.3s ease' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ backgroundColor: '#1abc9c', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', marginBottom: '10px', borderRadius: '5px' }}>
              {sidebarOpen ? '→' : '←'}
            </button>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {menuItems.map((item) => (
                <li key={item.panel} style={{ marginBottom: '15px' }}>
                  <button onClick={() => handlePanelChange(item.panel)} style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: activePanel === item.panel ? '#1abc9c' : '#34495e', border: 'none', color: 'white', textAlign: 'left', borderRadius: '5px', cursor: 'pointer', fontSize: '18px', justifyContent: 'flex-start', width: sidebarOpen ? '100%' : '50px', transition: 'background-color 0.3s ease', }} >
                    <FontAwesomeIcon icon={item.icon} style={{ marginRight: '10px', fontSize: '20px', color: 'white', transition: 'transform 0.2s ease', transform: 'scale(1)', ...pulseAnimation, }}/>
                    {sidebarOpen && item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
            <div style={{ padding: '10px', margin: '0 auto', maxWidth: '100%', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminpanel;
