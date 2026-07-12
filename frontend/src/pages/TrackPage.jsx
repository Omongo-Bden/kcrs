import React, { useState, useEffect, useRef } from 'react';
import toast from "react-hot-toast";
import api, { getMediaUrl } from '../api/axios';
import { 
  Search, Loader2, FileText, CheckCircle2, Clock, 
  ShieldAlert, XCircle, Send, MessageSquare, 
  Lock, Shield, Play, Mic, Square, Download, Printer,
  FastForward, Ban, Gavel, Smile, Paperclip, Edit2, Trash2
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const TrackPage = ({ t }) => {
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentBlob, setAttachmentBlob] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const fileInputRef = useRef(null);

  const handleTrack = async () => {
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await api.get(`/reports/${trackingId}/`);
      setReport(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(t('Report not found. Please check your Tracking ID.', 'Adot pe ononge. Nen namba ni maber.'));
      } else {
        setError('Connection error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (blob = null) => {
    if (!newMessage.trim() && !blob && !attachmentBlob) return;
    setSendingMsg(true);

    if (editingMessageId) {
      try {
        await api.patch(`/messages/${editingMessageId}/`, {
          tracking_id: report.tracking_id,
          text: newMessage
        });
        setNewMessage('');
        setEditingMessageId(null);
        const res = await api.get(`/reports/${report.tracking_id}/`);
        setReport(res.data);
      } catch (err) {
        toast('Failed to edit message.');
      } finally {
        setSendingMsg(false);
      }
      return;
    }

    const data = new FormData();
    data.append('tracking_id', report.tracking_id);
    if (newMessage.trim()) data.append('text', newMessage);
    if (blob) data.append('voice_note', blob, 'voice.webm');
    if (attachmentBlob) data.append('attachment', attachmentBlob, attachmentName);
    data.append('channel', 'CITIZEN_DISTRICT');

    try {
      await api.post(`/messages/`, data);
      setNewMessage('');
      setAudioBlob(null);
      setAttachmentBlob(null);
      setAttachmentName('');
      setShowEmojiPicker(false);
      const res = await api.get(`/reports/${report.tracking_id}/`);
      setReport(res.data);
    } catch (err) {
      toast('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleEditMsg = (msg) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.text || '');
  };

  const handleDeleteMsg = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/messages/${id}/`, {
        data: { tracking_id: report.tracking_id }
      });
      const res = await api.get(`/reports/${report.tracking_id}/`);
      setReport(res.data);
    } catch (err) {
      toast('Failed to delete message.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getStatusDisplay = (status) => {
    const map = {
      'PENDING_REVIEW': { label: t('Pending Review', 'Ripot tye me kiyeny'), color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Clock size={16}/> },
      'UNDER_REVIEW': { label: t('Under Review', 'Kitiye ka yeny'), color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Search size={16}/> },
      'ESCALATED': { label: t('Escalated to Agency', 'Kiyeny bot Atur'), color: 'bg-red-50 text-red-700 border-red-100', icon: <FastForward size={16}/> },
      'SANCTION_PENDING': { label: t('Agency Sanction Pending', 'Atur tye ka miyo kumat'), color: 'bg-orange-50 text-orange-700 border-orange-100', icon: <Ban size={16}/> },
      'LEGAL_REFERRAL': { label: t('Legal Referral', 'Kiyolo bot Kot'), color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Gavel size={16}/> },
      'RESOLVED': { label: t('Resolved', 'Tic otum'), color: 'bg-green-50 text-green-700 border-green-100', icon: <CheckCircle2 size={16}/> },
      'CLOSED': { label: t('Closed', 'Kitwero'), color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <XCircle size={16}/> },
    };
    return map[status] || { label: status, color: 'bg-gray-50 text-gray-500 border-gray-100', icon: null };
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20 px-4 md:px-0">
      
      <div className="space-y-3">
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Track Your Report', 'Lubo Kor Ripot ni')}
        </h1>
        <p className="text-sm text-gray-500 font-medium no-print">
          {t('Enter your unique tracking code below to check the status of your report or communicate with investigating officials.', 'Ket namba ni piny me yeny kit me ripot ni tye kede.')}
        </p>

        {/* Print Only Header */}
        <div className="hidden print-only text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 border-4 border-[#1A3C34] rounded-full flex items-center justify-center font-serif font-bold text-[#1A3C34] text-xl">KD</div>
            <h1 className="text-3xl font-serif font-bold text-[#1A3C34] tracking-tight">KOLE DISTRICT LOCAL GOVERNMENT</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mt-2">Official Corruption Reporting System Receipt</p>
            <div className="w-32 h-1 bg-[#1A3C34] mt-4"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] p-6 md:p-10 no-print">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="KD - 0000" 
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="flex-1 bg-white border-2 border-gray-100 rounded-xl p-5 outline-none focus:ring-2 focus:ring-[#1A3C34] font-mono text-2xl font-bold tracking-widest text-[#1A3C34]" 
          />
          <button 
            onClick={handleTrack}
            disabled={loading}
            className="bg-[#1A3C34] text-white px-12 py-5 rounded-xl font-bold text-lg hover:opacity-90 shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : t('Look Up', 'Yeny')}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm font-semibold flex items-center gap-2 pt-4"><XCircle size={16}/> {error}</p>}
      </div>

      {report && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-serif font-bold text-gray-900">{t('Case Status', 'Kalo me Ripot')}</h3>
              {report.is_priority && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-bold uppercase rounded-full border border-red-200 animate-pulse">
                  <ShieldAlert size={10} /> HIGH PRIORITY
                </span>
              )}
            </div>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs border border-gray-100 hover:bg-gray-100 transition-all no-print"
            >
              <Printer size={14} /> PRINT SUMMARY
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Status</span>
              <div className={`flex items-center gap-2 w-max px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${getStatusDisplay(report.status).color}`}>
                {getStatusDisplay(report.status).icon}
                {getStatusDisplay(report.status).label}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Category</span>
              <p className="text-xl font-serif font-bold text-gray-900 capitalize">{report.report_type}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Submitted</span>
              <p className="text-xl font-serif font-bold text-gray-900">
                {new Date(report.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] p-10 space-y-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Description</h4>
                <p className="text-gray-800 leading-relaxed bg-[#FAF9F6] p-6 rounded-2xl border border-gray-100 shadow-inner">
                  {report.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Evidence Files</h4>
                <div className="space-y-3">
                  {report.evidence && (
                    <a href={report.evidence} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="text-[#1A3C34]" size={20} />
                        <span className="text-sm font-bold text-gray-700">Primary Evidence</span>
                      </div>
                      <span className="text-xs text-[#1A3C34] font-bold">VIEW</span>
                    </a>
                  )}
                  {report.additional_evidence?.map((file, i) => (
                    <a key={i} href={file.file} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={20} />
                        <span className="text-sm font-bold text-gray-700">Attachment {i+1}</span>
                      </div>
                      <span className="text-xs text-[#1A3C34] font-bold">VIEW</span>
                    </a>
                  ))}
                  {!report.evidence && (!report.additional_evidence || report.additional_evidence.length === 0) && (
                    <p className="text-sm text-gray-400 italic">No files attached.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messaging Section */}
            <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] p-8 md:p-10 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#1A3C34]/5 rounded-xl text-[#1A3C34]">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-gray-900">Secure Messaging</h4>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-green-700 border border-green-100">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">E2E Secure</span>
                </div>
              </div>

              {/* Security Key Display */}
              <div className="mb-4 bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Shield size={14} className="text-[#1A3C34]/40" />
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Session Fingerprint:</span>
                </div>
                <span className="text-[9px] font-mono text-gray-300 font-bold">K4X-99Z-AL2-PP9</span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {report.messages?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <Shield size={40} className="text-[#1A3C34]/10" />
                    <p className="text-gray-400 text-sm leading-relaxed">
                      This is a secure channel. Use this to provide more information to investigators anonymously.
                    </p>
                  </div>
                ) : (
                  report.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender_type === 'CITIZEN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${msg.sender_type === 'CITIZEN' ? 'bg-[#1A3C34] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'}`}>
                        {msg.text && (
                          <p className="leading-relaxed">
                            {msg.text}
                            {msg.is_edited && <span className="text-[10px] italic opacity-50 ml-2">(edited)</span>}
                          </p>
                        )}
                        {msg.voice_note && (
                          <div className="mt-2 flex items-center gap-3 bg-black/10 p-2 rounded-xl border border-white/5">
                            <Play size={16} className="cursor-pointer hover:text-green-400" onClick={() => {
                               const audio = new Audio(getMediaUrl(msg.voice_note));
                               audio.play();
                            }} />
                            <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-green-400 animate-pulse w-1/3"></div>
                            </div>
                          </div>
                        )}
                        {msg.attachment && (
                          <div className="mt-2 flex items-center gap-2 bg-black/5 p-2 rounded-lg text-xs">
                            <FileText size={14} />
                            <a href={getMediaUrl(msg.attachment)} target="_blank" rel="noreferrer" className="underline font-bold">View Attachment</a>
                          </div>
                        )}
                        <span className={`flex justify-between items-center text-[10px] mt-2 opacity-50 font-bold ${msg.sender_type === 'CITIZEN' ? 'flex-row-reverse' : ''}`}>
                          <span>{msg.sender_type === 'DISTRICT' ? 'INVESTIGATOR' : 'YOU'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.sender_type === 'CITIZEN' && (
                            <span className="flex gap-2">
                              <button onClick={() => handleEditMsg(msg)} className="hover:text-blue-400"><Edit2 size={12} /></button>
                              <button onClick={() => handleDeleteMsg(msg.id)} className="hover:text-red-400"><Trash2 size={12} /></button>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="relative">
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 right-0 z-50">
                      <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} />
                    </div>
                  )}
                  {attachmentName && (
                    <div className="absolute -top-8 left-0 bg-gray-100 text-xs px-3 py-1 rounded-full flex items-center gap-2">
                      <FileText size={12} /> {attachmentName}
                      <button onClick={() => { setAttachmentBlob(null); setAttachmentName(''); }}><XCircle size={12}/></button>
                    </div>
                  )}
                  {editingMessageId && (
                    <div className="absolute -top-8 left-0 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-2">
                      <Edit2 size={12} /> Editing message...
                      <button onClick={() => { setEditingMessageId(null); setNewMessage(''); }}><XCircle size={12}/></button>
                    </div>
                  )}
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isRecording ? "Recording voice..." : "Type your message here..."}
                    rows="3"
                    className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pr-32 text-sm focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all resize-none shadow-inner ${isRecording ? 'animate-pulse bg-red-50' : ''}`}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                      if (e.target.files[0]) {
                        setAttachmentBlob(e.target.files[0]);
                        setAttachmentName(e.target.files[0].name);
                      }
                    }} />
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-[#1A3C34]">
                      <Smile size={18} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#1A3C34]">
                      <Paperclip size={18} />
                    </button>
                    {audioBlob && (
                      <button onClick={() => sendMessage(audioBlob)} className="p-3 bg-green-600 text-white rounded-xl shadow-lg hover:opacity-90">
                        <Send size={18} />
                      </button>
                    )}
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-xl shadow-lg transition-all ${isRecording ? 'bg-red-600 text-white animate-bounce' : 'bg-gray-200 text-[#1A3C34] hover:bg-gray-300'}`}
                    >
                      {isRecording ? <Square size={18} /> : <Mic size={18} />}
                    </button>
                    <button 
                      onClick={() => sendMessage()}
                      disabled={sendingMsg || (!newMessage.trim() && !audioBlob && !attachmentBlob)}
                      className="p-3 bg-[#1A3C34] text-white rounded-xl hover:opacity-90 disabled:opacity-30 transition-all shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default TrackPage;
