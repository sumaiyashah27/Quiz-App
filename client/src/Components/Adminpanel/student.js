import React, { useEffect, useState } from 'react'; 
import axios from 'axios'; 
import Papa from 'papaparse'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPlus, faTimes, faTrash, faEye, faEyeSlash, faDownload } from '@fortawesome/free-solid-svg-icons'; 

const Student = () => { 
  const [users, setUsers] = useState([]); 
  const [error, setError] = useState(null); 
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); 
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', countryCode: '+1', password: '', confirmPassword: '' }); 
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
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

const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
              const response = await axios.post("/api/users/upload-users", usersData, {
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

const handleFormSubmit = (e) => { 
  e.preventDefault(); 
  if (formData.password !== formData.confirmPassword) { 
    alert("Passwords do not match!"); 
    return; 
  }
  const dataToSubmit = {firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, countryCode: formData.countryCode, password: formData.password, };

  axios.post('/api/users/signup', dataToSubmit) // Submit to the same signup endpoint
    .then(() => { 
      alert("User  added successfully"); 
      setShowAddStudentModal(false); 
      fetchUsers(); 
    })
    .catch(() => alert("Error adding user"));
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
        <div>
          <button onClick={() => setShowAddStudentModal(true)} style={{ backgroundColor: "green", color: "white", padding: "10px 12px", fontSize: "14px", borderRadius: "8px", cursor: "pointer", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease", }} >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} /> Add Student
          </button>
        </div>
        <div>
          <button onClick={handleDownloadCSV} className="download-button" style={{ backgroundColor: "#007bff", color: "white", padding: "10px 15px", fontSize: "16px", borderRadius: "5px", cursor: "pointer", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", border: "none", transition: "all 0.3s ease-in-out" }}>
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px", ...pulseAnimation }} /> Download CSV
          </button>
        </div>
      </div>

      {showAddStudentModal && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative' }}>
            <span onClick={() => setShowAddStudentModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '20px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h3>Add New Student</h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" style={{ width: '48%', padding: '10px', margin: '10px 0' }} required />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" style={{ width: '48%', padding: '10px', margin: '10px 0' }} required />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" style={{ width: '100%', padding: '10px', margin: '10px 0' }} required />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} style={{ width: '30%', padding: '10px', margin: '10px 5px 10px 0' }} required>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+81">+81 (JP)</option>
                  {/* Add more options as needed */}
                </select>
                <input  type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone No" style={{ width: '70%', padding: '10px', margin: '10px 0' }} required/>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={passwordVisible ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" style={{ width: '100%', padding: '10px', margin: '10px 0' }} required />        
                <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} onClick={() => setPasswordVisible(!passwordVisible)} style={{ position: 'absolute', top: '50%', cursor: 'pointer',transform: 'translateY(-50%)',right: '10px' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <input type={confirmPasswordVisible ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" style={{ width: '100%', padding: '10px', margin: '10px 0' }} required />
                <FontAwesomeIcon icon={confirmPasswordVisible ? faEye : faEyeSlash} onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={{ position: 'absolute', top: '50%', cursor: 'pointer',transform: 'translateY(-50%)',right: '10px' }} />
              </div>
              <button type="submit" style={{ backgroundColor: "green",  color: "white",  padding: "12px 25px", fontSize: "14px", borderRadius: "8px", cursor: "pointer", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease", }}><FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />Add Student</button>
            </form>
          </div>
        </div>
      )}

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
