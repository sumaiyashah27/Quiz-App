import React, { useState, useEffect } from 'react';
import axios from 'axios'; // If using 'react-modal' library
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faDollarSign, faUpload } from '@fortawesome/free-solid-svg-icons';

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
  const [editingSubject, setEditingSubject] = useState(null);  
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [questionParts, setQuestionParts] = useState([]); // Make sure it's initialized as an array
  const [answerParts, setAnswerParts] = useState([]);
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [correctAns, setCorrectAns] = useState('');
  // Define state for success and error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      alert("Please enter a subject name.");
      return;
    }
    const priceInDollars = parseFloat(newSubjectPrice);
    if (isNaN(priceInDollars) || priceInDollars <= 0) {
      alert("Please enter a valid price.");
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
      console.error('Error adding subject:', error);
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
      console.error('Error updating subject:', error);
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
        console.error('Error deleting subject:', error);
      }
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };
 
  //Function to render table
  const renderTable = (table, index, partType) => {
   // Ensure table.data is an array, if not, initialize it
    const data = Array.isArray(table.data) ? table.data : [];
    return (
      <div key={`table-${index}`} style={{ marginBottom: '10px' }}>
        <div>
          <label>Rows: </label>
          <input  type="number"  value={table.rows}  min={1}  onChange={(e) => updateTable(index, partType, +e.target.value, table.columns)} />
          <label style={{ marginLeft: '10px' }}>Columns: </label>
          <input  type="number"  value={table.columns}  min={1}  onChange={(e) => updateTable(index, partType, table.rows, +e.target.value)} />
        </div>
        <div  style={{ display: 'grid', gridTemplateColumns: `repeat(${table.columns}, 1fr)`, gap: '5px', marginTop: '10px' }} >
          {data.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <input key={`cell-${rowIndex}-${colIndex}`} type="text" value={cell} onChange={(e) => {const newData = [...data];newData[rowIndex][colIndex] = e.target.value;updateTable(index, partType, table.rows, table.columns);}}/>
            ))
          )}
        </div>
      </div>
    );
  };
  // Function to update value
  const updateValue = (index, value, partType) => {
    const updatedParts = partType === 'question' ? [...questionParts] : [...answerParts];
    updatedParts[index].value = value;
    partType === 'question' ? setQuestionParts(updatedParts) : setAnswerParts(updatedParts);
  };  
  // Define reset form function
  const resetForm = () => {
    setQuestionParts([]); // Reset to an empty array
    setOptions({ a: '', b: '', c: '', d: '' });
    setCorrectAns('');
    setAnswerParts([]);
  };
  // Function to update a table
  const updateTable = (index, partType, rows, columns) => {
    const parts = partType === 'question' ? [...questionParts] : [...answerParts];
    const table = parts[index].value;
    const newData = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: columns }, (_, j) => table.data[i]?.[j] || '')
    );
    parts[index].value = { rows, columns, data: newData };
    partType === 'question' ? setQuestionParts(parts) : setAnswerParts(parts);
  };
  
 // Function to add question part
 const addQuestionPart = (type) => {
  setQuestionParts([...questionParts, { type, value: type === 'table' ? { rows: 1, columns: 1, data: [['']] } : '' }]);
};

// Function to add answer part
const addAnswerPart = (type) => {
  setAnswerParts([...answerParts, { type, value: type === 'table' ? { rows: 1, columns: 1, data: [['']] } : '' }]);
};

