import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Plus, Layers, FileText, Edit, Trash2, ChevronDown, ChevronRight, X, CheckCircle2 } from 'lucide-react';

const ContentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active expanded course & topic states
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Modal states for Course, Topic, Lesson
  const [modalType, setModalType] = useState(null); // 'course' | 'topic' | 'lesson'
  const [editingItem, setEditingItem] = useState(null);
  const [parentTargetId, setParentTargetId] = useState(null); // course_id or topic_id
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchCoursesAndLanguages();
  }, []);

  const fetchCoursesAndLanguages = async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/admin/content/courses'),
        api.get('/languages')
      ]);
      setCourses(cRes.data);
      setLanguages(lRes.data);
      if (cRes.data.length > 0 && !expandedCourseId) {
        setExpandedCourseId(cRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load curriculum content:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Course Handlers ---
  const openCreateCourseModal = () => {
    setModalType('course');
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      language_id: languages[0]?.id || '',
      level: 'Beginner',
      cefr_level: 'A1',
      is_published: true
    });
    setModalError(null);
  };

  const openEditCourseModal = (course) => {
    setModalType('course');
    setEditingItem(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      language_id: course.language_id || languages[0]?.id || '',
      level: course.level || 'Beginner',
      cefr_level: course.cefr_level || 'A1',
      is_published: course.is_published
    });
    setModalError(null);
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to delete course '${title}' and all its topics/lessons?`)) return;
    try {
      await api.delete(`/admin/content/courses/${courseId}`);
      fetchCoursesAndLanguages();
    } catch (err) {
      alert(`Course deletion failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  // --- Topic Handlers ---
  const openCreateTopicModal = (courseId) => {
    setModalType('topic');
    setParentTargetId(courseId);
    setEditingItem(null);
    setFormData({
      course_id: courseId,
      title: '',
      description: '',
      order: 1,
      cefr_level: 'A1'
    });
    setModalError(null);
  };

  const openEditTopicModal = (topic) => {
    setModalType('topic');
    setEditingItem(topic);
    setFormData({
      title: topic.title,
      description: topic.description || '',
      order: topic.order || 1,
      cefr_level: topic.cefr_level || 'A1'
    });
    setModalError(null);
  };

  const handleDeleteTopic = async (topicId, title) => {
    if (!window.confirm(`Are you sure you want to delete topic '${title}' and all its lessons?`)) return;
    try {
      await api.delete(`/admin/content/topics/${topicId}`);
      fetchCoursesAndLanguages();
    } catch (err) {
      alert(`Topic deletion failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  // --- Lesson Handlers ---
  const openCreateLessonModal = (topicId) => {
    setModalType('lesson');
    setParentTargetId(topicId);
    setEditingItem(null);
    setFormData({
      topic_id: topicId,
      title: '',
      content: '',
      order: 1,
      duration_minutes: 10
    });
    setModalError(null);
  };

  const openEditLessonModal = (lesson) => {
    setModalType('lesson');
    setEditingItem(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      order: lesson.order || 1,
      duration_minutes: lesson.duration_minutes || 10
    });
    setModalError(null);
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Are you sure you want to delete lesson '${title}'?`)) return;
    try {
      await api.delete(`/admin/content/lessons/${lessonId}`);
      fetchCoursesAndLanguages();
    } catch (err) {
      alert(`Lesson deletion failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  // --- Form Submission ---
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (modalType === 'course') {
        if (editingItem) {
          await api.put(`/admin/content/courses/${editingItem.id}`, formData);
        } else {
          await api.post('/admin/content/courses', formData);
        }
      } else if (modalType === 'topic') {
        if (editingItem) {
          await api.put(`/admin/content/topics/${editingItem.id}`, formData);
        } else {
          await api.post('/admin/content/topics', formData);
        }
      } else if (modalType === 'lesson') {
        if (editingItem) {
          await api.put(`/admin/content/lessons/${editingItem.id}`, formData);
        } else {
          await api.post('/admin/content/lessons', formData);
        }
      }
      setModalType(null);
      fetchCoursesAndLanguages();
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary-color)" /> Curriculum Content & Lesson Studio
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hierarchical CRUD editor for Courses, Units/Topics, and Lessons.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateCourseModal} style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add New Course
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading curriculum studio...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {courses.map((course) => {
            const isExpanded = expandedCourseId === course.id;
            return (
              <div key={course.id} style={{ border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--surface)', overflow: 'hidden' }}>
                {/* Course Bar */}
                <div 
                  style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'var(--surface-hover)' : 'transparent' }}
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isExpanded ? <ChevronDown size={20} color="var(--primary-color)" /> : <ChevronRight size={20} color="var(--text-muted)" />}
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>{course.title}</span>
                        <span className="badge badge-blue">{course.language}</span>
                        <span className={`badge ${course.is_published ? 'badge-green' : 'badge-secondary'}`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Level: <strong>{course.level}</strong> | CEFR: <strong>{course.cefr_level}</strong> | Topics: <strong>{course.topics?.length || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-secondary" onClick={() => openCreateTopicModal(course.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus size={14} /> Add Topic
                    </button>
                    <button className="btn btn-secondary" onClick={() => openEditCourseModal(course)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      <Edit size={14} color="#3b82f6" />
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleDeleteCourse(course.id, course.title)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>

                {/* Expanded Topics List */}
                {isExpanded && (
                  <div style={{ padding: '1rem 1.25rem 1.25rem 2.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--background)' }}>
                    {course.topics && course.topics.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {course.topics.map((topic) => {
                          const isTopicExpanded = expandedTopicId === topic.id;
                          return (
                            <div key={topic.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--surface)', padding: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setExpandedTopicId(isTopicExpanded ? null : topic.id)}>
                                  <Layers size={18} color="#6366f1" />
                                  <span style={{ fontWeight: '800', fontSize: '1rem' }}>Topic #{topic.order}: {topic.title}</span>
                                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{topic.cefr_level}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="btn btn-secondary" onClick={() => openCreateLessonModal(topic.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Plus size={13} /> Add Lesson
                                  </button>
                                  <button className="btn btn-secondary" onClick={() => openEditTopicModal(topic)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                    <Edit size={13} color="#3b82f6" />
                                  </button>
                                  <button className="btn btn-secondary" onClick={() => handleDeleteTopic(topic.id, topic.title)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                    <Trash2 size={13} color="#ef4444" />
                                  </button>
                                </div>
                              </div>

                              {/* Nested Lessons */}
                              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {topic.lessons && topic.lessons.length > 0 ? (
                                  topic.lessons.map((lesson) => (
                                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '8px', background: 'var(--background)', fontSize: '0.85rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={15} color="#10b981" />
                                        <span><strong>Lesson #{lesson.order}:</strong> {lesson.title}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({lesson.duration_minutes} mins)</span>
                                      </div>

                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="btn btn-secondary" onClick={() => openEditLessonModal(lesson)} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                                          <Edit size={12} color="#3b82f6" />
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => handleDeleteLesson(lesson.id, lesson.title)} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                                          <Trash2 size={12} color="#ef4444" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No lessons created yet in this topic.</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No topics created in this course yet. Click "+ Add Topic" to add one.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CURRICULUM MODAL (COURSE / TOPIC / LESSON) */}
      {modalType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, textTransform: 'capitalize' }}>
                {editingItem ? `Edit ${modalType}` : `Create New ${modalType}`}
              </h3>
              <button onClick={() => setModalType(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {modalType === 'course' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Target Language *</label>
                    <select
                      className="form-input"
                      value={formData.language_id || ''}
                      onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                    >
                      {languages.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Level</label>
                      <select
                        className="form-input"
                        value={formData.level || 'Beginner'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CEFR Level</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.cefr_level || 'A1'}
                        onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    <label htmlFor="is_published" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Publish Course directly to learners
                    </label>
                  </div>
                </>
              )}

              {modalType === 'topic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sequence Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order || 1}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CEFR Level</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.cefr_level || 'A1'}
                      onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {modalType === 'lesson' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sequence Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order || 1}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.duration_minutes || 10}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Description / Content</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.description || formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, [modalType === 'lesson' ? 'content' : 'description']: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContentManagement;

