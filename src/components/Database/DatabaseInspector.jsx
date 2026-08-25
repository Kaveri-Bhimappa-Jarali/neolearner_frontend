import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Database, Users, Globe, BookOpen, Layers, FileText, 
  HelpCircle, CheckSquare, Award, TrendingUp, Sparkles, RefreshCw, Search
} from 'lucide-react';

const ICON_MAP = {
  Users, Globe, BookOpen, Layers, FileText, HelpCircle, CheckSquare, Award, TrendingUp, Sparkles
};

const DatabaseInspector = () => {
  const [overview, setOverview] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityData, setEntityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/database/overview');
      setOverview(res.data.entities);
      if (res.data.entities.length > 0 && !selectedEntity) {
        selectEntity(res.data.entities[0].key);
      }
    } catch (err) {
      console.error('Error fetching database overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectEntity = async (entityKey) => {
    setSelectedEntity(entityKey);
    setDataLoading(true);
    try {
      const res = await api.get(`/database/entities/${entityKey}`);
      setEntityData(res.data);
    } catch (err) {
      console.error('Error fetching entity data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filteredData = entityData?.data?.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <RefreshCw className="spin" size={48} color="var(--primary-color)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading Database Schema & Entities...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">
              <Database color="var(--primary-color)" size={36} />
              Database Architecture & Entity Inspector
            </h1>
            <p className="page-subtitle">
              Live inspection of all 11 core database models, schemas, relationships, and records.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchOverview} style={{ gap: '6px' }}>
            <RefreshCw size={16} /> Refresh Schema
          </button>
        </div>
      </div>

      {/* 11 Entity Cards Stats */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
        System Tables (11 Entities)
      </h3>
      <div className="inspector-stats">
        {overview.map((ent) => {
          const IconComp = ICON_MAP[ent.icon] || Database;
          const isSelected = selectedEntity === ent.key;
          return (
            <div 
              key={ent.key} 
              className={`stat-card ${isSelected ? 'selected' : ''}`}
              onClick={() => selectEntity(ent.key)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IconComp color={isSelected ? 'var(--primary-color)' : 'var(--text-muted)'} size={24} />
                <span className="stat-count">{ent.count}</span>
              </div>
              <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>{ent.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{ent.description}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Entity Data Table */}
      {entityData && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Table: <span style={{ color: 'var(--secondary-color)' }}>{entityData.name}</span>
                <span className="badge badge-blue">{entityData.total_records} Records</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {entityData.description}
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} size={16} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search table rows..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {dataLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Table Rows...</div>
          ) : filteredData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No records found in table standard query.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {entityData.columns.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={row.id || idx}>
                      {entityData.columns.map(col => (
                        <td key={col} style={{ fontFamily: col === 'id' || col.endsWith('_id') ? 'monospace' : 'inherit', fontSize: '0.85rem' }}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span style={{ color: 'var(--text-muted)', italic: 'true' }}>NULL</span>}
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
    </div>
  );
};

export default DatabaseInspector;
