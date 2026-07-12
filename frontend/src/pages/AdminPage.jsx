import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import api, { getMediaUrl } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  LayoutDashboard, 
  ClipboardList, 
  LogOut, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  MapPin,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  Star,
  Send,
  History,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User,
  Shield,
  BookOpen,
  Mic,
  Square,
  Play,
  Volume2,
  FastForward,
  Gavel,
  Ban,
  UserX,
  Users,
  UserPlus,
  Trash2,
  Smile,
  Paperclip,
  Edit2,
  UploadCloud,
  XCircle
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const AdminPage = ({ t }) => {
  const [reports, setReports] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Sub-Counties');
  
  const [expandedRow, setExpandedRow] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('CITIZEN_DISTRICT');
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentBlob, setAttachmentBlob] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const fileInputRef = React.useRef(null);
  
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0 });
  
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', group_name: 'Anti Corruption Agency' });
  
  const [audioConfig, setAudioConfig] = useState(null);
  const [audioForm, setAudioForm] = useState({ 
    english_text: '', luo_text: '',
    english_source: 'text_to_speech', luo_source: 'text_to_speech',
    english_audio_url: '', luo_audio_url: ''
  });
  const [audioFiles, setAudioFiles] = useState({ english_audio_file: null, luo_audio_file: null });
  const [savingAudio, setSavingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isRecordingEng, setIsRecordingEng] = useState(false);
  const [isRecordingLuo, setIsRecordingLuo] = useState(false);
  const mediaRecorderEngRef = React.useRef(null);
  const mediaRecorderLuoRef = React.useRef(null);
  const audioChunksEngRef = React.useRef([]);
  const audioChunksLuoRef = React.useRef([]);

  const startRecording = async (lang) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      if (lang === 'Eng') {
        mediaRecorderEngRef.current = mediaRecorder;
        audioChunksEngRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksEngRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksEngRef.current, { type: 'audio/webm' });
          setAudioFiles(prev => ({...prev, english_audio_file: new File([blob], 'english_recording.webm', { type: 'audio/webm' })}));
        };
        mediaRecorder.start();
        setIsRecordingEng(true);
      } else {
        mediaRecorderLuoRef.current = mediaRecorder;
        audioChunksLuoRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksLuoRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksLuoRef.current, { type: 'audio/webm' });
          setAudioFiles(prev => ({...prev, luo_audio_file: new File([blob], 'luo_recording.webm', { type: 'audio/webm' })}));
        };
        mediaRecorder.start();
        setIsRecordingLuo(true);
      }
    } catch (err) { toast('Microphone access denied.'); }
  };

  const stopRecording = (lang) => {
    if (lang === 'Eng' && mediaRecorderEngRef.current) {
      mediaRecorderEngRef.current.stop();
      setIsRecordingEng(false);
    } else if (lang === 'Luo' && mediaRecorderLuoRef.current) {
      mediaRecorderLuoRef.current.stop();
      setIsRecordingLuo(false);
    }
  };


  const audioRef = React.useRef(null);

  const playInstruction = (lang) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const sourceKey = lang === 'Eng' ? 'english_source' : 'luo_source';
    const source = audioForm[sourceKey];
    
    if (source === 'uploaded_file') {
      const fileKey = lang === 'Eng' ? 'english_audio_file' : 'luo_audio_file';
      const file = audioFiles[fileKey];
      if (file) {
        // Play local blob
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        setIsPlaying(true);
        audio.play();
        return;
      } else if (audioConfig && audioConfig[fileKey]) {
        // Play saved file
        const fileUrl = audioConfig[fileKey];
        const audio = new Audio(getMediaUrl(fileUrl));
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        setIsPlaying(true);
        audio.play();
        return;
      }
    } else if (source === 'url') {
      const urlKey = lang === 'Eng' ? 'english_audio_url' : 'luo_audio_url';
      const url = audioForm[urlKey];
      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        setIsPlaying(true);
        audio.play();
        return;
      }
    }

    const text = lang === 'Eng' ? audioForm.english_text : audioForm.luo_text;
    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'Eng' ? 'en-US' : 'sw-KE';
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const navigate = useNavigate();

  const getAxiosConfig = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchAudioConfig = async () => {
    try {
      const res = await api.get(`/audio-guide/`);
      if (res.data.length > 0) {
        setAudioConfig(res.data[0]);
        setAudioForm({ 
          english_text: res.data[0].english_text || '', 
          luo_text: res.data[0].luo_text || '',
          english_source: res.data[0].english_source || 'text_to_speech',
          luo_source: res.data[0].luo_source || 'text_to_speech',
          english_audio_url: res.data[0].english_audio_url || '',
          luo_audio_url: res.data[0].luo_audio_url || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch audio config');
    }
  };

  const updateAudioConfig = async () => {
    if (!audioConfig) return;
    setSavingAudio(true);
    try {
      const config = {};
      config.headers['Content-Type'] = 'multipart/form-data';
      
      const formData = new FormData();
      Object.keys(audioForm).forEach(key => formData.append(key, audioForm[key]));
      
      if (audioFiles.english_audio_file) formData.append('english_audio_file', audioFiles.english_audio_file);
      if (audioFiles.luo_audio_file) formData.append('luo_audio_file', audioFiles.luo_audio_file);

      await api.patch(`/audio-guide/${audioConfig.id}/`, formData, config);
      await fetchAudioConfig();
      setAudioFiles({ english_audio_file: null, luo_audio_file: null });
      toast('Audio Guide updated successfully!');
    } catch (err) {
      toast('Failed to update Audio Guide.');
    } finally {
      setSavingAudio(false);
    }
  };

  const fetchReports = async () => {
    try {
      const config = {};
      const repRes = await api.get(`/reports/`, config);
      setReports(repRes.data.results || repRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const config = {};
        const meRes = await api.get(`/me/`, config);
        setAdminUser(meRes.data);
        
        // Agency officials should default to internal channel
        if (meRes.data.groups?.includes('Anti Corruption Agency')) {
          setSelectedChannel('ADMIN_INTERNAL');
        }
        
        await fetchReports();
        await fetchAudioConfig();
      } catch (err) {
        navigate('/admin-login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const isAgency = adminUser?.groups?.includes('Anti Corruption Agency');
  const isDistrict = adminUser?.groups?.includes('District Officials');

  const handleUpdate = async (trackingId, field, value) => {
    try {
      await api.patch(`/reports/${trackingId}/`, {
        [field]: value
      }, {});
      await fetchReports();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update.');
    }
  };

  const sendMessage = async (trackingId) => {
    if (!newMessage.trim() && !attachmentBlob) return;
    
    if (editingMessageId) {
      try {
        await api.patch(`/messages/${editingMessageId}/`, {
          tracking_id: trackingId,
          text: newMessage
        }, {});
        setNewMessage('');
        setEditingMessageId(null);
        await fetchReports();
      } catch (err) {
        toast('Failed to edit message.');
      }
      return;
    }

    const data = new FormData();
    data.append('tracking_id', trackingId);
    if (newMessage.trim()) data.append('text', newMessage);
    if (attachmentBlob) data.append('attachment', attachmentBlob, attachmentName);
    data.append('channel', selectedChannel);

    try {
      await api.post(`/messages/`, data, {});
      setNewMessage('');
      setAttachmentBlob(null);
      setAttachmentName('');
      setShowEmojiPicker(false);
      await fetchReports();
    } catch (err) {
      toast('Failed to send message.');
    }
  };

  const handleEditMsg = (msg) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.text || '');
  };

  const handleDeleteMsg = async (id, trackingId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${id}/?tracking_id=${trackingId}`, {});
      await fetchReports();
    } catch (err) {
      toast('Failed to delete message.');
    }
  };

  const [stories, setStories] = useState([]);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({ title: '', description: '', impact_amount: '', location: '' });

  const fetchStories = async () => {
    try {
      const res = await api.get(`/success-stories/`);
      setStories(res.data.results || res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'impact') fetchStories();
  }, [activeTab]);

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {};
      if (editingStory) {
        await api.put(`/success-stories/${editingStory.id}/`, storyForm, config);
      } else {
        await api.post(`/success-stories/`, storyForm, config);
      }
      setStoryForm({ title: '', description: '', impact_amount: '', location: '' });
      setEditingStory(null);
      fetchStories();
    } catch (err) { toast('Failed to save story.'); }
  };

  const deleteStory = async (id) => {
    if (!window.confirm('Delete this success story?')) return;
    try {
      await api.delete(`/success-stories/${id}/`, {});
      fetchStories();
    } catch (err) { toast('Failed to delete.'); }
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get(`/faqs/`);
      setFaqs(res.data.results || res.data);
    } catch (err) { console.error(err); }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {};
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}/`, faqForm, config);
      } else {
        await api.post(`/faqs/`, faqForm, config);
      }
      setFaqForm({ question: '', answer: '', order: 0 });
      setEditingFaq(null);
      fetchFaqs();
    } catch (err) { toast('Failed to save FAQ.'); }
  };

  useEffect(() => {
    if (activeTab === 'governance') fetchFaqs();
    if (activeTab === 'users' && isDistrict) fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users/`, {});
      setUsers(res.data.results || res.data);
    } catch (err) { console.error(err); }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/users/`, userForm, {});
      setUserForm({ username: '', email: '', password: '', group_name: 'Anti Corruption Agency' });
      fetchUsers();
      toast('New official added successfully.');
    } catch (err) { toast(err.response?.data?.detail || 'Failed to add user.'); }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return;
    try {
      await api.delete(`/users/${id}/`, {});
      fetchUsers();
    } catch (err) { toast('Failed to deactivate.'); }
  };

  const exportToCSV = () => {
    const headers = ['Tracking ID', 'Report Type', 'Location', 'Status', 'Date', 'Priority'];
    const rows = filteredReports.map(r => [
      r.tracking_id, r.report_type, r.location, r.status, 
      new Date(r.created_at).toLocaleDateString(), 
      r.is_priority ? 'YES' : 'NO'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Kole_Reports.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-[#1A3C34] font-serif text-2xl">Loading Dashboard...</div>;

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING_REVIEW').length,
    escalated: reports.filter(r => r.status === 'ESCALATED').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
    resolutionRate: reports.length > 0 ? Math.round((reports.filter(r => ['RESOLVED', 'CLOSED'].includes(r.status)).length / reports.length) * 100) : 0
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'All Statuses' && r.status !== statusFilter) return false;
    if (typeFilter !== 'All Types' && r.report_type !== typeFilter) return false;
    if (locationFilter !== 'All Sub-Counties' && r.location !== locationFilter) return false;
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-100px)] bg-[#FAF9F6] -mx-4 -mt-4">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 text-[#1A3C34] mb-2">
            <div className="w-8 h-8 bg-[#1A3C34] rounded-lg flex items-center justify-center text-white"><LayoutDashboard size={18} /></div>
            <span className="font-serif font-bold text-lg">Admin Panel</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{isAgency ? 'Agency Auditor' : 'District Official'}</p>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><Activity size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><ClipboardList size={18} /> Case Reports</button>
          <button onClick={() => setActiveTab('impact')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'impact' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><Star size={18} /> Impact Management</button>
          <button onClick={() => setActiveTab('governance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'governance' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><BookOpen size={18} /> Governance (FAQ)</button>
          {isDistrict && (
            <>
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><Users size={18} /> User Management</button>
              <button onClick={() => setActiveTab('audio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'audio' ? 'bg-[#1A3C34] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}><Volume2 size={18} /> Audio Guide</button>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 mb-4 bg-gray-50 rounded-xl border border-gray-100">
             <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Signed in as</p>
             <p className="text-xs font-bold text-gray-700 truncate">{adminUser?.username}</p>
          </div>
          <button onClick={() => {localStorage.clear(); navigate('/admin-login');}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight capitalize">
                {activeTab === 'dashboard' ? 'Impact Dashboard' : activeTab === 'impact' ? 'Success Stories' : activeTab === 'governance' ? 'Governance' : activeTab === 'audio' ? 'Audio Guide Settings' : 'Case Management'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isAgency ? 'bg-red-50 text-red-700 border-red-100' : 'bg-[#1A3C34]/5 text-[#1A3C34] border-[#1A3C34]/10'}`}>
                {isAgency ? 'Agency Auditor' : 'District Official'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Monitoring Kole District Accountability</p>
          </div>
          {activeTab === 'reports' && <button onClick={exportToCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A3C34] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"><Download size={16} /> Export CSV</button>}
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Reports', value: stats.total, color: 'text-gray-900', icon: <ClipboardList size={20}/> },
                { label: 'Pending Review', value: stats.pending, color: 'text-orange-600', icon: <TrendingUp size={20}/> },
                { label: 'Escalated Cases', value: stats.escalated, color: 'text-red-700', icon: <AlertCircle size={20}/> },
                { label: 'Resolved Cases', value: stats.resolved, color: 'text-green-700', icon: <CheckCircle2 size={20}/> },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4"><div className="p-2 bg-gray-50 rounded-lg text-gray-400">{stat.icon}</div></div>
                  <div className={`text-4xl font-serif font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Visual Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Distribution Chart (SVG-based Doughnut) */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-2"><PieChart size={20} className="text-[#1A3C34]" /> Report Distribution</h4>
                <div className="relative w-48 h-48 mb-6">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f3f4f6" strokeWidth="3" />
                    {(() => {
                      const types = [...new Set(reports.map(r => r.report_type))];
                      let currentOffset = 0;
                      return types.map((type, idx) => {
                        const count = reports.filter(r => r.report_type === type).length;
                        const percentage = (count / (reports.length || 1)) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const offset = currentOffset;
                        currentOffset += percentage;
                        const colors = ['#1A3C34', '#4ADE80', '#FB923C', '#F87171', '#60A5FA'];
                        return (
                          <circle key={type} cx="18" cy="18" r="16" fill="transparent" stroke={colors[idx % colors.length]} strokeWidth="3" strokeDasharray={strokeDasharray} strokeDashoffset={-offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif font-bold text-gray-900">{reports.length}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Cases</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left w-full">
                   {(() => {
                      const types = [...new Set(reports.map(r => r.report_type))].slice(0, 4);
                      const colors = ['#1A3C34', '#4ADE80', '#FB923C', '#F87171'];
                      return types.map((type, idx) => (
                        <div key={type} className="flex items-center gap-2 overflow-hidden">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: colors[idx]}}></div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase truncate">{type}</span>
                        </div>
                      ));
                   })()}
                </div>
              </div>

              {/* Hotspots Chart (Modern Bar Chart) */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-lg font-serif font-bold flex items-center gap-2"><MapPin size={20} className="text-[#1A3C34]" /> Reporting Hotspots (Sub-Counties)</h4>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Real-time Data</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {['Aboke', 'Alito', 'Akalo', 'Ayer', 'Bala', 'Okwerodot'].map(loc => {
                    const count = reports.filter(r => r.location === loc).length;
                    const maxCount = Math.max(...['Aboke', 'Alito', 'Akalo', 'Ayer', 'Bala', 'Okwerodot'].map(l => reports.filter(r => r.location === l).length), 1);
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={loc} className="group cursor-default">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wide group-hover:text-[#1A3C34] transition-colors">{loc}</span>
                          <span className="text-xs font-serif font-bold text-gray-500">{count} <span className="text-[10px] font-sans font-bold text-gray-300 uppercase">Reports</span></span>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#1A3C34] to-[#4ADE80] rounded-full transition-all duration-1000 ease-out shadow-sm" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Performance Analytics Sparkline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-2xl font-serif font-bold text-gray-900">{stats.resolutionRate}%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case Resolution Rate</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Mic size={24} /></div>
                <div>
                  <p className="text-2xl font-serif font-bold text-gray-900">{reports.filter(r => r.messages?.some(m => m.voice_note)).length}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Voice-Evidence Cases</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><History size={24} /></div>
                <div>
                  <p className="text-2xl font-serif font-bold text-gray-900">{reports.filter(r => new Date(r.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reports (Last 7 Days)</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
               <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-2"><History size={20} className="text-[#1A3C34]" /> Recent System Activity</h4>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {reports.flatMap(r => (r.audit_logs || []).map(log => ({...log, tracking_id: r.tracking_id}))).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10).map((log, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                       <div className="p-2 bg-gray-100 rounded-lg text-gray-400 mt-1"><Activity size={14} /></div>
                       <div className="flex-grow">
                          <div className="flex justify-between items-start">
                             <p className="text-sm font-bold text-gray-900">{log.action}</p>
                             <span className="text-[10px] font-bold text-gray-400 font-mono">#{log.tracking_id}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                          <p className="text-[9px] text-gray-300 mt-2 font-bold uppercase">{log.username} • {new Date(log.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
                  {reports.length === 0 && <p className="text-center py-10 text-gray-400 italic">No activity recorded yet.</p>}
               </div>
            </div>
          </div>
        ) : activeTab === 'impact' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Story Form */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <h4 className="text-lg font-serif font-bold mb-6">{editingStory ? 'Edit Success Story' : 'New Success Story'}</h4>
                <form onSubmit={handleStorySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Title</label>
                    <input type="text" required value={storyForm.title} onChange={e => setStoryForm({...storyForm, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</label>
                    <input type="text" required value={storyForm.location} onChange={e => setStoryForm({...storyForm, location: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Impact (e.g. 5M UGX Recovered)</label>
                    <input type="text" value={storyForm.impact_amount} onChange={e => setStoryForm({...storyForm, impact_amount: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                    <textarea required value={storyForm.description} onChange={e => setStoryForm({...storyForm, description: e.target.value})} rows="4" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34] resize-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-[#1A3C34] text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg">{editingStory ? 'Update' : 'Publish'}</button>
                    {editingStory && <button type="button" onClick={() => {setEditingStory(null); setStoryForm({title:'', location:'', impact_amount:'', description:''})}} className="px-4 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200">Cancel</button>}
                  </div>
                </form>
              </div>

              {/* Story List */}
              <div className="lg:col-span-2 space-y-4">
                {stories.map(story => (
                  <div key={story.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[8px] font-bold uppercase rounded border border-green-100">{story.location}</span>
                        {story.impact_amount && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-bold uppercase rounded border border-blue-100">{story.impact_amount}</span>}
                      </div>
                      <h5 className="font-serif font-bold text-gray-900">{story.title}</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{story.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {setEditingStory(story); setStoryForm({title: story.title, location: story.location, impact_amount: story.impact_amount, description: story.description})}} className="p-2 text-gray-400 hover:text-[#1A3C34] transition-colors"><FileText size={16} /></button>
                      <button onClick={() => deleteStory(story.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={16} className="rotate-90" /></button>
                    </div>
                  </div>
                ))}
                {stories.length === 0 && <div className="text-center py-20 text-gray-400 italic">No success stories published yet.</div>}
              </div>
            </div>
          </div>
        ) : activeTab === 'users' && isDistrict ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Creation Form */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#1A3C34]/10 text-[#1A3C34] rounded-2xl"><UserPlus size={24} /></div>
                  <h4 className="text-xl font-serif font-bold">Add Official</h4>
                </div>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Username</label>
                    <input type="text" required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                    <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
                    <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Official Group</label>
                    <select value={userForm.group_name} onChange={e => setUserForm({...userForm, group_name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34] appearance-none">
                      <option value="Anti Corruption Agency">Anti Corruption Agency</option>
                      <option value="District Officials">District Officials</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-[#1A3C34] text-white font-bold py-4 rounded-xl hover:opacity-90 shadow-lg mt-4 transition-all flex items-center justify-center gap-2"><Lock size={16} /> Authorize Account</button>
                </form>
              </div>

              {/* User List Table */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
                <h4 className="text-lg font-serif font-bold mb-6">Active System Officials</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <th className="py-4">Official</th>
                        <th className="py-4">Role</th>
                        <th className="py-4">Status</th>
                        <th className="py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">{u.username[0].toUpperCase()}</div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.username}</p>
                                <p className="text-[10px] text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${u.groups.includes('District Officials') ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'}`}>
                              {u.groups[0] || 'Official'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">{u.is_active ? 'Active' : 'Disabled'}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            {u.is_active && u.username !== adminUser?.username && (
                              <button onClick={() => deactivateUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Deactivate Account"><UserX size={16} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'audio' && isDistrict ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-4xl bg-white border border-gray-200 rounded-[3rem] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#1A3C34]/5 text-[#1A3C34] rounded-2xl">
                  <Volume2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold">Audio Guide Configuration</h3>
                  <p className="text-sm text-gray-500">Update the automated voice instructions for citizens.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['English', 'Luo'].map(lang => {
                  const prefix = lang === 'English' ? 'english' : 'luo';
                  const sourceKey = `${prefix}_source`;
                  const textKey = `${prefix}_text`;
                  const urlKey = `${prefix}_audio_url`;
                  const isRecording = lang === 'English' ? isRecordingEng : isRecordingLuo;
                  return (
                    <div key={lang} className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-800">{lang} Instructions</label>
                      </div>
                      
                      {/* Source Selection */}
                      <div className="flex gap-2">
                         <button onClick={() => setAudioForm({...audioForm, [sourceKey]: 'text_to_speech'})} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${audioForm[sourceKey] === 'text_to_speech' ? 'bg-[#1A3C34] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>System Voice (TTS)</button>
                         <button onClick={() => setAudioForm({...audioForm, [sourceKey]: 'uploaded_file'})} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${audioForm[sourceKey] === 'uploaded_file' ? 'bg-[#1A3C34] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>Custom Audio</button>
                         <button onClick={() => setAudioForm({...audioForm, [sourceKey]: 'url'})} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${audioForm[sourceKey] === 'url' ? 'bg-[#1A3C34] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>Internet URL</button>
                      </div>

                      {audioForm[sourceKey] === 'text_to_speech' && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <textarea 
                            value={audioForm[textKey]} 
                            onChange={e => setAudioForm({...audioForm, [textKey]: e.target.value})}
                            rows="5" 
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34] resize-none"
                            placeholder={`Enter ${lang} text for system voice...`}
                          />
                        </div>
                      )}

                      {audioForm[sourceKey] === 'uploaded_file' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                           <div className="flex gap-2">
                             <button onClick={() => isRecording ? stopRecording(lang === 'English' ? 'Eng' : 'Luo') : startRecording(lang === 'English' ? 'Eng' : 'Luo')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                {isRecording ? <Square size={14}/> : <Mic size={14}/>} {isRecording ? 'Stop Recording' : 'Record Voice'}
                             </button>
                             <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 cursor-pointer transition-all">
                                <UploadCloud size={14}/> Upload File
                                <input type="file" className="hidden" accept="audio/*" onChange={(e) => {
                                  if (e.target.files[0]) {
                                    setAudioFiles(prev => ({...prev, [`${prefix}_audio_file`]: e.target.files[0]}));
                                  }
                                }}/>
                             </label>
                           </div>
                           {(audioFiles[`${prefix}_audio_file`] || audioConfig?.[`${prefix}_audio_file`]) && (
                             <div className="text-xs font-bold text-green-700 flex items-center gap-2 bg-green-50 border border-green-100 p-3 rounded-xl">
                               <CheckCircle2 size={16} className="text-green-500" /> 
                               {audioFiles[`${prefix}_audio_file`] ? `New audio selected: ${audioFiles[`${prefix}_audio_file`].name}` : 'Existing custom audio saved'}
                             </div>
                           )}
                        </div>
                      )}

                      {audioForm[sourceKey] === 'url' && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          <input 
                            type="url"
                            value={audioForm[urlKey]} 
                            onChange={e => setAudioForm({...audioForm, [urlKey]: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]"
                            placeholder="https://example.com/audio.mp3"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Universal Test Voice Action */}
              <div className="flex justify-center gap-4 py-4">
                <button onClick={() => playInstruction('Eng')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#1A3C34] font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
                  {isPlaying ? <Square size={16}/> : <Play size={16}/>} {isPlaying ? 'Stop Test' : 'Test English Audio'}
                </button>
                <button onClick={() => playInstruction('Luo')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#1A3C34] font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
                  {isPlaying ? <Square size={16}/> : <Play size={16}/>} {isPlaying ? 'Stop Test' : 'Test Luo Audio'}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertTriangle size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Changes take effect immediately on the homepage</p>
                </div>
                <button 
                  onClick={updateAudioConfig}
                  disabled={savingAudio}
                  className="bg-[#1A3C34] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 shadow-lg disabled:opacity-50 transition-all"
                >
                  {savingAudio ? 'Saving...' : 'Save Audio Config'}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'governance' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* FAQ Form */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <h4 className="text-lg font-serif font-bold mb-6">{editingFaq ? 'Edit FAQ' : 'New FAQ'}</h4>
                <form onSubmit={handleFaqSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question</label>
                    <input type="text" required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Answer</label>
                    <textarea required value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} rows="4" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34] resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort Order</label>
                    <input type="number" value={faqForm.order} onChange={e => setFaqForm({...faqForm, order: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#1A3C34]" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-[#1A3C34] text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg">{editingFaq ? 'Update FAQ' : 'Publish FAQ'}</button>
                    {editingFaq && <button type="button" onClick={() => {setEditingFaq(null); setFaqForm({question:'', answer:'', order: 0})}} className="px-4 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200">Cancel</button>}
                  </div>
                </form>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-2 space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold uppercase rounded border border-gray-200">ORDER: {faq.order}</span>
                      </div>
                      <h5 className="font-serif font-bold text-gray-900">{faq.question}</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {setEditingFaq(faq); setFaqForm({question: faq.question, answer: faq.answer, order: faq.order})}} className="p-2 text-gray-400 hover:text-[#1A3C34] transition-colors"><FileText size={16} /></button>
                      <button onClick={async () => { if(window.confirm('Delete FAQ?')) { await api.delete(`/faqs/${faq.id}/`, {}); fetchFaqs(); } }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={16} className="rotate-90" /></button>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && <div className="text-center py-20 text-gray-400 italic">No FAQs created yet.</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 border-r border-gray-100">Filter:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 border-none text-xs font-bold uppercase p-3 rounded-xl outline-none"><option value="All Statuses">All Statuses</option><option value="PENDING_REVIEW">Pending</option><option value="UNDER_REVIEW">Under Review</option><option value="ESCALATED">Escalated</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-50 border-none text-xs font-bold uppercase p-3 rounded-xl outline-none"><option value="All Types">All Types</option>{[...new Set(reports.map(r => r.report_type))].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="bg-gray-50 border-none text-xs font-bold uppercase p-3 rounded-xl outline-none"><option value="All Sub-Counties">All Sub-Counties</option>{['Aboke', 'Alito', 'Akalo', 'Ayer', 'Bala', 'Okwerodot'].map(l => <option key={l} value={l}>{l}</option>)}</select>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100"><th className="p-6">ID</th><th className="p-6">Type</th><th className="p-6">Location</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr></thead>
                  <tbody>
                    {filteredReports.map((r) => (
                      <React.Fragment key={r.tracking_id}>
                        <tr onClick={() => setExpandedRow(expandedRow === r.tracking_id ? null : r.tracking_id)} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${expandedRow === r.tracking_id ? 'bg-gray-50/80' : ''}`}>
                          <td className="p-6 font-mono text-xs font-bold text-gray-500 flex items-center gap-2">{r.is_priority && <Star size={14} className="fill-yellow-400 text-yellow-400" />}{r.tracking_id}</td>
                          <td className="p-6 text-sm font-bold text-gray-800 capitalize">{r.report_type}</td>
                          <td className="p-6 text-sm text-gray-600">{r.location}</td>
                          <td className="p-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${r.status === 'RESOLVED' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>{r.status.replace('_', ' ')}</span></td>
                          <td className="p-6 text-right">{expandedRow === r.tracking_id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</td>
                        </tr>
                        
                        {expandedRow === r.tracking_id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan="5" className="p-8">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Details & Evidence */}
                                <div className="lg:col-span-1 space-y-6">
                                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Case Details</h4>
                                      <p className="text-sm leading-relaxed text-gray-800">{r.description}</p>
                                      <div className="mt-6 space-y-2">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Evidence</h4>
                                        <div className="space-y-3 relative overflow-hidden group">
                                         {r.evidence && (
                                           <a href={r.evidence} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all relative">
                                             <div className="flex items-center gap-3">
                                               <FileText className="text-[#1A3C34]" size={20} />
                                               <span className="text-sm font-bold text-gray-700">Primary Evidence</span>
                                             </div>
                                             <span className="text-xs text-[#1A3C34] font-bold">VIEW</span>
                                             {/* Visual Watermark Overlay */}
                                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 pointer-events-none rotate-12 transition-opacity">
                                               <span className="text-[10px] font-bold text-[#1A3C34] border-2 border-[#1A3C34] px-2">CONFIDENTIAL - KOLE DISTRICT</span>
                                             </div>
                                           </a>
                                         )}
                                        {r.additional_evidence?.map((file, i) => <a key={i} href={file.file} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100"><FileText size={14} /> Attachment {i+1}</a>)}
                                        </div>
                                      </div>
                                   </div>
                                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                       <div className="flex justify-between items-center">
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</h4>
                                          {isDistrict && !r.is_escalated && (
                                            <button 
                                              onClick={() => handleUpdate(r.tracking_id, 'status', 'ESCALATED')}
                                              className="flex items-center gap-1 text-[8px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 hover:bg-red-100 transition-all"
                                            >
                                              <FastForward size={10} /> ESCALATE TO IGG
                                            </button>
                                          )}
                                          {isAgency && (
                                            <div className="flex gap-2">
                                              <button 
                                                onClick={() => handleUpdate(r.tracking_id, 'status', 'SANCTION_PENDING')}
                                                className="flex items-center gap-1 text-[8px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-all"
                                              >
                                                <Ban size={10} /> SANCTION
                                              </button>
                                              <button 
                                                onClick={() => handleUpdate(r.tracking_id, 'status', 'LEGAL_REFERRAL')}
                                                className="flex items-center gap-1 text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-all"
                                              >
                                                <Gavel size={10} /> LEGAL REFERRAL
                                              </button>
                                            </div>
                                          )}
                                       </div>
                                       <select value={r.status} onChange={(e) => handleUpdate(r.tracking_id, 'status', e.target.value)} className="w-full text-xs font-bold uppercase p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none">
                                          <option value="PENDING_REVIEW">PENDING REVIEW</option>
                                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                                          {!isAgency && <option value="ESCALATED">ESCALATE TO IGG</option>}
                                          {isAgency && <option value="SANCTION_PENDING">AGENCY SANCTION</option>}
                                          {isAgency && <option value="LEGAL_REFERRAL">LEGAL REFERRAL</option>}
                                          <option value="RESOLVED">RESOLVED</option>
                                          <option value="CLOSED">CLOSED</option>
                                       </select>
                                       <textarea value={r.admin_note || ''} onChange={(e) => { const n = [...reports]; n[n.findIndex(x => x.tracking_id === r.tracking_id)].admin_note = e.target.value; setReports(n); }} onBlur={(e) => handleUpdate(r.tracking_id, 'admin_note', e.target.value)} placeholder="Public official note..." className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none" rows="2" />
                                    </div>
                                </div>

                                {/* Timeline / Audit Logs */}
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
                                  <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4"><History size={16} className="text-gray-400"/><h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Case Timeline</h4></div>
                                  <div className="flex-grow overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                    {r.audit_logs?.map((log, i) => (
                                      <div key={i} className="relative pl-6 border-l-2 border-gray-50 pb-2">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-[#1A3C34] rounded-full"></div>
                                        <p className="text-xs font-bold text-gray-900">{log.action}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{log.details}</p>
                                        <p className="text-[9px] text-gray-300 mt-2 font-bold uppercase">{log.username} • {new Date(log.timestamp).toLocaleDateString()}</p>
                                      </div>
                                    ))}
                                    <div className="relative pl-6 border-l-2 border-gray-50">
                                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-green-500 rounded-full"></div>
                                      <p className="text-xs font-bold text-gray-900">Report Submitted</p>
                                      <p className="text-[9px] text-gray-300 mt-1 font-bold uppercase">Citizen • {new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Messages - MULTI-CHANNEL SECURE CHAT */}
                                <div className="lg:col-span-1 bg-[#1A3C34] p-6 rounded-2xl shadow-xl flex flex-col h-[500px]">
                                   {/* Channel Toggles */}
                                   <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                                      <div className="flex gap-2">
                                         {isDistrict && (
                                           <button 
                                             onClick={() => setSelectedChannel('CITIZEN_DISTRICT')}
                                             className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${selectedChannel === 'CITIZEN_DISTRICT' ? 'bg-white text-[#1A3C34]' : 'text-white/40 hover:text-white'}`}
                                           >
                                             Citizen Chat
                                           </button>
                                         )}
                                         <button 
                                           onClick={() => setSelectedChannel('ADMIN_INTERNAL')}
                                           className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${selectedChannel === 'ADMIN_INTERNAL' ? 'bg-white text-[#1A3C34]' : 'text-white/40 hover:text-white'}`}
                                         >
                                           Internal Audit
                                         </button>
                                      </div>
                                      <Lock size={14} className="text-white/20" title="End-to-End Encrypted" />
                                   </div>

                                   {/* Chat Content */}
                                   <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                                      {r.messages?.filter(m => m.channel === selectedChannel).length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-30">
                                          <Shield size={32} className="text-white" />
                                          <p className="text-[10px] text-white font-bold uppercase tracking-widest">Secure Channel Encrypted</p>
                                          <p className="text-[8px] text-white/60 px-4">Conversations here are private to participants in this channel.</p>
                                        </div>
                                      )}
                                      {r.messages?.filter(m => m.channel === selectedChannel).map((msg, i) => (
                                        <div key={i} className={`flex ${['DISTRICT', 'AGENCY'].includes(msg.sender_type) ? 'justify-end' : 'justify-start'}`}>
                                           <div className={`max-w-[90%] p-3 rounded-xl text-xs relative group ${['DISTRICT', 'AGENCY'].includes(msg.sender_type) ? 'bg-white text-[#1A3C34] rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                              {msg.text && (
                                                <p className="whitespace-pre-wrap">
                                                  {msg.text}
                                                  {msg.is_edited && <span className="text-[9px] italic opacity-50 ml-2">(edited)</span>}
                                                </p>
                                              )}
                                               {msg.voice_note && (
                                                 <div className="mt-2 flex items-center gap-2 bg-black/5 p-2 rounded-lg border border-white/5">
                                                   <Play size={12} className="cursor-pointer hover:text-green-400" onClick={() => {
                                                     const audio = new Audio(getMediaUrl(msg.voice_note));
                                                     audio.play();
                                                   }} />
                                                   <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
                                                      <div className="h-full bg-green-400 animate-pulse w-1/2"></div>
                                                   </div>
                                                   <span className="text-[8px] font-mono">VOICE</span>
                                                 </div>
                                               )}
                                               {msg.attachment && (
                                                 <div className="mt-2 flex items-center gap-2 bg-black/5 p-2 rounded-lg text-xs">
                                                   <FileText size={12} />
                                                   <a href={getMediaUrl(msg.attachment)} target="_blank" rel="noreferrer" className="underline font-bold">Attachment</a>
                                                 </div>
                                               )}
                                              <div className="flex items-center gap-1 mt-1 opacity-50 uppercase font-bold text-[8px] justify-between">
                                                <div className="flex items-center gap-1">
                                                  {msg.sender_type === 'CITIZEN' ? <User size={8}/> : <Shield size={8}/>}
                                                  {msg.sender_type === 'CITIZEN' ? 'CITIZEN' : msg.sender_type === 'AGENCY' ? 'AGENCY AUDITOR' : 'YOU'}
                                                </div>
                                                {msg.sender?.id === adminUser?.id && (
                                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button onClick={() => handleEditMsg(msg)} className="hover:text-blue-400"><Edit2 size={10} /></button>
                                                     <button onClick={() => handleDeleteMsg(msg.id, r.tracking_id)} className="hover:text-red-400"><Trash2 size={10} /></button>
                                                  </div>
                                                )}
                                              </div>
                                           </div>
                                        </div>
                                      ))}
                                   </div>

                                   {/* Input */}
                                   <div className="space-y-2 relative">
                                      {showEmojiPicker && (
                                        <div className="absolute bottom-24 right-0 z-50">
                                          <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} theme="dark" />
                                        </div>
                                      )}
                                      {attachmentName && (
                                        <div className="absolute -top-8 left-0 bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                                          <FileText size={10} /> {attachmentName}
                                          <button onClick={() => { setAttachmentBlob(null); setAttachmentName(''); }}><XCircle size={10}/></button>
                                        </div>
                                      )}
                                      {editingMessageId && (
                                        <div className="absolute -top-8 left-0 bg-blue-900/50 text-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-500/20">
                                          <Edit2 size={10} /> Editing message...
                                          <button onClick={() => { setEditingMessageId(null); setNewMessage(''); }}><XCircle size={10}/></button>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                        <Lock size={10} /> End-to-End Encrypted Tunnel Active
                                      </div>
                                      <div className="relative flex items-stretch bg-white/5 border border-white/10 rounded-xl focus-within:bg-white/10 pr-2 transition-all">
                                         <textarea 
                                           value={newMessage} 
                                           onChange={(e) => setNewMessage(e.target.value)} 
                                           placeholder={selectedChannel === 'CITIZEN_DISTRICT' ? "Message citizen anonymously..." : "Collaborate with auditors..."} 
                                           className="flex-grow bg-transparent p-4 text-xs text-white outline-none resize-none placeholder-white/30" 
                                           rows="2" 
                                         />
                                         <div className="flex items-center gap-1 flex-col justify-center px-2 border-l border-white/10 my-2">
                                            <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                                              if (e.target.files[0]) {
                                                setAttachmentBlob(e.target.files[0]);
                                                setAttachmentName(e.target.files[0].name);
                                              }
                                            }} />
                                            <div className="flex gap-1">
                                              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                                <Smile size={14} />
                                              </button>
                                              <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                                <Paperclip size={14} />
                                              </button>
                                            </div>
                                            <button onClick={() => sendMessage(r.tracking_id)} disabled={!newMessage.trim() && !attachmentBlob} className="w-full mt-1 p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-400 disabled:opacity-30 disabled:bg-white/10 transition-all flex justify-center">
                                              <Send size={14}/>
                                            </button>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
