import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import api, { getMediaUrl } from '../api/axios';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  TrendingUp, 
  Landmark, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Globe,
  ClipboardList,
  PhoneCall,
  Clock,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = ({ t }) => {
  const [stories, setStories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState({ total_reports: 0, resolved_cases: 0, recovered_funds: '0', accountability_actions: 0 });
  const [showFAQ, setShowFAQ] = useState(false);
  const [showImpacts, setShowImpacts] = useState(true); // Default to true for professional look
  const [audioConfig, setAudioConfig] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

    if (audioConfig) {
      const sourceKey = lang === 'Eng' ? 'english_source' : 'luo_source';
      const source = audioConfig[sourceKey];
      
      if (source === 'uploaded_file') {
        const fileUrl = lang === 'Eng' ? audioConfig.english_audio_file : audioConfig.luo_audio_file;
        if (fileUrl) {
           const audio = new Audio(getMediaUrl(fileUrl));
           audioRef.current = audio;
           audio.onended = () => setIsPlaying(false);
           setIsPlaying(true);
           audio.play();
           return;
        }
      } else if (source === 'url') {
        const url = lang === 'Eng' ? audioConfig.english_audio_url : audioConfig.luo_audio_url;
        if (url) {
           const audio = new Audio(url);
           audioRef.current = audio;
           audio.onended = () => setIsPlaying(false);
           setIsPlaying(true);
           audio.play();
           return;
        }
      }
    }

    let text = "";
    if (audioConfig) {
      text = lang === 'Eng' ? audioConfig.english_text : audioConfig.luo_text;
    } else {
      // Fallback
      if (lang === 'Eng') {
        text = "Welcome to the Kole District Corruption Reporting System. To report an incident, click the Report Now button.";
      } else {
        text = "Iandiko bot Atur Kole me gengo camucana. Ka iandiko ripot mo, duku butun ma owaco ni Miyo Adot.";
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'Eng' ? 'en-US' : 'sw-KE'; 
    utterance.onend = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get(`/success-stories/`);
        setStories(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to fetch success stories');
      }
    };
    const fetchFaqs = async () => {
      try {
        const res = await api.get(`/faqs/`);
        setFaqs(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to fetch FAQs');
      }
    };
    const fetchStats = async () => {
      try {
        const res = await api.get(`/stats/`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    };
    const fetchAudioConfig = async () => {
      try {
        const res = await api.get(`/audio-guide/`);
        if (res.data.length > 0) setAudioConfig(res.data[0]);
      } catch (err) {
        console.error('Failed to fetch audio config');
      }
    };
    fetchStories();
    fetchFaqs();
    fetchStats();
    fetchAudioConfig();
  }, []);

  return (
    <div className="space-y-8 py-4 px-4 sm:px-6 lg:px-8">
      
      {/* ultra-Compact Integrated Green Hero Card - Optimized Width */}
      <section className="relative animate-in fade-in slide-in-from-top-4 duration-700 max-w-6xl mx-auto">
        <div className="bg-[#1A3C34] rounded-[1.5rem] p-6 md:p-10 text-white shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
          
          <div className="relative z-10 space-y-8">
            {/* Header Content - Compact */}
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">
                {t('Kole District — Northern Uganda', 'Atur Kole — Uganda me Anyat')}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight leading-tight">
                {t('Report Corruption. Protect Your Community.', 'Miyo Adot me Camucana. Gwok Paco ni.')}
              </h1>
              <p className="text-white/50 text-xs max-w-2xl leading-relaxed">
                {t('A secure, anonymous platform for citizens of Kole District to report corruption and track progress.', 'Yoo ma nyinge pe nyutte me miyo adot me camucana i Atur Kole.')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-white/5">
              <div className="space-y-1">
                <p className="text-[7px] font-bold uppercase tracking-widest text-white/30">Total Reports</p>
                <p className="text-xl font-serif font-bold">{stats.total_reports}</p>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <p className="text-[7px] font-bold uppercase tracking-widest text-white/30">Resolved</p>
                <p className="text-xl font-serif font-bold text-green-400">{stats.resolved_cases}</p>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <p className="text-[7px] font-bold uppercase tracking-widest text-white/30">Recovered Funds</p>
                <p className="text-xl font-serif font-bold text-orange-400">{stats.recovered_funds}</p>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <p className="text-[7px] font-bold uppercase tracking-widest text-white/30">Actions</p>
                <p className="text-xl font-serif font-bold">{stats.accountability_actions}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Submit Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white mb-4">
                  <ClipboardList size={16} />
                </div>
                <h3 className="text-sm font-serif font-bold mb-1">{t('Submit a Report', 'Miyo Adot')}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed mb-4">
                  {t('Report bribery or ghost beneficiaries anonymously.', 'Miyo adot ma pe nyutu nying me camucana.')}
                </p>
                <Link to="/report" className="inline-flex items-center gap-1.5 bg-white text-[#1A3C34] px-4 py-2 rounded-lg font-bold text-[9px] hover:bg-gray-100 transition-all">
                  {t('Report Now', 'Miyo Adot')} <ArrowRight size={12} />
                </Link>
              </div>

              {/* Track Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white mb-4">
                  <Search size={16} />
                </div>
                <h3 className="text-sm font-serif font-bold mb-1">{t('Track Your Case', 'Lubo Kor Ripot')}</h3>
                <p className="text-[10px] text-white/40 leading-relaxed mb-4">
                  {t('See status updates and investigator notes on your report.', 'Neno kit ma yeny tye ka wot kwede.')}
                </p>
                <Link to="/track" className="inline-flex items-center gap-1.5 border border-white/30 text-white px-4 py-2 rounded-lg font-bold text-[9px] hover:bg-white/10 transition-all">
                  {t('Track Case', 'Lubo Kor Ripot')} <ArrowRight size={12} />
                </Link>
              </div>

              {/* Other Channels Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white mb-4">
                  <PhoneCall size={16} />
                </div>
                <h3 className="text-sm font-serif font-bold mb-1">{t('Other Channels', 'Yoo Mukene')}</h3>
                <div className="flex justify-between gap-2 mt-2">
                  <div>
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">IGG Hotline</p>
                    <p className="text-xs font-bold">0800-133133</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">State House</p>
                    <p className="text-[10px] font-bold text-white/60">0800-100100</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Pill Badges */}
            <div className="pt-4 flex flex-wrap gap-3 border-t border-white/5">
              {[
                { icon: <Shield size={12}/>, label: t('100% Anonymous', 'Pe Nyuto Nying') },
                { icon: <Lock size={12}/>, label: t('End-to-End Encrypted', 'Kigera ma kigwokko') },
                { icon: <Clock size={12}/>, label: t('Real-Time Case Tracking', 'Lubo Kor-re Oyot') },
                { icon: <Globe size={12}/>, label: t('English & Luo', 'Lengo & Luo') }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest text-white/60">
                  {badge.icon}
                  {badge.label}
                </div>
              ))}
            </div>

            {/* Subtle Audio Guide Button */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 group/audio">
              <div className="flex gap-2 opacity-0 group-hover/audio:opacity-100 transition-all transform translate-x-4 group-hover/audio:translate-x-0">
                <button 
                  onClick={() => playInstruction('Eng')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white transition-all"
                >
                  EN
                </button>
                <button 
                  onClick={() => playInstruction('Luo')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white transition-all"
                >
                  LUO
                </button>
              </div>
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isPlaying ? 'bg-orange-500 border-orange-400 animate-pulse' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                title={t('Listen to Guide', 'Winy kit me tic')}
              >
                {isPlaying ? <Pause size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Toggles Container - Optimized Max-Width */}
      <div className="max-w-4xl mx-auto space-y-3 pt-2">
        
        {/* FAQ Toggle */}
        <button 
          onClick={() => setShowFAQ(!showFAQ)}
          className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#1A3C34]/5 rounded-lg text-[#1A3C34]">
              <AlertCircle size={16} />
            </div>
            <h3 className="text-sm font-serif font-bold text-gray-900">{t('Common Questions', 'Apeny ma Pol')}</h3>
          </div>
          {showFAQ ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showFAQ && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            {faqs.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl">
                <h4 className="text-xs font-serif font-bold text-gray-900 mb-1">{item.question}</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-xl text-center text-[10px] text-gray-400 italic">
                No FAQs available yet.
              </div>
            )}
          </div>
        )}

        {/* Impacts Toggle */}
        <button 
          onClick={() => setShowImpacts(!showImpacts)}
          className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#1A3C34]/5 rounded-lg text-[#1A3C34]">
              <Award size={16} />
            </div>
            <h3 className="text-sm font-serif font-bold text-gray-900">{t('Recent Impacts', 'Ngo ma watimo')}</h3>
          </div>
          {showImpacts ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showImpacts && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-2">
            <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#EBF5F1] rounded-full -mr-24 -mt-24 opacity-50"></div>
              
              <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
                <div className="lg:w-1/3 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A3C34]/5 rounded-full text-[#1A3C34] border border-[#1A3C34]/10">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Metrics</span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                    {t('Our Collective Impact', 'Kit ma ticci okonyo kwede')}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Every report filed contributes to a more transparent Kole District. Here is what we have achieved together.
                  </p>
                  
                  <div className="pt-4 flex flex-col gap-3">
                    <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total Recovered</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-serif font-bold text-[#1A3C34]">24.8M</p>
                        <span className="text-[10px] font-bold text-gray-400">UGX</span>
                      </div>
                    </div>
                    <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Accountability Actions</p>
                      <p className="text-2xl font-serif font-bold text-[#1A3C34]">18</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-2/3 w-full">
                  <div className="flex gap-4 overflow-x-auto pb-6 pr-4 custom-scrollbar snap-x">
                    {stories.map((story) => (
                      <div key={story.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all border-b-4 border-b-[#1A3C34] flex flex-col justify-between h-[220px]">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#1A3C34] bg-[#1A3C34]/5 px-2 py-1 rounded-md">
                              {story.location}
                            </span>
                            <Award size={16} className="text-orange-400" />
                          </div>
                          <h4 className="text-base font-serif font-bold text-gray-900 mb-2 leading-tight">{story.title}</h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 italic">{story.description}</p>
                        </div>
                        {story.impact_amount && (
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-600" />
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">{story.impact_amount}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {stories.length === 0 && (
                      <div className="w-full h-[220px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-400 text-xs italic">
                        No success stories yet. Your report could be next.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-1 w-8 bg-[#1A3C34] rounded-full"></div>
                    <div className="h-1 w-2 bg-gray-200 rounded-full"></div>
                    <div className="h-1 w-2 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>

    </div>
  );
};

export default HomePage;
