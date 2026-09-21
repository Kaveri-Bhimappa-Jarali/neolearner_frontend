import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, LayoutDashboard, User, LogOut, Flame, Gem, Heart, 
  Award, Sparkles, Zap, Menu, X, ShieldAlert 
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Brand */}
        <Link to="/" onClick={closeMenu} className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', 
            padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <BookOpen color="#ffffff" size={22} />
          </div>
          <span>NeoLearner</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
            color: 'var(--text-main)', display: 'none'
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Links & Stats */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/insights" onClick={closeMenu} className={`nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Insights & Showcase
          </Link>

          <Link to="/courses" onClick={closeMenu} className={`nav-item ${isActive('/courses') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} /> {t('courses')}
          </Link>


          {user && (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard size={16} /> {t('dashboard')}
              </Link>
              {user.is_admin && (
                <Link to="/admin" onClick={closeMenu} className={`nav-item ${isActive('/admin') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                  <ShieldAlert size={16} /> Admin Portal
                </Link>
              )}
              {user.has_completed_placement_test && (
                <>
                  <Link to="/learning-path" onClick={closeMenu} className={`nav-item ${isActive('/learning-path') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> {t('learningPath')}
                  </Link>
                  <Link to="/practice-hub" onClick={closeMenu} className={`nav-item ${isActive('/practice-hub') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} /> {t('practiceHub')}
                  </Link>
                  <Link to="/conversation" onClick={closeMenu} className={`nav-item ${isActive('/conversation') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> {t('aiLab')}
                  </Link>
                  <Link to="/stories" onClick={closeMenu} className={`nav-item ${isActive('/stories') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} /> {t('stories')}
                  </Link>
                  <Link to="/friends" onClick={closeMenu} className={`nav-item ${isActive('/friends') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> {t('social')}
                  </Link>
                  <Link to="/shop" onClick={closeMenu} className={`nav-item ${isActive('/shop') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Gem size={16} /> {t('shop')}
                  </Link>
                </>
              )}
            </>
          )}

          {user && (
            <div className="nav-stats-bar">
              <Link to="/practice-hub" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4b4b', fontWeight: 'bold', textDecoration: 'none' }} title="Hearts">
                <Heart size={18} fill="#ff4b4b" />
                <span>{user.hearts}</span>
              </Link>
              <Link to="/shop" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1cb0f6', fontWeight: 'bold', textDecoration: 'none' }} title="Gems">
                <Gem size={18} fill="#1cb0f6" />
                <span>{user.gems}</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9600', fontWeight: 'bold' }} title="Streak">
                <Flame size={18} fill="#ff9600" />
                <span>{user.streak}</span>
              </div>
              <Link to="/leagues" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffd700', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none' }} title="League Ladder">
                <Award size={18} />
                <span>{t(user.league_tier) || t('Gold')}</span>
              </Link>
            </div>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/profile" onClick={closeMenu} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '6px' }}>
                <User size={15} /> {t('profile')}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '6px' }}>
                <LogOut size={15} /> {t('logout')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" onClick={closeMenu} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>{t('login')}</Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>{t('getStarted')}</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
