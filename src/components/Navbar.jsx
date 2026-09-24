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
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
            color: 'var(--text-main)', display: 'none', minWidth: '44px', minHeight: '44px',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Backdrop for Mobile Drawer */}
        {mobileMenuOpen && (
          <div 
            onClick={closeMenu}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)', zIndex: 999
            }}
          />
        )}

        {/* Desktop Links & Stats (Mobile Drawer on < 1024px) */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/insights" onClick={closeMenu} className={`nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
            <Sparkles size={18} /> Insights & Showcase
          </Link>

          <Link to="/courses" onClick={closeMenu} className={`nav-item ${isActive('/courses') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
            <BookOpen size={18} /> {t('courses')}
          </Link>

          {user && (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                <LayoutDashboard size={18} /> {t('dashboard')}
              </Link>
              {user.is_admin && (
                <Link to="/admin" onClick={closeMenu} className={`nav-item ${isActive('/admin') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontWeight: 'bold', minHeight: '44px' }}>
                  <ShieldAlert size={18} /> Admin Portal
                </Link>
              )}
              {user.has_completed_placement_test && (
                <>
                  <Link to="/learning-path" onClick={closeMenu} className={`nav-item ${isActive('/learning-path') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <Sparkles size={18} /> {t('learningPath')}
                  </Link>
                  <Link to="/practice-hub" onClick={closeMenu} className={`nav-item ${isActive('/practice-hub') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <Zap size={18} /> {t('practiceHub')}
                  </Link>
                  <Link to="/conversation" onClick={closeMenu} className={`nav-item ${isActive('/conversation') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <Sparkles size={18} /> {t('aiLab')}
                  </Link>
                  <Link to="/stories" onClick={closeMenu} className={`nav-item ${isActive('/stories') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <BookOpen size={18} /> {t('stories')}
                  </Link>
                  <Link to="/friends" onClick={closeMenu} className={`nav-item ${isActive('/friends') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <Award size={18} /> {t('social')}
                  </Link>
                  <Link to="/shop" onClick={closeMenu} className={`nav-item ${isActive('/shop') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}>
                    <Gem size={18} /> {t('shop')}
                  </Link>
                </>
              )}
            </>
          )}

          {user && (
            <div className="nav-stats-bar">
              <Link to="/practice-hub" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff4b4b', fontWeight: 'bold', textDecoration: 'none', minHeight: '36px' }} title="Hearts">
                <Heart size={20} fill="#ff4b4b" />
                <span>{user.hearts}</span>
              </Link>
              <Link to="/shop" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1cb0f6', fontWeight: 'bold', textDecoration: 'none', minHeight: '36px' }} title="Gems">
                <Gem size={20} fill="#1cb0f6" />
                <span>{user.gems}</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff9600', fontWeight: 'bold', minHeight: '36px' }} title="Streak">
                <Flame size={20} fill="#ff9600" />
                <span>{user.streak}</span>
              </div>
              <Link to="/leagues" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd700', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none', minHeight: '36px' }} title="League Ladder">
                <Award size={20} />
                <span>{t(user.league_tier) || t('Gold')}</span>
              </Link>
            </div>
          )}

          {user ? (
            <div className="nav-action-buttons">
              <Link to="/profile" onClick={closeMenu} className="btn btn-secondary nav-action-btn" style={{ minHeight: '44px' }}>
                <User size={16} /> {t('profile')}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary nav-action-btn" style={{ minHeight: '44px' }}>
                <LogOut size={16} /> {t('logout')}
              </button>
            </div>
          ) : (
            <div className="nav-action-buttons">
              <Link to="/login" onClick={closeMenu} className="btn btn-secondary nav-action-btn" style={{ minHeight: '44px' }}>{t('login')}</Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary nav-action-btn" style={{ minHeight: '44px' }}>{t('getStarted')}</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
