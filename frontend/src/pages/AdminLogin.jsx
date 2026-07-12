import React, { useState } from 'react';
import toast from "react-hot-toast";
import api from '../api/axios';
import { Lock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ t }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post(`/token/`, {
        username: username.trim(),
        password: password.trim()
      });
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      
      navigate('/admin-panel');
    } catch (err) {
      setError(t('Invalid username or password.', 'Nying onyo coc muling kipe.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 mt-12">
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-[#1A3C34] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">{t('Admin Portal', 'Kabedo me Twero')}</h3>
        <p className="text-xs opacity-60 mb-8">{t('Secure access for officials only.', 'Pi luwota keken.')}</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
              {t('Username', 'Nyingtic')}
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
              {t('Password', 'Coc muling')}
            </label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A3C34] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            {loading ? t('Authenticating...', 'Kanono...') : t('Secure Login', 'Donyo Amanyun')}
          </button>

          <div className="text-center pt-4">
             <a href={`/password-reset/`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#1A3C34] transition-colors">
                {t('Forgot Password?', 'Rwenyo password?')}
             </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
