import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import { 
  BookOpen, LayoutDashboard, Compass, Trophy, Zap, 
  User, LogOut, ShieldAlert, Sparkles, MessageSquare, Gem, Flame, Award, Heart, Menu, X, MoreHorizontal, Globe, Crown, ChevronDown
} from 'lucide-react';

const INTERFACE_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' }
];

const Navbar = () => {
  const { user, logout, updateInterfaceLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, langCode } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const handleLanguageChange = (e) => {
    const newCode = e.target.value;
    if (updateInterfaceLanguage) {
      updateInterfaceLanguage(newCode);
    } else {
      localStorage.setItem('preferred_language_code', newCode);
      window.dispatchEvent(new Event('language-change'));
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  return (
    <>
      {/* Top Metallic Gold Accent Line */}
      <div style={{
        height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #4c1d95 0%, #fbbf24 35%, #d97706 65%, #6d28d9 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 101
      }} />

      <nav className="navbar" style={{
        backgroundColor: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%'
      }}>
        <div className="navbar-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '0.5rem 1rem',
          gap: '0.75rem'
        }}>
          {/* Left Brand & Mobile Menu Toggle */}
          <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#fbbf24',
                borderRadius: '10px',
                padding: '6px'
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to={user ? "/dashboard" : "/"} className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 18px rgba(212, 175, 55, 0.3)',
                border: '1px solid rgba(251, 191, 36, 0.4)'
              }}>
                <Crown color="#fbbf24" size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    fontWeight: '900', 
                    fontSize: '1.3rem',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.1',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef08a 40%, #fbbf24 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>NeoLearner</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    letterSpacing: '0.05em'
                  }}>ROYAL</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.03em' }}>Literacy & Language AI</span>
              </div>
            </Link>
          </div>

          {/* Center Links (Desktop) */}
          <div className="nav-links desktop-nav-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {!user && (
              <Link to="/insights" className={`nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`} style={navItemStyle(isActive('/insights') || isActive('/'))}>
                <Sparkles size={16} color={isActive('/insights') || isActive('/') ? '#fbbf24' : '#94a3b8'} /> 
                <span>{t('showcaseInsights') || 'Showcase'}</span>
              </Link>
            )}

            <Link to="/courses" className={`nav-item ${isActive('/courses') ? 'active' : ''}`} style={navItemStyle(isActive('/courses'))}>
              <BookOpen size={16} color={isActive('/courses') ? '#fbbf24' : '#94a3b8'} /> 
              <span>{t('courses')}</span>
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={navItemStyle(isActive('/dashboard'))}>
                  <LayoutDashboard size={16} color={isActive('/dashboard') ? '#fbbf24' : '#94a3b8'} /> 
                  <span>{t('dashboard')}</span>
                </Link>

                <Link to="/initial-exam" className={`nav-item ${isActive('/initial-exam') || isActive('/placement-test') ? 'active' : ''}`} style={navItemStyle(isActive('/initial-exam') || isActive('/placement-test'))}>
                  <Compass size={16} color={isActive('/initial-exam') || isActive('/placement-test') ? '#fbbf24' : '#94a3b8'} /> 
                  <span>{t('placementHubNav') || 'Placement Hub'}</span>
                </Link>

                <Link to="/conversation" className={`nav-item ${isActive('/conversation') ? 'active' : ''}`} style={navItemStyle(isActive('/conversation'))}>
                  <MessageSquare size={16} color={isActive('/conversation') ? '#fbbf24' : '#94a3b8'} /> 
                  <span>{t('aiLab') || 'AI Lab'}</span>
                </Link>

                <Link to="/learning-path" className={`nav-item ${isActive('/learning-path') ? 'active' : ''}`} style={navItemStyle(isActive('/learning-path'))}>
                  <Compass size={16} color={isActive('/learning-path') ? '#fbbf24' : '#94a3b8'} /> 
                  <span>{t('learningPath')}</span>
                </Link>

                <Link to="/practice-hub" className={`nav-item ${isActive('/practice-hub') ? 'active' : ''}`} style={navItemStyle(isActive('/practice-hub'))}>
                  <Zap size={16} color={isActive('/practice-hub') ? '#fbbf24' : '#94a3b8'} /> 
                  <span>{t('practiceHub')}</span>
                </Link>

                {/* More Dropdown for Secondary Links */}
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    style={{
                      ...navItemStyle(moreDropdownOpen || isActive('/stories') || isActive('/friends') || isActive('/shop') || isActive('/admin')),
                      background: moreDropdownOpen ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    <MoreHorizontal size={16} color="#fbbf24" />
                    <span>{t('more') || 'Explore'}</span>
                    <ChevronDown size={14} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {moreDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '115%',
                      right: 0,
                      width: '210px',
                      background: 'rgba(15, 21, 37, 0.97)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '16px',
                      padding: '0.5rem',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 200
                    }}>
                      <Link to="/stories" onClick={closeMenu} style={dropdownItemStyle(isActive('/stories'))}>
                        <BookOpen size={16} color="#fbbf24" /> {t('stories')}
                      </Link>
                      <Link to="/friends" onClick={closeMenu} style={dropdownItemStyle(isActive('/friends'))}>
                        <Trophy size={16} color="#fbbf24" /> {t('social')}
                      </Link>
                      <Link to="/shop" onClick={closeMenu} style={dropdownItemStyle(isActive('/shop'))}>
                        <Gem size={16} color="#fbbf24" /> {t('shop')}
                      </Link>
                      {user.is_admin && (
                        <Link to="/admin" onClick={closeMenu} style={{ ...dropdownItemStyle(isActive('/admin')), color: '#c084fc' }}>
                          <ShieldAlert size={16} color="#c084fc" /> {t('adminPortal') || 'Admin Portal'}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Gamification Bar */}
            {user && (
              <div className="nav-stats-bar" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.35rem 0.85rem',
                background: 'linear-gradient(135deg, rgba(17, 23, 38, 0.95) 0%, rgba(30, 27, 75, 0.85) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '9999px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                marginLeft: '0.25rem'
              }}>
                <Link to="/practice-hub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none' }} title="Hearts">
                  <Heart size={16} fill="#f87171" />
                  <span>{user.hearts}</span>
                </Link>
                <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none' }} title="Gems">
                  <Gem size={16} fill="#38bdf8" />
                  <span>{user.gems}</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c', fontWeight: '800', fontSize: '0.85rem' }} title="Streak">
                  <Flame size={16} fill="#fb923c" />
                  <span>{user.streak}</span>
                </div>
                <Link to="/leagues" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: '800', fontSize: '0.8rem', textDecoration: 'none' }} title="League Tier">
                  <Award size={16} color="#fbbf24" />
                  <span style={{ color: '#fbbf24' }}>{t(user.league_tier) || 'Bronze'}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Actions (Interface Language Selector + Profile / Logout) */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Royal Language Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(17, 23, 38, 0.9)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '4px 10px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <Globe size={15} style={{ color: '#fbbf24' }} />
              <select
                value={langCode}
                onChange={handleLanguageChange}
                title={t('interfaceLanguage') || 'Interface Language'}
                aria-label="Interface Language"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {INTERFACE_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} style={{ background: '#0b0f19', color: '#ffffff' }}>
                    {l.flag} {l.native}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="nav-action-buttons desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/profile" className="btn" style={royalOutlineBtnStyle}>
                  <User size={16} /> <span>{t('profile')}</span>
                </Link>
                <button onClick={handleLogout} className="btn" style={royalLogoutBtnStyle}>
                  <LogOut size={16} /> <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <div className="nav-action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" className="btn" style={royalOutlineBtnStyle}>{t('login')}</Link>
                <Link to="/register" className="btn" style={royalSolidGoldBtnStyle}>{t('getStarted')}</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu} style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 10, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start'
        }}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()} style={{
            width: '85%',
            maxWidth: '360px',
            height: '100%',
            background: 'linear-gradient(180deg, #0b0f19 0%, #111726 100%)',
            borderRight: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto'
          }}>
            <div className="mobile-drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Crown color="#fbbf24" size={24} />
                <span style={{ fontWeight: '900', fontSize: '1.3rem', color: '#fbbf24', letterSpacing: '-0.01em' }}>NeoLearner</span>
              </div>
              <button onClick={closeMenu} className="btn" style={{ padding: '6px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', color: '#fbbf24', border: '1px solid rgba(212,175,55,0.3)' }}>
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="mobile-drawer-stats" style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(17, 23, 38, 0.9)',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <div className="mobile-stat-badge" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  <Heart size={18} fill="#f87171" /> <span>{user.hearts}</span>
                </div>
                <div className="mobile-stat-badge" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  <Gem size={18} fill="#38bdf8" /> <span>{user.gems}</span>
                </div>
                <div className="mobile-stat-badge" style={{ color: '#fb923c', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  <Flame size={18} fill="#fb923c" /> <span>{user.streak}</span>
                </div>
              </div>
            )}

            <div className="mobile-drawer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {!user && (
                <Link to="/insights" onClick={closeMenu} className={`mobile-nav-item ${isActive('/insights') || isActive('/') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/insights') || isActive('/'))}>
                  <Sparkles size={20} color="#fbbf24" /> <span>{t('showcaseInsights') || 'Showcase'}</span>
                </Link>
              )}
              <Link to="/courses" onClick={closeMenu} className={`mobile-nav-item ${isActive('/courses') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/courses'))}>
                <BookOpen size={20} color="#fbbf24" /> <span>{t('courses')}</span>
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/dashboard'))}>
                    <LayoutDashboard size={20} color="#fbbf24" /> <span>{t('dashboard')}</span>
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" onClick={closeMenu} className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`} style={{ ...mobileNavItemStyle(isActive('/admin')), color: '#c084fc' }}>
                      <ShieldAlert size={20} color="#c084fc" /> <span>{t('adminPortal') || 'Admin Portal'}</span>
                    </Link>
                  )}
                  <Link to="/initial-exam" onClick={closeMenu} className={`mobile-nav-item ${isActive('/initial-exam') || isActive('/placement-test') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/initial-exam') || isActive('/placement-test'))}>
                    <Compass size={20} color="#fbbf24" /> <span>{t('placementHubNav') || 'Placement Hub'}</span>
                  </Link>
                  <Link to="/conversation" onClick={closeMenu} className={`mobile-nav-item ${isActive('/conversation') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/conversation'))}>
                    <MessageSquare size={20} color="#fbbf24" /> <span>{t('aiLab') || 'AI Lab'}</span>
                  </Link>
                  <Link to="/learning-path" onClick={closeMenu} className={`mobile-nav-item ${isActive('/learning-path') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/learning-path'))}>
                    <Compass size={20} color="#fbbf24" /> <span>{t('learningPath')}</span>
                  </Link>
                  <Link to="/practice-hub" onClick={closeMenu} className={`mobile-nav-item ${isActive('/practice-hub') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/practice-hub'))}>
                    <Zap size={20} color="#fbbf24" /> <span>{t('practiceHub')}</span>
                  </Link>
                  <Link to="/stories" onClick={closeMenu} className={`mobile-nav-item ${isActive('/stories') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/stories'))}>
                    <BookOpen size={20} color="#fbbf24" /> <span>{t('stories')}</span>
                  </Link>
                  <Link to="/friends" onClick={closeMenu} className={`mobile-nav-item ${isActive('/friends') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/friends'))}>
                    <Trophy size={20} color="#fbbf24" /> <span>{t('social')}</span>
                  </Link>
                  <Link to="/shop" onClick={closeMenu} className={`mobile-nav-item ${isActive('/shop') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/shop'))}>
                    <Gem size={20} color="#fbbf24" /> <span>{t('shop')}</span>
                  </Link>
                  <Link to="/profile" onClick={closeMenu} className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`} style={mobileNavItemStyle(isActive('/profile'))}>
                    <User size={20} color="#fbbf24" /> <span>{t('profile')}</span>
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-drawer-footer" style={{ paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
              {user ? (
                <button onClick={handleLogout} className="btn" style={{ ...royalLogoutBtnStyle, width: '100%', justifyContent: 'center' }}>
                  <LogOut size={18} /> <span>{t('logout')}</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/login" onClick={closeMenu} className="btn" style={{ ...royalOutlineBtnStyle, justifyContent: 'center' }}>{t('login')}</Link>
                  <Link to="/register" onClick={closeMenu} className="btn" style={{ ...royalSolidGoldBtnStyle, justifyContent: 'center' }}>{t('getStarted')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (for Logged-in Users) */}
      {user && (
        <div className="mobile-bottom-nav" style={{
          display: 'none',
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: '64px',
          background: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
          zIndex: 999,
          justifySpace: 'around',
          alignItems: 'center'
        }}>
          <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={bottomNavItemStyle(isActive('/dashboard'))}>
            <LayoutDashboard size={20} />
            <span>{t('dashboard')}</span>
          </Link>
          <Link to="/learning-path" className={`bottom-nav-item ${isActive('/learning-path') || isActive('/courses') ? 'active' : ''}`} style={bottomNavItemStyle(isActive('/learning-path') || isActive('/courses'))}>
            <Compass size={20} />
            <span>{t('learningPath')}</span>
          </Link>
          <Link to="/conversation" className={`bottom-nav-item ${isActive('/conversation') ? 'active' : ''}`} style={bottomNavItemStyle(isActive('/conversation'))}>
            <MessageSquare size={20} />
            <span>{t('aiLab')}</span>
          </Link>
          <Link to="/practice-hub" className={`bottom-nav-item ${isActive('/practice-hub') ? 'active' : ''}`} style={bottomNavItemStyle(isActive('/practice-hub'))}>
            <Zap size={20} />
            <span>{t('practiceHub')}</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(true)} className="bottom-nav-item" style={{ ...bottomNavItemStyle(false), background: 'none', border: 'none' }}>
            <MoreHorizontal size={20} />
            <span>{t('more') || 'More'}</span>
          </button>
        </div>
      )}
    </>
  );
};

// Style helpers for Royal Palette Consistency
const navItemStyle = (active) => ({
  color: active ? '#fbbf24' : '#cbd5e1',
  fontWeight: active ? '800' : '600',
  fontSize: '0.86rem',
  padding: '0.45rem 0.75rem',
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  textDecoration: 'none',
  background: active ? 'rgba(212, 175, 55, 0.14)' : 'transparent',
  border: active ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent'
});

const dropdownItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0.6rem 0.85rem',
  borderRadius: '10px',
  color: active ? '#fbbf24' : '#e2e8f0',
  fontWeight: '700',
  fontSize: '0.88rem',
  textDecoration: 'none',
  background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
  transition: 'background 0.2s ease'
});

const mobileNavItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '0.85rem 1rem',
  borderRadius: '12px',
  color: active ? '#fbbf24' : '#94a3b8',
  fontWeight: '700',
  fontSize: '0.95rem',
  textDecoration: 'none',
  background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
  borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent'
});

const bottomNavItemStyle = (active) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  color: active ? '#fbbf24' : '#94a3b8',
  fontSize: '0.72rem',
  fontWeight: '700',
  textDecoration: 'none',
  flex: 1
});

const royalOutlineBtnStyle = {
  background: 'rgba(212, 175, 55, 0.08)',
  border: '1px solid rgba(212, 175, 55, 0.4)',
  color: '#fbbf24',
  fontWeight: '800',
  fontSize: '0.88rem',
  padding: '0.45rem 1rem',
  borderRadius: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.2s ease'
};

const royalSolidGoldBtnStyle = {
  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
  border: '1px solid rgba(251, 191, 36, 0.6)',
  color: '#0b0f19',
  fontWeight: '900',
  fontSize: '0.88rem',
  padding: '0.45rem 1.15rem',
  borderRadius: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
  transition: 'all 0.2s ease'
};

const royalLogoutBtnStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#f87171',
  fontWeight: '800',
  fontSize: '0.88rem',
  padding: '0.45rem 1rem',
  borderRadius: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.2s ease'
};

export default Navbar;
