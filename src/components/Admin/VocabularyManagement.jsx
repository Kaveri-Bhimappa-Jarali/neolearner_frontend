import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { RefreshCw, Search, Plus, Edit, Trash2, X } from 'lucide-react';

const VocabularyManagement = () => {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    language_code: 'kn',
    pos: 'noun',
    cefr_level: 'A1',
    example_sentence: ''
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/vocabulary?q=${q}`);
      setVocabulary(res.data);
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVocabulary(searchTerm);
  };

  const openCreateModal = () => {
    setEditingVocab(null);
    setFormData({
      word: '',
      translation: '',
      language_code: 'kn',
      pos: 'noun',
      cefr_level: 'A1',
      example_sentence: ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVocab(v);
    setFormData({
      word: v.word,
      translation: v.translation,
      language_code: v.language_code || 'kn',
      pos: v.pos || 'noun',
      cefr_level: v.cefr_level || 'A1',
      example_sentence: v.example_sentence || ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (vocabId, word) => {
    if (!window.confirm(`Are you sure you want to delete vocabulary word '${word}'?`)) return;
    try {
      await api.delete(`/admin/vocabulary/${vocabId}`);
      fetchVocabulary(searchTerm);
    } catch (err) {
      alert(`Failed to delete vocabulary word: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (editingVocab) {
        await api.put(`/admin/vocabulary/${editingVocab.id}`, formData);
      } else {
        await api.post('/admin/vocabulary', formData);
      }
      setIsModalOpen(false);
      fetchVocabulary(searchTerm);
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      {/* Search & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={20} color="var(--primary-color)" /> Vocabulary & Spaced Repetition (SRS) Library
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Curate target vocabulary terms, translations, parts of speech, and example context sentences.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add Vocabulary Word
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search vocabulary by word or translation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <button type="submit" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold' }}>
          Filter Terms
        </button>
      </form>

      {/* Vocabulary Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading vocabulary bank...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Target Word</th>
                <th style={{ padding: '0.75rem' }}>Translation</th>
                <th style={{ padding: '0.75rem' }}>POS</th>
                <th style={{ padding: '0.75rem' }}>CEFR Level</th>
                <th style={{ padding: '0.75rem' }}>Example Sentence</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vocabulary.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: 'var(--primary-color)', fontSize: '1.05rem' }}>{v.word}</td>
                  <td style={{ padding: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{v.translation}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-secondary">{v.pos}</span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-purple">{v.cefr_level}</span>
                  </td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '300px' }}>
                    {v.example_sentence || '—'}
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn btn-secondary" onClick={() => openEditModal(v)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <Edit size={14} color="#3b82f6" />
                      </button>
                      <button className="btn btn-secondary" onClick={() => handleDelete(v.id, v.word)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {editingVocab ? 'Edit Vocabulary Word' : 'Create Vocabulary Word'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Target Word *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Translation *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.translation}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Language Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.language_code}
                    onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Part of Speech</label>
                  <select
                    className="form-input"
                    value={formData.pos}
                    onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="phrase">Phrase</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CEFR Level</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cefr_level}
                    onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Example Sentence</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.example_sentence}
                  onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingVocab ? 'Update Word' : 'Create Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VocabularyManagement;
