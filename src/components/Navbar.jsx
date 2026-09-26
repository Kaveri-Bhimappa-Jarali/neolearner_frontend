import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import { 
  BookOpen, LayoutDashboard, Compass, Trophy, Zap, 
  User, LogOut, ShieldAlert, Sparkles, MessageSquare, Gem, Flame, Award, Heart, Menu, X, MoreHorizontal
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Mobile Menu Toggle Button (Left Side) */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Brand Logo */}
            <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-purple) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-teal)'
              }}>
                <BookOpen color="#ffffff" size={22} />
              </div>
              <span style={{ 
                fontWeight: '800', 
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-color) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>NeoLearner</span>
            </Link>
          </div>

          {/* Desktop Links & Stats */}
          <div className="nav-links desktop-nav-links">
            {!user && (
              <Link to="/insights" className={`nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`}>
                <Sparkles size={18} /> {t('showcaseInsights') || 'Showcase'}
              </Link>
            )}

            <Link to="/courses" className={`nav-item ${isActive('/courses') ? 'active' : ''}`}>
              <BookOpen size={18} /> {t('courses')}
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={18} /> {t('dashboard')}
                </Link>
                {user.is_admin && (
                  <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>
                    <ShieldAlert size={18} /> {t('adminPortal') || 'Admin Portal'}
                  </Link>
                )}

                <Link to="/initial-exam" className={`nav-item ${isActive('/initial-exam') ? 'active' : ''}`}>
                  <Compass size={18} /> {t('initialAssessment') || 'Initial Assessment'}
                </Link>
                <Link to="/conversation" className={`nav-item ${isActive('/conversation') ? 'active' : ''}`}>
                  <MessageSquare size={18} /> {t('aiLab') || 'AI Lab'}
                </Link>
                <Link to="/learning-path" className={`nav-item ${isActive('/learning-path') ? 'active' : ''}`}>
                  <Compass size={18} /> {t('learningPath')}
                </Link>
                <Link to="/practice-hub" className={`nav-item ${isActive('/practice-hub') ? 'active' : ''}`}>
                  <Zap size={18} /> {t('practiceHub')}
                </Link>
                <Link to="/stories" className={`nav-item ${isActive('/stories') ? 'active' : ''}`}>
                  <BookOpen size={18} /> {t('stories')}
                </Link>
                <Link to="/friends" className={`nav-item ${isActive('/friends') ? 'active' : ''}`}>
                  <Trophy size={18} /> {t('social')}
                </Link>
                <Link to="/shop" className={`nav-item ${isActive('/shop') ? 'active' : ''}`}>
                  <Gem size={18} /> {t('shop')}
                </Link>
              </>
            )}

            {user && (
              <div className="nav-stats-bar">
                <Link to="/practice-hub" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: '800', textDecoration: 'none' }} title="Hearts">
                  <Heart size={18} fill="#ef4444" />
                  <span>{user.hearts}</span>
                </Link>
                <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#06b6d4', fontWeight: '800', textDecoration: 'none' }} title="Gems">
                  <Gem size={18} fill="#06b6d4" />
                  <span>{user.gems}</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: '800' }} title="Streak">
                  <Flame size={18} fill="#f59e0b" />
                  <span>{user.streak}</span>
                </div>
                <Link to="/leagues" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#eab308', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none' }} title="League Tier">
                  <Award size={18} />
                  <span>{t(user.league_tier) || 'Gold'}</span>
                </Link>
              </div>
            )}

            {user ? (
              <div className="nav-action-buttons">
                <Link to="/profile" className="btn btn-secondary nav-action-btn">
                  <User size={16} /> {t('profile')}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline nav-action-btn">
                  <LogOut size={16} /> {t('logout')}
                </button>
              </div>
            ) : (
              <div className="nav-action-buttons">
                <Link to="/login" className="btn btn-secondary nav-action-btn">{t('login')}</Link>
                <Link to="/register" className="btn btn-primary nav-action-btn">{t('getStarted')}</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen color="var(--primary-color)" size={24} />
                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>NeoLearner</span>
              </div>
              <button onClick={closeMenu} className="btn btn-outline" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="mobile-drawer-stats">
                <div className="mobile-stat-badge" style={{ color: '#ef4444' }}>
                  <Heart size={18} fill="#ef4444" /> <span>{user.hearts}</span>
                </div>
                <div className="mobile-stat-badge" style={{ color: '#06b6d4' }}>
                  <Gem size={18} fill="#06b6d4" /> <span>{user.gems}</span>
                </div>
                <div className="mobile-stat-badge" style={{ color: '#f59e0b' }}>
                  <Flame size={18} fill="#f59e0b" /> <span>{user.streak}</span>
                </div>
              </div>
            )}

            <div className="mobile-drawer-links">
              {!user && (
                <Link to="/insights" onClick={closeMenu} className={`mobile-nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`}>
                  <Sparkles size={20} /> {t('showcaseInsights') || 'Showcase'}
                </Link>
              )}
              <Link to="/courses" onClick={closeMenu} className={`mobile-nav-item ${isActive('/courses') ? 'active' : ''}`}>
                <BookOpen size={20} /> {t('courses')}
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <LayoutDashboard size={20} /> {t('dashboard')}
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" onClick={closeMenu} className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`} style={{ color: 'var(--accent-purple)' }}>
                      <ShieldAlert size={20} /> {t('adminPortal') || 'Admin Portal'}
                    </Link>
                  )}
                  <Link to="/initial-exam" onClick={closeMenu} className={`mobile-nav-item ${isActive('/initial-exam') ? 'active' : ''}`}>
                    <Compass size={20} /> {t('initialAssessment') || 'Initial Assessment'}
                  </Link>
                  <Link to="/conversation" onClick={closeMenu} className={`mobile-nav-item ${isActive('/conversation') ? 'active' : ''}`}>
                    <MessageSquare size={20} /> {t('aiLab') || 'AI Lab'}
                  </Link>
                  <Link to="/learning-path" onClick={closeMenu} className={`mobile-nav-item ${isActive('/learning-path') ? 'active' : ''}`}>
                    <Compass size={20} /> {t('learningPath')}
                  </Link>
                  <Link to="/practice-hub" onClick={closeMenu} className={`mobile-nav-item ${isActive('/practice-hub') ? 'active' : ''}`}>
                    <Zap size={20} /> {t('practiceHub')}
                  </Link>
                  <Link to="/stories" onClick={closeMenu} className={`mobile-nav-item ${isActive('/stories') ? 'active' : ''}`}>
                    <BookOpen size={20} /> {t('stories')}
                  </Link>
                  <Link to="/friends" onClick={closeMenu} className={`mobile-nav-item ${isActive('/friends') ? 'active' : ''}`}>
                    <Trophy size={20} /> {t('social')}
                  </Link>
                  <Link to="/shop" onClick={closeMenu} className={`mobile-nav-item ${isActive('/shop') ? 'active' : ''}`}>
                    <Gem size={20} /> {t('shop')}
                  </Link>
                  <Link to="/profile" onClick={closeMenu} className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}>
                    <User size={20} /> {t('profile')}
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-drawer-footer">
              {user ? (
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  <LogOut size={18} /> {t('logout')}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/login" onClick={closeMenu} className="btn btn-secondary" style={{ justifyContent: 'center' }}>{t('login')}</Link>
                  <Link to="/register" onClick={closeMenu} className="btn btn-primary" style={{ justifyContent: 'center' }}>{t('getStarted')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (for Logged-in Users) */}
      {user && (
        <div className="mobile-bottom-nav">
          <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>{t('dashboard')}</span>
          </Link>
          <Link to="/learning-path" className={`bottom-nav-item ${isActive('/learning-path') || isActive('/courses') ? 'active' : ''}`}>
            <Compass size={20} />
            <span>{t('learningPath')}</span>
          </Link>
          <Link to="/conversation" className={`bottom-nav-item ${isActive('/conversation') ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>{t('aiLab')}</span>
          </Link>
          <Link to="/practice-hub" className={`bottom-nav-item ${isActive('/practice-hub') ? 'active' : ''}`}>
            <Zap size={20} />
            <span>{t('practiceHub')}</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(true)} className="bottom-nav-item">
            <MoreHorizontal size={20} />
            <span>{t('more') || 'More'}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
