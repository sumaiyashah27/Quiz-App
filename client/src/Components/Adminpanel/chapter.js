import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChevronDown, faChevronUp,faTrash, faEdit, faTimes, faUpload,  } from "@fortawesome/free-solid-svg-icons";

const Chapter = () => {
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [updatedChapterName, setUpdatedChapterName] = useState('');
  const [newChapterName, setNewChapterName] = useState("");
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState({});
  const [updatedQuestion, setUpdatedQuestion] = useState({ question: '', questionImage: '', options: { a: '', b: '', c: '', d: '' }, correctAns: '', answerDescription: '',});


  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data } = await axios.get("/api/chapters");
      setChapters(data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const handleAddChapter = async () => {
    try {
      // Sending POST request to add a new chapter
      await axios.post("/api/chapters/add", { name: newChapterName });
      setNewChapterName(""); // Clear the input field after submission
      setShowAddChapterModal(false); // Close the modal
      fetchChapters(); // Fetch updated chapters list
    } catch (error) {
      console.error("Error adding chapter:", error);
    };
  };

  const handleUploadCSV = async () => {
    if (!selectedFile || !selectedChapterId) {
      alert("Please select a file and chapter.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(`/api/chapters/${selectedChapterId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setShowUploadModal(false);
      fetchChapters();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleEditChapter = async () => {
    try {
      await axios.put(`/api/chapters/${editingChapter._id}/edit`, { name: updatedChapterName });
      setShowEditChapterModal(false); // Close the modal
      fetchChapters(); // Refresh the list
    } catch (error) {
      console.error('Error editing chapter:', error);
    }
  };

  const handleEditButtonClick = (chapter) => {
    setEditingChapter(chapter); 
    setSelectedChapterId(chapter._id);
    setUpdatedChapterName(chapter.name); // Update with the correct variable
    setShowEditChapterModal(true);
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      // Send DELETE request to delete chapter by its ID
      await axios.delete(`/api/chapters/${chapterId}`);
      fetchChapters(); // Refresh the chapters list after deletion
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  const handleEditQuestion = (question, chapterId) => {
    setEditingQuestion(question); // Set the selected question to be edited
    setSelectedChapterId(chapterId); // Set the chapter ID
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
    if (!selectedChapterId || !editingQuestion?._id) {
      console.error("Missing chapter ID or question ID");
      return; // Return early if chapter or question ID is invalid
    }
  
    try {
      // Send PUT request to update the question with all its fields
      const response = await axios.put(
        `/api/chapters/${selectedChapterId}/questions/${editingQuestion._id}`,
        {
          question: updatedQuestion.question,
          questionImage: updatedQuestion.image,
          options: updatedQuestion.options,
          correctAns: updatedQuestion.correctAnswer,
          answerDescription: updatedQuestion.description,
        }
      );
      console.log('Question updated:', response.data);
  
      setShowEditQuestionModal(false); // Close the modal after updating
      fetchChapters(); // Refresh the chapters list with the updated question
    } catch (error) {
      console.error('Error updating question:', error.response?.data || error);
    }
  };

  const toggleChapterExpand = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };
  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestion((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Chapter Management</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setShowAddChapterModal(true)} style={{ display: "flex", alignItems: "center", backgroundColor: "green", color: "white", padding: "10px 12px", borderRadius: "8px", cursor: "pointer",}}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />Add Chapter
        </button>
      </div>

      {chapters.map((chapter) => (
        <div key={chapter._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginTop: "15px", backgroundColor: "#f9f9f9", }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           {/* Chapter Name */}
            <h4 style={{ margin: 0 }} onClick={() => toggleChapterExpand(chapter._id)}>{chapter.name}</h4>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Edit Button */}
              <button onClick={() => handleEditButtonClick(chapter)} style={{ marginRight: '10px', padding: '5px 12px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s ease' }} >
                <FontAwesomeIcon icon={faEdit} />
              </button>
                {/* Delete Button */}
              <button onClick={() => handleDeleteChapter(chapter._id)} style={{ marginRight: '10px', padding: '5px 12px', backgroundColor: '#f44336', color: 'white', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s ease' }} >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              {/* Expand/Collapse Button */}
              <button  style={{ backgroundColor: "transparent", border: "none", fontSize: "16px" }}  onClick={() => toggleChapterExpand(chapter._id)} >
                <FontAwesomeIcon icon={expandedChapters[chapter._id] ? faChevronUp : faChevronDown} />
              </button>
            </div>
          </div>

          {expandedChapters[chapter._id] && (
            <>
              <button onClick={() => { setSelectedChapterId(chapter._id); setShowUploadModal(true); }}  style={{ backgroundColor: "purple", color: "white", padding: "8px 10px", margin: "10px 0", borderRadius: "4px", cursor: "pointer", }} >
                <FontAwesomeIcon icon={faUpload} style={{ marginRight: "5px" }} />Upload Question Bank
              </button>
              <ul style={{ paddingLeft: "20px" }}>
  {chapter.questions.map((question) => (
    <li key={question._id} style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          onClick={() => toggleQuestionExpand(question._id)}
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        >
          {`Que ${chapter.questions.indexOf(question) + 1}`}
        </span>
        <div>
          <button
            onClick={() => handleEditQuestion(question, chapter._id)}
            style={{
              marginLeft: "5px",
              padding: "5px 5px",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            style={{
              marginLeft: "5px",
              padding: "5px 5px",
              backgroundColor: "#f44336",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {/* Render Question Details Conditionally */}
      {expandedQuestion[question._id] && (
        <div style={{ marginTop: "10px", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
          <p><strong>Question:</strong> {question.question}</p>
          {question.questionImage && (
            <img
              src={question.questionImage}
              alt="Question"
              style={{ maxWidth: "100%", borderRadius: "5px", marginBottom: "10px" }}
            />
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
          )}
        </div>
      ))}

      {showAddChapterModal && (
        <Modal title="Add Chapter" onClose={() => setShowAddChapterModal(false)} >
          <input type="text" value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} placeholder="Chapter Name" style={{ padding: "10px", width: "100%", marginBottom: "10px" }} />
          <button onClick={handleAddChapter} style={{ backgroundColor: "green", color: "white", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />Add Chapter
          </button>
        </Modal>
      )}

      {showUploadModal && (
        <Modal title="Upload Question Bank"onClose={() => setShowUploadModal(false)} >
          <div style={{ marginBottom: "10px" }}>
            <input type="file" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ marginBottom: "10px" }}/>
          </div>
          <button onClick={handleUploadCSV} style={{backgroundColor: "purple",color: "white",padding: "8px 12px",borderRadius: "4px",cursor: "pointer", }} >
            <FontAwesomeIcon icon={faUpload} style={{ marginRight: "5px" }} />Upload
          </button>
        </Modal>
      )}

      {showEditChapterModal && (
        <Modal title="Edit Chapter"onClose={() => setShowEditChapterModal(false)} >
          <input type="text" value={updatedChapterName} onChange={(e) => setUpdatedChapterName(e.target.value)} placeholder="Edit Chapter Name" style={{ padding: '10px', width: '100%', marginBottom: '10px', }} />
          <button onClick={handleEditChapter}style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer',}}>
            <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} /> Update Chapter
          </button>
        </Modal>
      )}

      {showEditQuestionModal && (
        <Modal title="Edit Question" onClose={() => setShowEditQuestionModal(false)}>
          <div>
            <input type="text" value={updatedQuestion.question} onChange={(e) => setUpdatedQuestion((prev) => ({ ...prev, question: e.target.value }))} placeholder="Question" style={{ padding: "10px", width: "100%", marginBottom: "10px" }}/>
            <input type="text" value={updatedQuestion.image} onChange={(e) => setUpdatedQuestion((prev) => ({  ...prev,  image: e.target.value,  })) } placeholder="Image URL (Optional)" style={{ padding: "10px", width: "100%", marginBottom: "10px" }} />
            {/* Display Image Preview */}
            {updatedQuestion.image && (
              <div style={{ marginBottom: "10px" }}>
                <img src={updatedQuestion.image} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", border: "1px solid #ddd", borderRadius: "4px", }}/>
              </div>
            )}
            {/* Options a, b, c, d in pairs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {["a", "b"].map((option) => (
                <div key={option} style={{ flex: "1" }}>
                  <input type="text" value={updatedQuestion.options[option]} onChange={(e) => setUpdatedQuestion((prev) => ({  ...prev,  options: { ...prev.options, [option]: e.target.value },  })) } placeholder={`Option ${option.toUpperCase()}`} style={{ padding: "10px", width: "100%" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {["c", "d"].map((option) => (
                <div key={option} style={{ flex: "1" }}>
                  <input type="text" value={updatedQuestion.options[option]} onChange={(e) =>setUpdatedQuestion((prev) => ({ ...prev, options: { ...prev.options, [option]: e.target.value }, })) } placeholder={`Option ${option.toUpperCase()}`} style={{ padding: "10px", width: "100%" }}/>
                </div>
              ))}
            </div>
            {/* Correct Answer */}
            <input type="text" value={updatedQuestion.correctAnswer} onChange={(e) => setUpdatedQuestion((prev) => ({ ...prev, correctAnswer: e.target.value, })) } placeholder="Correct Answer" style={{ padding: "10px", width: "100%", marginBottom: "10px" }} />
            {/* Answer Description */}
            <textarea value={updatedQuestion.description} onChange={(e) => setUpdatedQuestion((prev) => ({  ...prev,  description: e.target.value,  })) } placeholder="Answer Description" style={{ padding: "10px", width: "100%", marginBottom: "10px" }} />
            <button onClick={handleUpdateQuestion} style={{ backgroundColor: "green", color: "white", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", }}>
              <FontAwesomeIcon icon={faEdit} style={{ marginRight: "5px" }} /> Update Question
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, }}>
    <div style={{backgroundColor: "#fff",padding: "20px",borderRadius: "8px",width: "400px",textAlign: "center",position: "relative",}} >
      <span onClick={onClose}style={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer", fontSize: "20px", }} >
      <FontAwesomeIcon icon={faTimes} />
      </span>
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);

export default Chapter;