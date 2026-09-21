import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserPlus, Flame, Award, Gift, Sparkles, 
  CheckCircle2, ChevronLeft, Search, ShieldCheck
} from 'lucide-react';
import { sounds } from '../../utils/sounds';

const FriendsHub = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const fetchSocialData = async () => {
    setLoading(true);
    try {
      const [friendsRes, questRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/quest')
      ]);
      setFriends(friendsRes.data || []);
      setQuest(questRes.data || null);
    } catch (err) {
      console.error('Failed to load friends social data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSocialData();
  }, [user]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    try {
      const res = await api.post('/friends/action', {
        email: searchEmail.trim(),
        action: 'send'
      });
      setMessage({ type: 'success', text: res.data.message });
      setSearchEmail('');
      fetchSocialData();
    } catch (err) {
      const errDetail = err.response?.data?.detail || 'Failed to add friend.';
      setMessage({ type: 'error', text: errDetail });
    }
  };

  const handleClaimQuest = async () => {
    setClaiming(true);
    try {
      const res = await api.post('/friends/quest/claim');
      setMessage({ type: 'success', text: res.data.message });
      sounds.playCelebration();
      const uRes = await api.get('/learners/me');
      setUser(uRes.data);
      fetchSocialData();
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1cb0f6', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Users size={16} /> Social Learning Network
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-main)' }}>
            Friends & Social Quests
          </h1>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem',
          background: message.type === 'success' ? 'rgba(88, 204, 2, 0.1)' : 'rgba(255, 75, 75, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--primary-color)' : 'var(--error)'}`,
          color: message.type === 'success' ? 'var(--primary-color)' : 'var(--error)'
        }}>
          {message.text}
        </div>
      )}

      {/* Friends Quest Collaborative Banner */}
      {quest && (
        <div className="card" style={{ 
          padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(28, 176, 246, 0.1) 0%, rgba(88, 204, 2, 0.12) 100%)',
          border: '1px solid rgba(28, 176, 246, 0.25)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ 
                background: 'rgba(28, 176, 246, 0.15)', color: '#1cb0f6', 
                padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' 
              }}>
                WEEKLY FRIENDS QUEST
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: '0.5rem 0 0.25rem' }}>
                Earn {quest.target_xp.toLocaleString()} XP Together with {quest.friend_name}
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                Combine learning power! Complete lessons, quizzes and conversation to reach the target before the week ends.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid var(--border-color)', fontWeight: 'bold', color: '#1cb0f6' }}>
              <Gift size={20} /> Reward: {quest.gem_reward} Gems
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '14px', background: 'var(--border-color)', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{ 
              width: `${Math.min(100, (quest.combined_xp / quest.target_xp) * 100)}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #1cb0f6, var(--primary-color))',
              transition: 'width 0.5s ease' 
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{quest.combined_xp.toLocaleString()} / {quest.target_xp.toLocaleString()} XP ({Math.round((quest.combined_xp / quest.target_xp) * 100)}%)</span>
            <span>⏳ {quest.days_left} days remaining</span>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Contribution: </span>
              <strong style={{ color: 'var(--primary-color)' }}>{quest.my_xp} XP</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{quest.friend_name}: </span>
              <strong style={{ color: '#1cb0f6' }}>{quest.friend_xp} XP</strong>
            </div>
          </div>

          {quest.is_completed && !quest.claimed && (
            <div style={{ marginTop: '1.25rem' }}>
              <button 
                onClick={handleClaimQuest}
                disabled={claiming}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 'bold' }}
              >
                🎉 Claim 100 Gems Reward!
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Friend Input Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} color="var(--primary-color)" /> Add Study Buddy
        </h3>
        <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="email"
            className="form-control"
            placeholder="Enter friend's registered email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ flex: 1, borderRadius: '12px', padding: '0.75rem 1rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            Add Friend
          </button>
        </form>
      </div>

      {/* Friends List */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>
        Your Language Network ({friends.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {friends.map((f, i) => (
          <div 
            key={i} 
            className="card" 
            style={{ 
              padding: '1rem 1.5rem', borderRadius: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid var(--border-color)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '12px', 
                background: 'linear-gradient(135deg, #1cb0f6, var(--primary-color))',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '1.2rem' 
              }}>
                {f.avatar_initial}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>
                  {f.full_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {f.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9600', fontWeight: 'bold' }} title="Friend Streak">
                <Flame size={18} fill="#ff9600" />
                <span>{f.friend_streak}d</span>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                {f.xp.toLocaleString()} XP
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FriendsHub;
