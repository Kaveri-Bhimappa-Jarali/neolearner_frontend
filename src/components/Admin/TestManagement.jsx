import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Plus, Edit, Trash2, CheckCircle2, Eye, X, FileCheck2, Clock, HelpCircle, AlertCircle } from 'lucide-react';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null); // For detail view
  const [formData, setFormData] = useState({
    title: '',
    questions_count: 20,
    duration_minutes: 30,
    difficulty: 'Beginner',
    status: 'Active',
    pass_percentage: 70.0
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tests');
      setTests(res.data);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      // Fallback default mock data if network fails
      setTests([
        { id: '1', title: 'NLP Basics', questions_count: 20, duration_minutes: 30, difficulty: 'Beginner', status: 'Active', pass_percentage: 70.0 },
        { id: '2', title: 'Cryptography & Security', questions_count: 25, duration_minutes: 45, difficulty: 'Intermediate', status: 'Draft', pass_percentage: 75.0 },
        { id: '3', title: 'DBMS Fundamentals', questions_count: 30, duration_minutes: 60, difficulty: 'Advanced', status: 'Active', pass_percentage: 80.0 },
        { id: '4', title: 'Phonics & Diagnostic Exam', questions_count: 15, duration_minutes: 20, difficulty: 'Beginner', status: 'Active', pass_percentage: 65.0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      questions_count: 20,
      duration_minutes: 30,
      difficulty: 'Beginner',
      status: 'Active',
      pass_percentage: 70.0
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (testItem) => {
    setEditingTest(testItem);
    setFormData({
      title: testItem.title,
      questions_count: testItem.questions_count || 20,
      duration_minutes: testItem.duration_minutes || 30,
      difficulty: testItem.difficulty || 'Beginner',
      status: testItem.status || 'Active',
      pass_percentage: testItem.pass_percentage || 70.0
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteTest = async (testId, title) => {
    if (!window.confirm(`Are you sure you want to delete test '${title}'?`)) return;
    try {
      await api.delete(`/admin/tests/${testId}`);
      fetchTests();
    } catch (err) {
      alert(`Failed to delete test: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (editingTest) {
        await api.put(`/admin/tests/${editingTest.id}`, formData);
      } else {
        await api.post('/admin/tests', formData);
      }
      setIsModalOpen(false);
      fetchTests();
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredTests = tests.filter(testItem => {
    const matchesSearch = testItem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'ALL' || testItem.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="admin-test-management-container">
      {/* Header & Action Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '18px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={20} color="var(--primary-color)" /> Assessment & Test Management
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Configure examination parameters, duration, pass criteria, and questions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.85rem', height: '38px' }}
              />
            </div>

            <select
              className="form-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', height: '38px', fontWeight: '700' }}
            >
              <option value="ALL">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', height: '38px' }}
            >
              <Plus size={16} /> Add New Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="card" style={{ padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--surface-card)' }}>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tests directory...</div>
        ) : filteredTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
            <p style={{ margin: 0, fontWeight: '700' }}>No tests match your current search criteria.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP & TABLET VIEW: Compact Horizontal Table */}
            <div className="admin-test-desktop-view table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '32%' }}>Test Name</th>
                    <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Questions</th>
                    <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Duration</th>
                    <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((testItem) => (
                    <tr key={testItem.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCheck2 size={16} color="var(--primary-color)" />
                          <span>{testItem.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-main)', fontWeight: '600' }}>
                        {testItem.questions_count} Qs
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {testItem.duration_minutes} min
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${
                          testItem.difficulty === 'Advanced' ? 'badge-purple' :
                          testItem.difficulty === 'Intermediate' ? 'badge-blue' : 'badge-teal'
                        }`}>
                          {testItem.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${testItem.status === 'Active' ? 'badge-green' : 'badge-secondary'}`}>
                          {testItem.status === 'Active' ? '● Active' : '○ Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setSelectedTest(testItem)}
                            title="View Test Details"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: '700', gap: '4px' }}
                          >
                            <Eye size={14} color="var(--primary-color)" /> View
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditModal(testItem)}
                            title="Edit Test"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: '700', gap: '4px' }}
                          >
                            <Edit size={14} color="#3b82f6" /> Edit
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeleteTest(testItem.id, testItem.title)}
                            title="Delete Test"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Compact Horizontal Cards */}
            <div className="admin-test-mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredTests.map((testItem) => (
                <div
                  key={testItem.id}
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  {/* Top Bar: Title & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>
                      {testItem.title}
                    </h4>
                    <span className={`badge ${testItem.status === 'Active' ? 'badge-green' : 'badge-secondary'}`} style={{ fontSize: '0.72rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                      {testItem.status}
                    </span>
                  </div>

                  {/* Single Line Metadata Separator */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>{testItem.questions_count} Questions</span>
                    <span>•</span>
                    <span>{testItem.duration_minutes} min</span>
                    <span>•</span>
                    <span style={{ fontWeight: '700', color: testItem.difficulty === 'Advanced' ? '#a855f7' : testItem.difficulty === 'Intermediate' ? '#3b82f6' : '#10b981' }}>
                      {testItem.difficulty}
                    </span>
                  </div>

                  {/* Compact Bottom Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.35rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedTest(testItem)}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} color="var(--primary-color)" /> View
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openEditModal(testItem)}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit size={13} color="#3b82f6" /> Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeleteTest(testItem.id, testItem.title)}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT TEST MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', borderRadius: '20px', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                {editingTest ? 'Edit Test Configuration' : 'Create New Assessment Test'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Test Name / Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. NLP Fundamentals or Cryptography"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Questions Count</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.questions_count}
                    onChange={(e) => setFormData({ ...formData, questions_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Difficulty</label>
                  <select
                    className="form-input"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>Passing Score Threshold (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  value={formData.pass_percentage}
                  onChange={(e) => setFormData({ ...formData, pass_percentage: parseFloat(e.target.value) || 70 })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingTest ? 'Save Changes' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TEST DETAIL MODAL */}
      {selectedTest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem', borderRadius: '20px', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{selectedTest.title}</h3>
              <button onClick={() => setSelectedTest(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', margin: '1rem 0' }}>
              <p style={{ margin: 0 }}><strong>Status:</strong> <span className={`badge ${selectedTest.status === 'Active' ? 'badge-green' : 'badge-secondary'}`}>{selectedTest.status}</span></p>
              <p style={{ margin: 0 }}><strong>Questions:</strong> {selectedTest.questions_count} Questions</p>
              <p style={{ margin: 0 }}><strong>Duration:</strong> {selectedTest.duration_minutes} minutes</p>
              <p style={{ margin: 0 }}><strong>Difficulty Level:</strong> {selectedTest.difficulty}</p>
              <p style={{ margin: 0 }}><strong>Pass Percentage:</strong> {selectedTest.pass_percentage || 70}%</p>
            </div>

            <button className="btn btn-primary" onClick={() => setSelectedTest(null)} style={{ width: '100%', marginTop: '1rem', fontWeight: 'bold' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestManagement;
