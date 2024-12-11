import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import Papa from 'papaparse'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPlus, faTimes, faTrash, faUpload, faDownload } from '@fortawesome/free-solid-svg-icons'; 

const Student = () => { 
  const [users, setUsers] = useState([]); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { fetchUsers(); }, []); 
  const fetchUsers = () => { 
    axios.get('/api/users/users').then(response => { setUsers(response.data); setLoading(false); }).catch(err => { setError("Failed to fetch users data"); setLoading(false); }); 
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        axios.delete(`/api/users/user/${userId}`)
        .then(response => {
          alert("User deleted successfully!");
          fetchUsers(); // Refresh user list after successful deletion
      })
      .catch(error => {
          console.error("Error deleting user:", error);
          alert("Error deleting user.");
      });
    }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type !== 'text/csv') {
    alert("Please select a valid CSV file.");
    setSelectedFile(null); // Reset file if not valid
  } else {
    setSelectedFile(file); // Store file if valid
  }
};

const handleUploadCSV = async () => {
  if (!selectedFile) {
      alert("Please select a CSV file first.");
      return;
  }

  Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
          const usersData = results.data
              .map(user => ({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                  countryCode: user.countryCode,
                  password: user.password // Ensure that the password is included in the CSV
              }))
              .filter(user => user.firstName && user.email && user.password); // Filter out incomplete entries

          console.log("Filtered users data:", usersData); // Log the filtered data

          try {
              const response = await axios.post("http://localhost:5000/api/users/upload-users", usersData, {
                  headers: { 'Content-Type': 'application/json' }
              });

              if (response.status === 200) {
                  alert("CSV uploaded and users added successfully.");
                  fetchUsers(); // Refresh user list after successful upload
              } else {
                  alert("Failed to upload CSV file. Please check the file format.");
              }
          } catch (error) {
              console.error("Error uploading CSV:", error);
              if (error.response && error.response.data.errors) {
                  alert("Errors:\n" + error.response.data.errors.join('\n'));
              } else {
                  alert("Error uploading CSV file: " + (error.response?.data?.message || "Unknown error"));
              }
          }
      }
  });
};

const handleDownloadCSV = () => { 
  const csvData = users.map(user => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    countryCode: user.countryCode,
    phone: user.phone
  }));

  const csv = Papa.unparse(csvData);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "users_data.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

if (loading) return <div>Loading...</div>;

// Inline CSS for the pulse animation effect
const pulseAnimation = {
  animation: 'pulse 1.5s infinite',
};

// Keyframes for the pulse animation
const keyframes = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  }

  /* Media Queries for Responsiveness */
  @media (max-width: 768px) {
    .user-card {
      width: 100%;
      padding: 10px;
    }

    .user-button {
      font-size: 14px;
      padding: 8px 12px;
    }

    .download-button {
      font-size: 14px;
      padding: 8px 12px;
    }

    .user-icon {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .download-button {
      font-size: 12px;
      padding: 6px 10px;
    }

    .user-icon {
      font-size: 14px;
    }

    .user-card {
      padding: 8px;
    }
  }
`;

// Add keyframes to the page dynamically
const styleTag = document.createElement('style');
styleTag.innerHTML = keyframes;
document.head.appendChild(styleTag);

return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '20px' }}>
        <div></div>
        <div>
          <button onClick={handleDownloadCSV} className="download-button" style={{ backgroundColor: "#007bff", color: "white", padding: "10px 15px", fontSize: "16px", borderRadius: "5px", cursor: "pointer", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", border: "none", transition: "all 0.3s ease-in-out" }}>
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px", ...pulseAnimation }} /> Download CSV
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#666' }}>No users found</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {users.map(user => (
            <div key={user.userId} className="user-card" style={{ width: '300px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: '20px', transition: 'transform 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: '#444', fontWeight: 'bold' }}>
                <div>{user.firstName} {user.lastName}</div>
                <FontAwesomeIcon 
                  onClick={() => handleDelete(user.userId)} 
                  icon={faTrash} 
                  className="user-icon" 
                  style={{ color: '#e74c3c', cursor: 'pointer', fontSize: '20px', ...pulseAnimation }} 
                />
              </div>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}><strong>Email:</strong> {user.email}</div>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}><strong>Phone:</strong> {user.countryCode} {user.phone}</div>
              <div style={{ fontSize: '14px', color: '#555' }}><strong>UID:</strong> {user.userId}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Student;