const handleAddQuestion = async () => {
  if (!currentSubjectId) {
    console.error("Current Subject ID is null");
    return;
  }
  console.log("Current Subject ID:", currentSubjectId);
  const questionData = {
    question: questionParts,  // The question parts array
    options,
    correctAns,
    answerDescription: answerParts, 
    subjectId: currentSubjectId,
  };

  console.log("Attempting to add question with data:", questionData);

  try {
    const response = await axios.post(`/api/questions`, questionData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("Question added successfully:", response.data);
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    setShowAddQuestionModal(false); // Close modal
    fetchSubjects(); 
    resetForm();
    // other success code
  } catch (error) {
    console.error('Error adding question:', error.response);
    setErrorMessage('An error occurred while adding the question. Please try again.');
  }
};

  return (
    <div>
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
                  <FontAwesomeIcon icon={faEdit} style={{ marginRight: '10px' }} />
                </button>
                <button onClick={() => handleDeleteSubject(subject._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faTrash} style={{ color: 'red' }} />
                </button>
                <button onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
            {expandedSubject === subject._id && (
              <div style={{ marginTop: '10px' }}>
                {/* <button onClick={() => { setCurrentSubjectId(subject._id); setShowUploadModal(true); }} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }} >
                  <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> Upload CSV
                </button> */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <button onClick={() => { setCurrentSubjectId(subject._id); setShowUploadModal(true); }} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Upload CSV
                  </button>
                  <button onClick={() =>{ setCurrentSubjectId(subject._id); setShowAddQuestionModal(true); }} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add Question
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
      {showAddQuestionModal && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'auto', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '80%', maxWidth: '800px', textAlign: 'center', position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', animation: 'fadeIn 0.3s ease-in-out' }}>
            <span onClick={() => setShowAddQuestionModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', fontSize: '24px', color: '#888', transition: 'color 0.3s' }} onMouseEnter={(e) => (e.target.style.color = '#f00')} onMouseLeave={(e) => (e.target.style.color = '#888')}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h3 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>Add New Question</h3>

            {/* Question Parts */}
            <h4 style={{ color: '#555', marginBottom: '10px' }}>Question</h4>
            {questionParts.map((part, index) => {
              switch (part.type) {
                case 'text':
                  return (
                    <textarea key={`question-${index}`} value={part.value} onChange={(e) => updateValue(index, e.target.value, 'question')} placeholder="Enter text" style={{ width: '100%', padding: '10px', marginBottom: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')}/>
                  );
                case 'image':
                  return (
                    <div key={`question-${index}`} style={{ marginBottom: '15px' }}>
                      <input type="text" value={part.value} onChange={(e) => updateValue(index, e.target.value, 'question')} placeholder="Enter image URL" style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')}/>
                      {part.value && (
                        <img src={part.value} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }}/>
                      )}
                    </div>
                  );
                case 'table':
                  return renderTable(part.value, index, 'question');

                default:
                  return null;
              }
            })}
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => addQuestionPart('text')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Text</button>
              <button onClick={() => addQuestionPart('image')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Image</button>
              <button onClick={() => addQuestionPart('table')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Table</button>
            </div>

            {/* Options */}
            <h4 style={{ color: '#555', marginBottom: '10px' }}>Options</h4>
            {['a', 'b', 'c', 'd'].map((option) => (
              <div key={option} style={{ marginBottom: '15px',display: 'flex', alignItems: 'center' }}>
                <label style={{ fontSize: '16px', marginBottom: '5px',width: '80px' }}>{option.toUpperCase()}:</label>
                <input type="text" value={options[option]} onChange={(e) => setOptions({ ...options, [option]: e.target.value })} placeholder={`Option ${option.toUpperCase()}`} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '16px', marginBottom: '5px', display: 'block' }}>Correct Answer: </label>
              <select value={correctAns} onChange={(e) => setCorrectAns(e.target.value)} style={{ padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')}>
                <option value="">Select correct answer</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>

            {/* Answer Parts */}
            <h4 style={{ color: '#555', marginBottom: '10px' }}>Answer Description</h4>
            {answerParts.map((part, index) => {
              switch (part.type) {
                case 'text':
                  return (
                    <textarea key={`answer-${index}`} value={part.value} onChange={(e) => updateValue(index, e.target.value, 'answer')} placeholder="Enter text" style={{ width: '100%', padding: '10px', marginBottom: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')}/>
                  );

                case 'image':
                  return (
                    <div key={`answer-${index}`} style={{ marginBottom: '15px' }}>
                      <input type="text"value={part.value} onChange={(e) => updateValue(index, e.target.value, 'answer')} placeholder="Enter image URL" style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', transition: 'border-color 0.3s' }} onFocus={(e) => (e.target.style.borderColor = '#4CAF50')} onBlur={(e) => (e.target.style.borderColor = '#ddd')}/>
                      {part.value && (
                        <img src={part.value} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }}/>
                      )}
                    </div>
                  );
                case 'table':
                  return renderTable(part.value, index, 'answer');

                default:
                  return null;
              }
            })}
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => addAnswerPart('text')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Text</button>
              <button onClick={() => addAnswerPart('image')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Image</button>
              <button onClick={() => addAnswerPart('table')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '5px' }}>Add Table</button>
            </div>

            <button onClick={handleAddQuestion} style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', marginBottom: '10px', transition: 'background-color 0.3s' }} onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')} onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}>
              Add Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Subject;