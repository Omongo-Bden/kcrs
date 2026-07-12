import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import toast, { Toaster } from "react-hot-toast";
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Mail, Phone, ExternalLink, Moon, Sun, RotateCw, Menu, X } from 'lucide-react';
import api from './api/axios';
import localforage from 'localforage';

const HomePage = lazy(() => import('./pages/HomePage'));
const ReportFormPage = lazy(() => import('./pages/ReportFormPage'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AntiCorruptionActPage = lazy(() => import('./pages/AntiCorruptionActPage'));
const WhistleblowerPage = lazy(() => import('./pages/WhistleblowerPage'));

const App = () => {
  const [lang, setLang] = useState('Eng'); 
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = useCallback((en, luo) => (lang === 'Eng' ? en : luo), [lang]);

  // Background Sync for Offline Reports
  useEffect(() => {
    const base64ToBlob = (base64Data, contentType = 'application/octet-stream') => {
      const byteCharacters = atob(base64Data);
      const sliceSize = 512;
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i += 1) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
    };

    const buildFormData = (report) => {
      const formData = new FormData();

      const appendFile = (file, fieldName) => {
        if (!file) return;
        if (file instanceof Blob) {
          formData.append(fieldName, file, file.name || 'evidence');
        } else if (file.data) {
          const blob = base64ToBlob(file.data, file.type);
          formData.append(fieldName, blob, file.name || 'evidence');
        }
      };

      Object.keys(report).forEach(key => {
        if (key === 'evidence' || key === 'voice_note') {
           appendFile(report[key], key);
        } else if (key === 'additional_evidence' && Array.isArray(report[key])) {
           report[key].forEach(f => appendFile(f, 'additional_evidence'));
        } else if (report[key] !== null && report[key] !== undefined) {
           formData.append(key, report[key]);
        }
      });
      return formData;
    };

    const handleOnline = async () => {
      try {
        const drafts = await localforage.getItem('offline_reports') || [];
        if (drafts.length > 0) {
          console.log('Syncing offline reports...');
          let syncedCount = 0;
          for (const report of drafts) {
            try {
              const formData = buildFormData(report);
              await api.post(`/reports/`, formData);
              syncedCount++;
            } catch (err) {
              console.error('Sync failed for one report', err);
            }
          }
          if (syncedCount > 0) {
             toast(t(`Successfully synced ${syncedCount} offline reports.`, `Ripot ${syncedCount} ma iandiko ka wifi pe otye ni okit i dako amanyun.`));
             // Remove synced reports
             const newDrafts = drafts.slice(syncedCount);
             await localforage.setItem('offline_reports', newDrafts);
          }
        }
      } catch (err) {
        console.error('Error accessing localforage', err);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [t]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A3C34] font-sans flex flex-col">
      <Toaster position="top-right" />
      <div className="bg-[#1A3C34] w-full text-white shadow-lg z-50">
        <header className="w-full px-8 md:px-12 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/90">
              <Shield size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 leading-none mb-1">
                Kole District Local Government
              </span>
              <h1 className="text-xl font-serif font-bold text-white leading-none tracking-tight">
                {t('Corruption Reporting System', 'Yoo me Miya Ripot')}
              </h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className={`${mobileMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-[#1A3C34] p-6 border-t border-white/10 shadow-xl' : 'hidden md:flex'} gap-4 md:gap-8 text-[11px] md:text-[13px] font-semibold tracking-wide py-1`}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${location.pathname === '/' ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white'}`}>{t('Home', 'Paco')}</Link>
              <Link to="/report" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${location.pathname === '/report' ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white'}`}>{t('Report', 'Miyo Ripot')}</Link>
              <Link to="/track" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${location.pathname === '/track' ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white'}`}>{t('Track', 'Lubo Kor')}</Link>
              <Link to="/admin-login" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${location.pathname.startsWith('/admin') ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white'}`}>{t('Admin', 'Adwong')}</Link>
            </nav>
            
            <button 
              className="md:hidden p-2 text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-black/20 rounded-full p-1 border border-white/10">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 rounded-full text-white/60 hover:text-white transition-all"
                  title={t('Toggle Dark Mode', 'Loki idak mod')}
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-1.5 rounded-full text-white/60 hover:text-white transition-all"
                  title={t('Refresh', 'Dwoyo')}
                >
                  <RotateCw size={14} />
                </button>
              </div>

              <div className="flex gap-1 text-[10px] font-bold bg-white/5 p-1 rounded-full border border-white/10">
              <button 
                className={`px-3 py-1.5 rounded-full transition-all ${lang === 'Eng' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                onClick={() => setLang('Eng')}
              >
                EN
              </button>
              <button 
                className={`px-3 py-1.5 rounded-full transition-all ${lang === 'Luo' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                onClick={() => setLang('Luo')}
              >
                LUO
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>

      <main className="max-w-7xl mx-auto px-4 pb-20 w-full">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><RotateCw className="animate-spin text-[#1A3C34]" size={32} /></div>}>
          <Routes>
            <Route path="/" element={<HomePage t={t} />} />
            <Route path="/report" element={<ReportFormPage t={t} />} />
            <Route path="/track" element={<TrackPage t={t} />} />
            <Route path="/admin-login" element={<AdminLogin t={t} />} />
            <Route path="/admin-panel" element={<AdminPage t={t} />} />
            <Route path="/privacy" element={<PrivacyPage t={t} />} />
            <Route path="/terms" element={<TermsPage t={t} />} />
            <Route path="/anti-corruption-act" element={<AntiCorruptionActPage t={t} />} />
            <Route path="/whistleblower-protection" element={<WhistleblowerPage t={t} />} />
          </Routes>
        </Suspense>
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-[#1A3C34]" />
              <h3 className="font-serif font-bold text-xl">Kole District CRS</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              The Corruption Reporting System (CRS) is an official initiative of the Kole District Local Government, 
              designed to promote transparency, accountability, and integrity in public service delivery.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Legal & Privacy</h4>
            <ul className="text-sm space-y-2 font-medium text-gray-600">
              <li><Link to="/anti-corruption-act" className="hover:text-[#1A3C34] transition-colors">Anti-Corruption Act (2009)</Link></li>
              <li><Link to="/privacy" className="hover:text-[#1A3C34] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#1A3C34] transition-colors">Terms of Use</Link></li>
              <li><Link to="/whistleblower-protection" className="hover:text-[#1A3C34] transition-colors">Whistleblower Protection Act</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contact District</h4>
            <div className="text-sm space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#1A3C34]" />
                <span>+256 (0) +256771494379</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#1A3C34]" />
                <span>info@koledistrict.go.ug</span>
              </div>
              <a href="https://koledistrict.go.ug" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#1A3C34] font-bold hover:underline">
                koledistrict.go.ug <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 py-10 border-t border-gray-100">
           <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 text-center mb-6">Partner Agencies & Oversight Bodies</p>
           <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
              <a href="https://www.igg.go.ug" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#1A3C34] hover:opacity-100 transition-opacity flex items-center gap-1">IGG UGANDA <ExternalLink size={10} /></a>
              <a href="https://tiuganda.org" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#1A3C34] hover:opacity-100 transition-opacity flex items-center gap-1">TRANSPARENCY INTERNATIONAL <ExternalLink size={10} /></a>
              <a href="https://accu.or.ug" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#1A3C34] hover:opacity-100 transition-opacity flex items-center gap-1">ACCU UGANDA <ExternalLink size={10} /></a>
              <a href="https://acu.go.ug" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#1A3C34] hover:opacity-100 transition-opacity flex items-center gap-1">STATE HOUSE ACU <ExternalLink size={10} /></a>
              <a href="https://www.ppda.go.ug" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-[#1A3C34] hover:opacity-100 transition-opacity flex items-center gap-1">PPDA <ExternalLink size={10} /></a>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © 2024 Kole District Local Government. All Rights Reserved.
          </p>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Designed by @Omongo Denis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;