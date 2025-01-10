import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  // eslint-disable-next-line
  const [courseDetails, setCourseDetails] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalCourseName, setModalCourseName] = useState('');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/courses');
      setCourses(data);
    } catch (error) {
      toast.error('Error fetching courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/api/subjects');
      setSubjectOptions(data);
    } catch (error) {
      toast.error('Error fetching subjects.');
    }
  };

  const handleCourseSelect = async (courseId) => {
    setSelectedCourse(courseId);
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/courses/${courseId}`);
      setCourseDetails(data);
    } catch (error) {
      toast.error('Failed to fetch course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectToCourse = async () => {
    if (!selectedCourse || !selectedSubject) {
      toast.warn('Please select both a course and a subject.');
      return;
    }

    const courseToUpdate = courses.find((course) => course._id === selectedCourse);
    const isSubjectAlreadyAdded =
      courseToUpdate && courseToUpdate.subjects.some((subject) => subject._id === selectedSubject);

    if (isSubjectAlreadyAdded) {
      toast.info('This subject is already added to the course.');
      return;
    }

    const updatedCourses = courses.map((course) => {
      if (course._id === selectedCourse) {
        const subjectToAdd = subjectOptions.find((subject) => subject._id === selectedSubject);
        return { ...course, subjects: [...course.subjects, subjectToAdd] };
      }
      return course;
    });

    setCourses(updatedCourses);

    try {
      await axios.put(`/api/courses/${selectedCourse}/add-subject`, { subjectId: selectedSubject });
      handleCourseSelect(selectedCourse);
      closeAddSubjectModal();
      toast.success('Subject added successfully.');
    } catch (error) {
      toast.error('Error adding subject to course.');
      fetchCourses();
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseName) {
      toast.warn('Please enter a course name.');
      return;
    }

    try {
      const newCourse = { name: newCourseName };
      await axios.post('/api/courses', newCourse);
      fetchCourses();
      closeAddCourseModal();
      toast.success('Course added successfully.');
    } catch (error) {
      toast.error('Error adding new course.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success('Course deleted successfully.');
    } catch (error) {
      toast.error('Error deleting the course.');
    }
  };

  const handleDeleteSubject = async (courseId, subjectId) => {
    try {
      await axios.put(`/api/courses/${courseId}/remove-subject`, { subjectId });
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, subjects: course.subjects.filter((subject) => subject._id !== subjectId) }
            : course
        )
      );
      handleCourseSelect(courseId);
      toast.success('Subject deleted successfully.');
    } catch (error) {
      toast.error('Error deleting subject from course.');
    }
  };

  const openAddSubjectModal = (courseId, courseName) => {
    setSelectedCourse(courseId);
    setModalCourseName(courseName);
    setIsAddSubjectModalOpen(true);
  };

  const closeAddSubjectModal = () => {
    setIsAddSubjectModalOpen(false);
    setSelectedSubject('');
  };

  const openAddCourseModal = () => {
    setIsAddCourseModalOpen(true);
  };

  const closeAddCourseModal = () => {
    setIsAddCourseModalOpen(false);
    setNewCourseName('');
  };

  const toggleCourseExpand = (courseId) => setExpandedCourse(expandedCourse === courseId ? null : courseId);
  const toggleSubjectExpand = (subjectId) => setExpandedSubject(expandedSubject === subjectId ? null : subjectId);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <ToastContainer />
      <h2 style={{ fontWeight: 'bold', color: '#333',textAlign:'center' }}>Course Management</h2>
      {loading && <p>Loading...</p>}
      <button style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', transition: 'background-color 0.3s ease' }} onClick={openAddCourseModal}>
        <FontAwesomeIcon icon={faPlus} style={{fontSize: '18px',marginRight: '8px'}}/>Add Course
      </button>
      <div>
        {courses.map((course) => (
          <div key={course._id} style={{ marginBottom: '15px', padding: '10px', borderRadius: '8px', background: '#f9f9f9', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleCourseExpand(course._id)}>
              <h3>{course.name}</h3>
              <div>
                {/* <FontAwesomeIcon icon={faTrash} style={{ color: '#e74c3c', cursor: 'pointer', fontSize: '20px'}} onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id); }} /> */}
                {course.name !== 'CFA LEVEL - 1' && (
                  <FontAwesomeIcon icon={faTrash} style={{ color: '#e74c3c', cursor: 'pointer', fontSize: '20px' }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id); }}
                  />
                )}
                <FontAwesomeIcon icon={faPlus} style={{ color: '#4CAF50', cursor: 'pointer', fontSize: '20px',marginLeft: '10px',marginRight: '10px'}} onClick={(e) => { e.stopPropagation(); openAddSubjectModal(course._id, course.name); }}/>
              </div>
            </div>
            {expandedCourse === course._id && (
              <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {course.subjects.map((subject) => (
                  <div key={subject._id} style={{ padding: '8px', backgroundColor: '#e9ecef', borderRadius: '5px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleSubjectExpand(subject._id)}>
                      <h4>{subject.name}</h4>
                      <FontAwesomeIcon icon={faTrash} style={{ color: '#e74c3c', cursor: 'pointer', fontSize: '15px'}}  onClick={(e) => { e.stopPropagation(); handleDeleteSubject(course._id, subject._id); }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {isAddCourseModalOpen && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3>Add New Course</h3>
            <input type="text" placeholder="Enter Course Name" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '15px' }} />
            <div>
              <button style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }} onClick={handleAddCourse}>Add Course</button>
              <button style={{ padding: '10px 15px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={closeAddCourseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isAddSubjectModalOpen && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3>Select Subject for "{modalCourseName}"</h3>
            <select onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', marginBottom: '15px' }}>
              <option value="">Select Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <div>
              <button style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }} onClick={handleAddSubjectToCourse}><FontAwesomeIcon icon={faPlus} style={{fontSize: '18px',marginRight: '8px'}}/>Add Subject</button>
              <button style={{ padding: '10px 15px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={closeAddSubjectModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;