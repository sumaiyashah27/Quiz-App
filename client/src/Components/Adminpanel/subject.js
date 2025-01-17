import React, { useState, useEffect } from 'react';
import axios from 'axios'; // If using 'react-modal' library
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faDollarSign, faUpload } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newSubjectPrice, setNewSubjectPrice] = useState('');
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false); // Or an appropriate initial value
  const [editingQuestion, setEditingQuestion] = useState(null); // For the question being edited
  const [updatedQuestion, setUpdatedQuestion] = useState({question: '', image: '', options: { a: '', b: '', c: '', d: '' }, correctAnswer: '', description: ''});
  const [expandedQuestion, setExpandedQuestion] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjects(data);
    } catch (error) {
      toast.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name.");
      return;
    }
    const priceInDollars = parseFloat(newSubjectPrice);
    if (isNaN(priceInDollars) || priceInDollars <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/subjects', { name: newSubjectName, price: priceInDollars.toFixed(2),});
      setNewSubjectName('');
      setNewSubjectPrice('');
      setShowAddSubjectModal(false);
      fetchSubjects();
    } catch (error) {
      toast.error('Error adding subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowEditSubjectModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    setLoading(true);
    try {
      await axios.put(`/api/subjects/${editingSubject._id}`, { name: editingSubject.name, price: editingSubject.price, });
      setShowEditSubjectModal(false);
      fetchSubjects();
    } catch (error) {
      toast.error('Error updating subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`/api/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        toast.error('Error deleting subject:', error);
      }
    }
  };

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUploadCSV = async () => {
    if (!selectedFile || !currentSubjectId) {
      toast.error("Please select a file and chapter.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(`/api/subjects/${currentSubjectId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("File uploaded successfully!");
      setShowUploadModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error uploading file, please try again.");
    }
  };
  
  const handleEditQuestion = (question, currentSubjectId) => {
    setEditingQuestion(question); // Set the selected question to be edited
    setCurrentSubjectId(currentSubjectId); // Set the subject ID
  
    setUpdatedQuestion({
      questionText1: question.questionText1 || '',
      questionImage1: question.questionImage1 || '',
      questionTable1: question.questionTable1 || [],
      
      questionText2: question.questionText2 || '',
      questionImage2: question.questionImage2 || '',
      questionTable2: question.questionTable2 || [],
      
      questionText3: question.questionText3 || '',
      questionImage3: question.questionImage3 || '',
      questionTable3: question.questionTable3 || [],
      
      options: question.options || { a: '', b: '', c: '', d: '' },
      correctAns: question.correctAns || '',
      
      answerDescriptionText1: question.answerDescriptionText1 || '',
      answerDescriptionImage1: question.answerDescriptionImage1 || '',
      answerDescriptionTable1: question.answerDescriptionTable1 || [],
      
      answerDescriptionText2: question.answerDescriptionText2 || '',
      answerDescriptionImage2: question.answerDescriptionImage2 || '',
      answerDescriptionTable2: question.answerDescriptionTable2 || [],
      
      answerDescriptionText3: question.answerDescriptionText3 || '',
      answerDescriptionImage3: question.answerDescriptionImage3 || '',
      answerDescriptionTable3: question.answerDescriptionTable3 || [],
    });
  
    setShowEditQuestionModal(true); // Show the edit question modal
  };
  
  const handleUpdateQuestion = async () => {
    if (!currentSubjectId || !editingQuestion?._id) {
      toast.error("Missing Subject ID or question ID");
      return; // Return early if subject or question ID is invalid
    }
    setLoading(true);
  
    try {
      // Send PUT request to update the question with all its fields
      const response = await axios.put(
        `/api/subjects/${currentSubjectId}/questions/${editingQuestion._id}`,
        {
          questionText1: updatedQuestion.questionText1,
          questionImage1: updatedQuestion.questionImage1,
          questionTable1: updatedQuestion.questionTable1,
          
          questionText2: updatedQuestion.questionText2,
          questionImage2: updatedQuestion.questionImage2,
          questionTable2: updatedQuestion.questionTable2,
          
          questionText3: updatedQuestion.questionText3,
          questionImage3: updatedQuestion.questionImage3,
          questionTable3: updatedQuestion.questionTable3,
          
          options: updatedQuestion.options,
          correctAns: updatedQuestion.correctAns,
          
          answerDescriptionText1: updatedQuestion.answerDescriptionText1,
          answerDescriptionImage1: updatedQuestion.answerDescriptionImage1,
          answerDescriptionTable1: updatedQuestion.answerDescriptionTable1,
          
          answerDescriptionText2: updatedQuestion.answerDescriptionText2,
          answerDescriptionImage2: updatedQuestion.answerDescriptionImage2,
          answerDescriptionTable2: updatedQuestion.answerDescriptionTable2,
          
          answerDescriptionText3: updatedQuestion.answerDescriptionText3,
          answerDescriptionImage3: updatedQuestion.answerDescriptionImage3,
          answerDescriptionTable3: updatedQuestion.answerDescriptionTable3,
        }
      );
  
      console.log('Question updated:', response.data);
      toast.success('Question updated successfully');
      setShowEditQuestionModal(false); // Close the modal after updating
      fetchSubjects(); // Refresh the subjects list with the updated question
    } catch (error) {
      toast.error('Error updating question:', error.response?.data || error);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestion((prevState) => ({ ...prevState, [questionId]: !prevState[questionId], }));
  };

  function generateTableData(rows, cols) {
  return {
    rows,
    cols,
    data: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "")
    ),
  };
}
// Update a specific cell in the table
function updateTableCell(question, index, rowIndex, colIndex, value) {
  const tableKey = `questionTable${index}`;
  const updatedTable = { ...question[tableKey] };
  updatedTable.data[rowIndex][colIndex] = value;

  setUpdatedQuestion((prev) => ({
    ...prev,
    [tableKey]: updatedTable,
  }));
}

const handleDownloadCSV = async (currentSubjectId) => {
  if (!currentSubjectId) {
    toast.error("Please select a subject first.");
    return;
  }
  try {
    const response = await axios.get(`/api/subjects/${currentSubjectId}/download-csv`, {
      responseType: 'blob', // Important for handling files
    });
    
    // Create a download link for the CSV file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'questions.csv'); // Specify the file name
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    toast.error("Error downloading CSV:", error);
    toast.error("Failed to download CSV. Please try again.");
  }
};

const handleDeleteQuestion = async (questionId, currentSubjectId) => {
  try {
    // Confirm deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    // API call to delete question from the database
    const response = await fetch(`/api/subjects/${currentSubjectId}/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Update the local state after deletion
      setSubjects((prevSubjects) =>
        prevSubjects.map((sub) =>
          sub._id === currentSubjectId
            ? {
                ...sub,
                questions: sub.questions.filter((q) => q._id !== questionId),
              }
            : sub
        )
      );
      toast.success("Question deleted successfully!");
    } else {
      alert("Failed to delete question. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    alert("An error occurred while deleting the question.");
  }
};

const handleCSVUpload = async (event, currentSubjectId) => {
  if (!currentSubjectId) {
    toast.error("Please select a subject first.");
    return;
  }

  const file = event.target.files[0];
  if (!file) {
    toast.error("No file selected.");
    return;
  }

  const formData = new FormData();
  formData.append("csvFile", file);

  try {
    const response = await axios.post(`/api/subjects/${currentSubjectId}/upload-csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      toast.success("CSV uploaded successfully!");
      // Optionally, refresh the data on the page
    } else {
      console.error("Failed to upload CSV.");
    }
  } catch (error) {
    console.error("Error uploading CSV:", error);
    toast.error("An error occurred while uploading the CSV.");
  }
};

  return (
    <div>
       <ToastContainer />
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#4CAF50' }}>Subject Details</h2>

      {/* Button to Add Subject */}
      <button onClick={() => setShowAddSubjectModal(true)} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Add Subject
      </button>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative' }}>
            <span onClick={() => setShowAddSubjectModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '20px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h3>Add New Subject</h3>
            <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name" style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
            <div style={{ position: 'relative', width: '100%', margin: '10px 0' }}>
              <FontAwesomeIcon icon={faDollarSign} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', fontSize: '16px', color: '#888' }} />
              <input type="number" value={newSubjectPrice} onChange={(e) => setNewSubjectPrice(e.target.value)} placeholder="Subject Price" style={{ width: '100%', padding: '10px 10px 10px 30px', margin: '0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} min="0" />
            </div>
            <button onClick={handleAddSubject} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}>
              Add Subject
            </button>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditSubjectModal && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative' }}>
            <span onClick={() => setShowEditSubjectModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '20px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h3>Edit Subject</h3>
            <input type="text" value={editingSubject.name} onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })} placeholder="Subject Name" style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
            <div style={{ position: 'relative', width: '100%', margin: '10px 0' }}>
              <FontAwesomeIcon icon={faDollarSign} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', fontSize: '16px', color: '#888' }} />
              <input type="number" value={editingSubject.price} onChange={(e) => setEditingSubject({ ...editingSubject, price: e.target.value })} placeholder="Subject Price" style={{ width: '100%', padding: '10px 10px 10px 30px', margin: '0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'}} />            
            </div>
            <button onClick={handleUpdateSubject} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}>
              Update Subject
            </button>
          </div>
        </div>
      )}

      {/* List of Subjects */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        subjects.map((subject) => (
          <div key={subject._id} style={{ marginBottom: '20px', backgroundColor: '#f1f1f1', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div onClick={() => toggleSubjectExpansion(subject._id)} style={{ fontWeight: 'bold' }}>
                {subject.name}</div>
              <div>
                <button onClick={() => handleEditSubject(subject)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faEdit} style={{ color: '#333',  fontSize: '20px', marginRight: '10px' }} />
                </button>
                <button onClick={() => handleDeleteSubject(subject._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faTrash} style={{ color: '#e74c3c', cursor: 'pointer', fontSize: '20px' }} />
                </button>
                <button onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faPlus} style={{color: '#4CAF50', cursor: 'pointer', fontSize: '20px',marginLeft: '20px',marginRight: '10px'}} />
                </button>
              </div>
            </div>

            {expandedSubject === subject._id && (
              <div style={{ marginTop: '10px' }}>
                <button onClick={() => { setCurrentSubjectId(subject._id); setShowUploadModal(true); }} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }} >
                  <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> Upload CSV
                </button>
                <button onClick={() => { handleDownloadCSV(subject._id); }} className="download-csv-btn">
                  Download CSV
                </button>

                <input type="file" accept=".csv" onChange={(event) => handleCSVUpload(event, currentSubjectId)} />

                {/* <button onClick={() => { setCurrentSubjectId(subject._id); setShowUploadModal(true); }} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }} >
                  <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> Upload CSV
                </button> */}


                {/* Questions here */}
                <>
                <ul style={{ paddingLeft: "20px" }}>
                {subject.questions.map((question) => (
                  <li key={question._id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      {/* Question Title */}
                      <span onClick={() => toggleQuestionExpand(question._id)} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} >
                        Question {subject.questions.indexOf(question) + 1}
                      </span>
                      <div>
                        {/* Edit Button */}
                        <button onClick={() => handleEditQuestion(question, subject._id)} style={{ marginLeft: "5px", padding: "5px 12px", backgroundColor: "#4CAF50", color: "white", borderRadius: "5px", cursor: "pointer" }} >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {/* Delete Button */}
                        <button onClick={() => handleDeleteQuestion(question._id, currentSubjectId)} style={{ marginLeft: "5px", padding: "5px 12px", backgroundColor: "#f44336", color: "white", borderRadius: "5px", cursor: "pointer" }} >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    {/* Render Question Details Conditionally */}
                    {expandedQuestion[question._id] && (
                      <div style={{ marginTop: "10px", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
                        
                        {/* Question Text 1 */}
                        {question.questionText1 && (
                          <p>{question.questionText1}</p>
                        )}
                        
                        {/* Question Image 1 */}
                        {question.questionImage1 && (
                          <div>
                            <img src={question.questionImage1} style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Question Table 1 */}
                        {question.questionTable1 && Array.isArray(question.questionTable1.data) && question.questionTable1.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.questionTable1.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {/* Question Text 2 */}
                        {question.questionText2 && (
                          <p> {question.questionText2}</p>
                        )}

                        {/* Question Image 2 */}
                        {question.questionImage2 && (
                          <div>
                            <img src={question.questionImage2} style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Question Table 2 */}
                        {question.questionTable2 && Array.isArray(question.questionTable2.data) && question.questionTable2.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.questionTable2.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {/* Question Text 3 */}
                        {question.questionText3 && (
                          <p> {question.questionText3}</p>
                        )}

                        {/* Question Image 3 */}
                        {question.questionImage3 && (
                          <div>
                            <img src={question.questionImage3} style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Question Table 3 */}
                        {question.questionTable3 && Array.isArray(question.questionTable3.data) && question.questionTable3.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.questionTable3.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {/* Options */}
                        <p><strong>Options:</strong></p>
                        <ul style={{ listStyleType: "none", paddingLeft: "10px" }}>
                          {question.options.a && <li>A. {question.options.a}</li>}
                          {question.options.b && <li>B. {question.options.b}</li>}
                          {question.options.c && <li>C. {question.options.c}</li>}
                          {question.options.d && <li>D. {question.options.d}</li>}
                        </ul>

                        {/* Correct Answer */}
                        {question.correctAns && (
                          <p><strong>Correct Answer:</strong> {question.correctAns}</p>
                        )}

                        {/* Answer Description */}
                        <p><strong>Answer Description:</strong></p>

                        {/* Answer Description Text 1 */}
                        {question.answerDescriptionText1 && (
                          <p>{question.answerDescriptionText1}</p>
                        )}

                        {/* Answer Description Image 1 */}
                        {question.answerDescriptionImage1 && (
                          <div>
                            <img src={question.answerDescriptionImage1} style={{ maxWidth: "75%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Answer Description Table 1 */}
                        {question.answerDescriptionTable1 && Array.isArray(question.answerDescriptionTable1.data) && question.answerDescriptionTable1.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.answerDescriptionTable1.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Answer Description Text 2 */}
                        {question.answerDescriptionText2 && (
                          <p>{question.answerDescriptionText2}</p>
                        )}

                        {/* Answer Description Image 2 */}
                        {question.answerDescriptionImage2 && (
                          <div>
                            <img src={question.answerDescriptionImage2} style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Answer Description Table 2 */}
                        {question.answerDescriptionTable2 && Array.isArray(question.answerDescriptionTable2.data) && question.answerDescriptionTable1.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.answerDescriptionTable2.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Answer Description Text 3 */}
                        {question.answerDescriptionText3 && (
                          <p>{question.answerDescriptionText3}</p>
                        )}

                        {/* Answer Description Image 3 */}
                        {question.answerDescriptionImage3 && (
                          <div>
                            <img src={question.answerDescriptionImage3} style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }} />
                          </div>
                        )}

                        {/* Answer Description Table 3 */}
                        {question.answerDescriptionTable3 && Array.isArray(question.answerDescriptionTable3.data) && question.answerDescriptionTable3.data.length > 0 && (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                              <tbody>
                                {question.answerDescriptionTable3.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
            </div>
            )}
          </div>
        ))
      )}
      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative' }}>
            <span onClick={() => setShowUploadModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '20px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h3>Upload CSV for Questions</h3>
            <input type="file" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={handleUploadCSV} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer' }}>
              Upload CSV
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {errorMessage}
        </div>
      )}  

      {showEditQuestionModal && (
        <Modal isOpen={showEditQuestionModal} onClose={() => setShowEditQuestionModal(false)} contentLabel="Edit Question"  style={{overlay: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }, content: { position: 'relative', maxWidth: '500px', maxHeight: '80vh', margin: '0 auto', padding: '20px', overflow: 'hidden', borderRadius: '10px', }, }}>
          <h3>Edit Question</h3>
          {/* Question Fields */}
          <div style={{ maxHeight: 'calc(80vh - 50px)', overflowY: 'auto', paddingRight: '10px',}}>
            {[1, 2, 3].map((index) => (
              <div key={`question-set-${index}`}>
                <input type="text" value={updatedQuestion[`questionText${index}`]}
                  onChange={(e) =>
                    setUpdatedQuestion((prev) => ({
                      ...prev,
                      [`questionText${index}`]: e.target.value,
                    }))
                  } placeholder={`Question Text ${index}`} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
                />
                <input type="text" value={updatedQuestion[`questionImage${index}`]}
                  onChange={(e) =>
                    setUpdatedQuestion((prev) => ({
                      ...prev,
                      [`questionImage${index}`]: e.target.value,
                    }))
                  } placeholder={`Question Image ${index} URL`} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
                />
                {updatedQuestion[`questionImage${index}`] && (
                  <img src={updatedQuestion[`questionImage${index}`]} alt={`Preview ${index}`} style={{ maxWidth: '25%', maxHeight: '200px', borderRadius: '5px', marginBottom: '10px', }}/>
                )}
                {/* Table Editor */}
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="number" min="1" placeholder="Rows"
                      value={
                        updatedQuestion[`questionTable${index}`]?.rows || 0
                      }
                      onChange={(e) =>
                        setUpdatedQuestion((prev) => {
                          const rows = parseInt(e.target.value) || 0;
                          const cols = updatedQuestion[`questionTable${index}`]?.cols || 0;
                          return {
                            ...prev,
                            [`questionTable${index}`]: generateTableData(rows, cols),
                          };
                        })
                      } style={{ width: '50%', padding: '10px' }}
                    />
                    <input type="number" min="1" placeholder="Columns"
                      value={
                        updatedQuestion[`questionTable${index}`]?.cols || 0
                      }
                      onChange={(e) =>
                        setUpdatedQuestion((prev) => {
                          const rows =
                            updatedQuestion[`questionTable${index}`]?.rows || 0;
                          const cols = parseInt(e.target.value) || 0;
                          return {
                            ...prev,
                            [`questionTable${index}`]: generateTableData(rows, cols),
                          };
                        })
                      } style={{ width: '50%', padding: '10px' }}
                    />
                  </div>
                  <table border="1" style={{ width: '100%', textAlign: 'center', marginBottom: '10px', }} >
                    <tbody>
                      {updatedQuestion[`questionTable${index}`]?.data?.map(
                        (row, rowIndex) => (
                          <tr key={`row-${rowIndex}`}>
                            {row.map((cell, colIndex) => (
                              <td key={`cell-${rowIndex}-${colIndex}`}>
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell( updatedQuestion, index, rowIndex, colIndex, e.target.value )
                                  }
                                  style={{ width: '100%', padding: '5px', }}
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Options */}
            {['a', 'b', 'c', 'd'].map((option) => (
              <input key={option} type="text" value={updatedQuestion.options[option]}
                onChange={(e) =>
                  setUpdatedQuestion((prev) => ({
                    ...prev,
                    options: { ...prev.options, [option]: e.target.value },
                  }))
                }
                placeholder={`Option ${option.toUpperCase()}`}
                style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
              />
            ))}

            {/* Correct Answer */}
            <input type="text" value={updatedQuestion.correctAns}
              onChange={(e) =>
                setUpdatedQuestion((prev) => ({
                  ...prev,
                  correctAns: e.target.value,
                }))
              } placeholder="Correct Answer (a, b, c, or d)" style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
            />
            {/* Answer Description Fields */}
            {[1, 2, 3].map((index) => (
              <div key={`answer-description-${index}`}>
                <textarea
                  value={updatedQuestion[`answerDescriptionText${index}`]}
                  onChange={(e) =>
                    setUpdatedQuestion((prev) => ({
                      ...prev,
                      [`answerDescriptionText${index}`]: e.target.value,
                    }))
                  }
                  placeholder={`Answer Description Text ${index}`}
                  style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
                />
                <input
                  type="text"
                  value={updatedQuestion[`answerDescriptionImage${index}`]}
                  onChange={(e) =>
                    setUpdatedQuestion((prev) => ({
                      ...prev,
                      [`answerDescriptionImage${index}`]: e.target.value,
                    }))
                  }
                  placeholder={`Answer Description Image ${index} URL`}
                  style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
                />
                {updatedQuestion[`answerDescriptionImage${index}`] && (
                  <img
                    src={updatedQuestion[`answerDescriptionImage${index}`]}
                    alt={`Answer Description Preview ${index}`}
                    style={{
                      maxWidth: '25%',
                      maxHeight: '200px',
                      borderRadius: '5px',
                      marginBottom: '10px',
                    }}
                  />
                )}
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="number" min="1" placeholder="Rows"
                      value={
                        updatedQuestion[`answerDescriptionTable${index}`]?.rows || 0
                      }
                      onChange={(e) =>
                        setUpdatedQuestion((prev) => {
                          const rows = parseInt(e.target.value) || 0;
                          const cols = updatedQuestion[`answerDescriptionTable${index}`]?.cols || 0;
                          return {
                            ...prev,
                            [`answerDescriptionTable${index}`]: generateTableData(rows, cols),
                          };
                        })
                      } style={{ width: '50%', padding: '10px' }}
                    />
                    <input type="number" min="1" placeholder="Columns"
                      value={
                        updatedQuestion[`answerDescriptionTable${index}`]?.cols || 0
                      }
                      onChange={(e) =>
                        setUpdatedQuestion((prev) => {
                          const rows =
                            updatedQuestion[`answerDescriptionTable${index}`]?.rows || 0;
                          const cols = parseInt(e.target.value) || 0;
                          return {
                            ...prev,
                            [`answerDescriptionTable${index}`]: generateTableData(rows, cols),
                          };
                        })
                      } style={{ width: '50%', padding: '10px' }}
                    />
                  </div>
                  <table border="1" style={{ width: '100%', textAlign: 'center', marginBottom: '10px', }} >
                    <tbody>
                      {updatedQuestion[`answerDescriptionTable${index}`]?.data?.map(
                        (row, rowIndex) => (
                          <tr key={`row-${rowIndex}`}>
                            {row.map((cell, colIndex) => (
                              <td key={`cell-${rowIndex}-${colIndex}`}>
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell( updatedQuestion, index, rowIndex, colIndex, e.target.value )
                                  }
                                  style={{ width: '100%', padding: '5px', }}
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {/* Update Button */}
            <button onClick={handleUpdateQuestion} style={{ backgroundColor: 'green', color: 'white', padding: '10px 15px', borderRadius: '4px', }} >
              <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
              Update Question
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "400px", textAlign: "center", position: "relative" }}>
      <span onClick={onClose} style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer", fontSize: "20px" }}>
        <FontAwesomeIcon icon={faTimes} />
      </span>
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);
export default Subject;