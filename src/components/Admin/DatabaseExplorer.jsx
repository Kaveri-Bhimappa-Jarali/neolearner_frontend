import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Database, Table, Search, RefreshCw, Layers, ExternalLink, 
  Key, Link as LinkIcon, CheckCircle, FileText, Activity, 
  ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Hash, Plus, Edit, Trash2, X
} from 'lucide-react';

const DatabaseExplorer = () => {
  const [overview, setOverview] = useState(null);
  const [schema, setSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState('learners');
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'schema' | 'architecture' | 'api'
  const pageSize = 15;

  // Modal & CRUD states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOverviewAndSchema = async () => {
    setLoading(true);
    try {
      const [ovRes, scRes] = await Promise.all([
        api.get('/db/overview'),
        api.get('/db/schema')
      ]);
      setOverview(ovRes.data);
      setSchema(scRes.data);
    } catch (err) {
      console.error('Failed to load DB schema overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tblName, pg = 0, search = '') => {
    setTableLoading(true);
    try {
      const params = {
        limit: pageSize,
        offset: pg * pageSize
      };
      if (search) params.search = search;
      const res = await api.get(`/db/tables/${tblName}`, { params });
      setTableData(res.data);
    } catch (err) {
      console.error(`Failed to load data for table ${tblName}:`, err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewAndSchema();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, page, searchTerm);
    }
  }, [selectedTable, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTableData(selectedTable, 0, searchTerm);
  };

  const handleTableChange = (tbl) => {
    setSelectedTable(tbl);
    setPage(0);
    setSearchTerm('');
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData({});
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingRecord(row);
    setFormData({ ...row });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (recId) => {
    if (!window.confirm(`Are you sure you want to delete record ${recId} from table '${selectedTable}'?`)) return;
    try {
      await api.delete(`/db/tables/${selectedTable}/${recId}`);
      showToast(`Successfully deleted record from ${selectedTable}`);
      fetchTableData(selectedTable, page, searchTerm);
      fetchOverviewAndSchema();
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    setModalError(null);
    try {
      if (editingRecord) {
        await api.put(`/db/tables/${selectedTable}/${editingRecord.id}`, formData);
        showToast(`Successfully updated record in ${selectedTable}`);
      } else {
        await api.post(`/db/tables/${selectedTable}`, formData);
        showToast(`Successfully created record in ${selectedTable}`);
      }
      setIsModalOpen(false);
      fetchTableData(selectedTable, page, searchTerm);
      fetchOverviewAndSchema();
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setModalSaving(false);
    }
  };

  const totalPages = tableData ? Math.ceil(tableData.total_count / pageSize) : 0;
  const currentSchemaColumns = schema && schema[selectedTable] ? schema[selectedTable].columns : [];


  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <span style={{ 
                background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', 
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                display: 'inline-flex', alignItems: 'center', gap: '5px' 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                LIVE SQLITE DATABASE
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>SQLAlchemy ORM + SQLite</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
              Database Schema & Live Data Explorer
            </h1>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem', maxWidth: '680px' }}>
              Demonstrate live database tables, schema relationships, foreign keys, row records, and verify real-time data persistence.
            </p>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { fetchOverviewAndSchema(); fetchTableData(selectedTable, page, searchTerm); }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: '600', fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={15} /> Refresh Live Data
            </button>
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer"
              style={{
                background: '#10b981', color: '#ffffff', textDecoration: 'none',
                padding: '0.6rem 1.1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <ExternalLink size={15} /> FastAPI Swagger Docs
            </a>
          </div>
        </div>

        {/* Database Metric Badges */}
        {overview && (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', 
            marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem' 
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tables</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#60a5fa', marginTop: '4px' }}>{overview.total_tables}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total DB Records</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{overview.total_records}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database File Size</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>{overview.database_size_formatted}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Engine</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f43f5e', marginTop: '8px' }}>SQLite 3 / SQLAlchemy</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-bar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'data', label: 'Live Data Tables', icon: Table },
          { id: 'schema', label: 'Schema & Column Inspector', icon: Layers },
          { id: 'architecture', label: 'Visual ER Architecture', icon: Activity },
          { id: 'api', label: 'Swagger & Endpoints', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.65rem 1.25rem', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '0.9rem',
                background: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: LIVE DATA BROWSER */}
      {activeTab === 'data' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Table List Sidebar */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1rem', overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '6px' }}>
              Database Tables ({overview?.tables?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {overview?.tables?.map(t => (
                <button
                  key={t.name}
                  onClick={() => handleTableChange(t.name)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.8rem', borderRadius: '8px', border: 'none',
                    background: selectedTable === t.name ? 'var(--surface-hover)' : 'transparent',
                    color: selectedTable === t.name ? 'var(--primary-color)' : 'var(--text-main)',
                    fontWeight: selectedTable === t.name ? '700' : '500',
                    cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Table size={14} color={selectedTable === t.name ? 'var(--primary-color)' : 'var(--text-muted)'} />
                    {t.name}
                  </span>
                  <span style={{
                    background: selectedTable === t.name ? 'var(--primary-color)' : 'var(--border-color)',
                    color: selectedTable === t.name ? '#ffffff' : 'var(--text-muted)',
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700'
                  }}>
                    {t.row_count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Data View */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-color)',
            borderRadius: '14px', padding: '1.5rem', overflow: 'hidden'
          }}>
            {/* Table Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={20} color="var(--primary-color)" /> Table: <code style={{ color: 'var(--primary-color)', fontSize: '1.15rem' }}>{selectedTable}</code>
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Showing {tableData?.rows?.length || 0} of {tableData?.total_count || 0} total records
                </span>
              </div>

              {/* Search & Actions Bar */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={openCreateModal}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                >
                  <Plus size={16} /> Insert Row
                </button>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder={`Search ${selectedTable}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '8px',
                        border: '1px solid var(--border-color)', background: 'var(--background)',
                        color: 'var(--text-main)', fontSize: '0.85rem', width: '220px'
                      }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Filter
                  </button>
                </form>
              </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div style={{ background: '#10b981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                ✓ {toastMessage}
              </div>
            )}

            {/* Table Content */}
            {tableLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                <p>Loading table records...</p>
              </div>
            ) : tableData && tableData.rows.length > 0 ? (
              <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        Actions
                      </th>
                      {tableData.columns.map(col => (
                        <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid var(--border-color)', 
                          background: idx % 2 === 0 ? 'var(--background)' : 'var(--surface)' 
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => openEditModal(row)}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              title="Edit Record"
                            >
                              <Edit size={13} color="#3b82f6" />
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleDeleteRecord(row.id)}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              title="Delete Record"
                            >
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                        {tableData.columns.map(col => {
                          const val = row[col];
                          return (
                            <td key={col} style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {val === null || val === undefined ? (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                              ) : typeof val === 'boolean' ? (
                                <span style={{ 
                                  padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700',
                                  background: val ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: val ? '#10b981' : '#ef4444' 
                                }}>
                                  {val ? 'TRUE' : 'FALSE'}
                                </span>
                              ) : col === 'id' || col.endsWith('_id') ? (
                                <span style={{ fontFamily: 'monospace', color: '#6366f1', fontSize: '0.8rem' }} title={String(val)}>
                                  {String(val).substring(0, 8)}...
                                </span>
                              ) : (
                                <span>{String(val)}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (

              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--background)', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>No records found in table <code>{selectedTable}</code></p>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>Try clearing your search filter or adding records through the app.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', opacity: page === 0 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA & COLUMN INSPECTOR */}
      {activeTab === 'schema' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {schema && Object.entries(schema).map(([tblName, tblMeta]) => (
            <div 
              key={tblName}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border-color)',
                borderRadius: '14px', padding: '1.25rem', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={18} color="var(--primary-color)" />
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{tblName}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', padding: '2px 8px', borderRadius: '10px' }}>
                  {tblMeta.columns.length} columns
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tblMeta.columns.map(c => (
                  <div 
                    key={c.name}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'var(--background)', padding: '0.5rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.primary_key ? (
                        <Key size={13} color="#f59e0b" title="Primary Key" />
                      ) : c.foreign_key ? (
                        <LinkIcon size={13} color="#6366f1" title="Foreign Key" />
                      ) : (
                        <Hash size={13} color="var(--text-muted)" />
                      )}
                      <span style={{ fontWeight: '700', color: c.primary_key ? '#f59e0b' : 'var(--text-main)' }}>
                        {c.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                        {c.type}
                      </span>
                      {c.foreign_key && (
                        <span style={{ fontSize: '0.7rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                          → {c.foreign_key.target_table}.{c.foreign_key.target_column}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VISUAL ER ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-color)',
          borderRadius: '16px', padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="var(--primary-color)" /> Entity-Relationship (ER) Relational Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Interactive representation of relational mappings, foreign key references, and cascade behaviors across the database engine.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Core Domain: Users & Auth */}
            <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <ShieldCheck size={18} /> User & Gamification Engine
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>learners</strong>: Central user entity storing credentials, preferred/target language foreign keys, streaks, hearts (1-5), gems, XP, and daily goals.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: '8px', marginTop: '10px' }}>
                1:N relationships to <code>learning_progress</code>, <code>assessment_results</code>, <code>vocabulary_srs</code>, <code>review_items</code>.
              </div>
            </div>

            {/* Core Domain: Courses & Curriculum */}
            <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Layers size={18} /> Curriculum & Lesson Hierarchy
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>languages → courses → topics → lessons</strong>
                <br />
                Hierarchical course architecture supporting multiple regional and global languages with customized phonics lessons.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 10px', borderRadius: '8px', marginTop: '10px' }}>
                Cascade deletes configured for clean topic/lesson maintenance.
              </div>
            </div>

            {/* Core Domain: Quizzes & Assessment */}
            <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <CheckCircle size={18} /> Interactive Quizzes & Evaluation
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>assessments → questions → answers</strong>
                <br />
                Multi-modal assessment engine supporting 7 exercise types (MCQ, Word Order, Match Pairs, Listening, Speaking, Fill in Blank).
              </p>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '8px', marginTop: '10px' }}>
                Calculates pass percentage thresholds and logs to <code>assessment_results</code>.
              </div>
            </div>

            {/* Core Domain: SRS & Reviews */}
            <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <RefreshCw size={18} /> Spaced Repetition (SRS SM-2)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>vocabulary → vocabulary_srs & review_items</strong>
                <br />
                Tracks intervals, ease factor, repetitions, next review dates, and mistake reviews to automatically recharge learner hearts.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '6px 10px', borderRadius: '8px', marginTop: '10px' }}>
                Server-side SuperMemo-2 mathematical algorithm execution.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: SWAGGER & API ENDPOINTS */}
      {activeTab === 'api' && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-color)',
          borderRadius: '16px', padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            FastAPI Backend Endpoints & Interactive Documentation
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            You can interact with all database tables and REST controllers directly using the built-in OpenAPI interfaces:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer"
              style={{
                textDecoration: 'none', background: 'var(--background)', padding: '1.5rem',
                borderRadius: '12px', border: '1px solid var(--border-color)', display: 'block'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981' }}>Swagger UI</span>
                <ExternalLink size={18} color="#10b981" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Interactive OpenAPI exploration console allowing live parameter testing, JWT token authorization, and real-time query execution.
              </p>
              <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>Open http://localhost:8000/docs →</span>
            </a>

            <a 
              href="http://localhost:8000/redoc" 
              target="_blank" 
              rel="noreferrer"
              style={{
                textDecoration: 'none', background: 'var(--background)', padding: '1.5rem',
                borderRadius: '12px', border: '1px solid var(--border-color)', display: 'block'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#3b82f6' }}>ReDoc Documentation</span>
                <ExternalLink size={18} color="#3b82f6" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Clean, organized three-panel API reference with request/response schemas, Pydantic data models, and status codes.
              </p>
              <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '0.85rem' }}>Open http://localhost:8000/redoc →</span>
            </a>
          </div>
        </div>
      )}

      {/* DYNAMIC SCHEMA-DRIVEN CRUD MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table size={20} color="var(--primary-color)" /> {editingRecord ? 'Edit Record' : 'Insert New Record'} — <code>{selectedTable}</code>
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {currentSchemaColumns.filter(c => c.name !== 'id').map(col => {
                  const val = formData[col.name] !== undefined ? formData[col.name] : '';
                  const colType = col.type.toUpperCase();
                  const isBool = colType.includes('BOOL');

                  return (
                    <div key={col.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        {col.name} {col.nullable ? '' : '*'} <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>({col.type})</span>
                      </label>

                      {isBool ? (
                        <select
                          className="form-input"
                          value={val === true || val === 'true' ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value === 'true' })}
                        >
                          <option value="false">FALSE</option>
                          <option value="true">TRUE</option>
                        </select>
                      ) : col.name === 'password' ? (
                        <input
                          type="password"
                          className="form-input"
                          placeholder="New Password"
                          value={val}
                          onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                        />
                      ) : colType.includes('TEXT') ? (
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder={`Enter ${col.name}...`}
                          value={val}
                          onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                        />
                      ) : (
                        <input
                          type={colType.includes('INT') || colType.includes('FLOAT') ? 'number' : 'text'}
                          step={colType.includes('FLOAT') ? 'any' : '1'}
                          className="form-input"
                          placeholder={`Enter ${col.name}...`}
                          value={val}
                          onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalSaving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {modalSaving ? 'Saving...' : editingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatabaseExplorer;

