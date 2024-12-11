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

  const handleUploadCSV = async () => {
    if (!selectedFile || !currentSubjectId) {
      alert("Please select a file and chapter.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(`/api/subjects/${currentSubjectId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setShowUploadModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  const handleEditQuestion = (question, currentSubjectId) => {
    setEditingQuestion(question); // Set the selected question to be edited
    setCurrentSubjectId(currentSubjectId); // Set the chapter ID
    setUpdatedQuestion({
      question: question.question,
      image: question.questionImage || '', // Set current image or empty
      options: question.options || { a: '', b: '', c: '', d: '' },
      correctAnswer: question.correctAns,
      description: question.answerDescription,
    });
    setShowEditQuestionModal(true); // Show the edit question modal
  };
  
  const handleUpdateQuestion = async () => {
    if (!currentSubjectId || !editingQuestion?._id) {
      console.error("Missing Subject ID or question ID");
      return; // Return early if chapter or question ID is invalid
    }setLoading(true);

    try {
      // Send PUT request to update the question with all its fields
      const response = await axios.put(
        `/api/subjects/${currentSubjectId}/questions/${editingQuestion._id}`,
        {
          question: updatedQuestion.question,
          questionImage: updatedQuestion.image,
          options: updatedQuestion.options,
          correctAns: updatedQuestion.correctAnswer,
          answerDescription: updatedQuestion.description,
        }
      );
      console.log('Question updated:', response.data);
      alert('Question updat Sucessfully');
      setShowEditQuestionModal(false); // Close the modal after updating
      fetchSubjects(); // Refresh the chapters list with the updated question
    } catch (error) {
      console.error('Error updating question:', error.response?.data || error);
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestion((prevState) => ({ ...prevState, [questionId]: !prevState[questionId], }));
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
                <button onClick={() => { setCurrentSubjectId(subject._id); setShowUploadModal(true); }} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }} >
                  <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> Upload CSV
                </button>
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
                        <button style={{ marginLeft: "5px", padding: "5px 12px", backgroundColor: "#f44336", color: "white", borderRadius: "5px", cursor: "pointer" }} >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    {/* Render Question Details Conditionally */}
                    {expandedQuestion[question._id] && (
                      <div style={{ marginTop: "10px", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
                        <p><strong>Question:</strong> {question.question}</p>
                        {question.questionImage && (
                          <img src={question.questionImage} alt="Question" style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px" }} />
                        )}
                        <p><strong>Options:</strong></p>
                        <ul style={{ listStyleType: "none", paddingLeft: "10px" }}>
                          <li>A. {question.options.a}</li>
                          <li>B. {question.options.b}</li>
                          <li>C. {question.options.c}</li>
                          <li>D. {question.options.d}</li>
                        </ul>
                        <p><strong>Correct Answer:</strong> {question.correctAns}</p>
                        <p><strong>Answer Description:</strong> {question.answerDescription}</p>
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
      {showEditQuestionModal && (
        <Modal isOpen={showEditQuestionModal} onClose={() => setShowEditQuestionModal(false)} contentLabel="Edit Question" style={{ content: { maxWidth: '600px', margin: 'auto' } }}>
          <h3>Edit Question</h3>
          <input type="text" value={updatedQuestion.question} onChange={(e) => setUpdatedQuestion((prev) => ({ ...prev, question: e.target.value }))} placeholder="Question" style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/>
          <input type="text" value={updatedQuestion.image} onChange={(e) => setUpdatedQuestion((prev) => ({ ...prev, image: e.target.value })) } placeholder="Image URL (Optional)" style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/>
          {updatedQuestion.image && (
            <img src={updatedQuestion.image}alt="Preview" style={{ maxWidth: '25%', maxHeight: '200px', borderRadius: '5px', marginBottom: '10px', }}/>
          )}
          {['a', 'b', 'c', 'd'].map((option) => (
            <input key={option} type="text" value={updatedQuestion.options[option]} onChange={(e) => setUpdatedQuestion((prev) => ({  ...prev,  options: { ...prev.options, [option]: e.target.value }, })) } placeholder={`Option ${option.toUpperCase()}`} style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/>
          ))}
          <input type="text" value={updatedQuestion.correctAnswer}onChange={(e) =>  setUpdatedQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }))}placeholder="Correct Answer"style={{ padding: '10px', width: '100%', marginBottom: '10px' }}/>
          <textarea value={updatedQuestion.description} onChange={(e) => setUpdatedQuestion((prev) => ({ ...prev, description: e.target.value })) }placeholder="Answer Description"style={{ padding: '10px', width: '100%', marginBottom: '10px' }} />
          <button onClick={handleUpdateQuestion} style={{ backgroundColor: 'green', color: 'white', padding: '10px 15px', borderRadius: '4px',}} >
            <FontAwesomeIcon icon={faEdit} style={{ marginRight: "5px" }} />Update Question
          </button>
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