import React, { useState } from 'react';
import toast from "react-hot-toast";
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Upload, Copy, CheckCircle2, Info, AlertTriangle, ArrowRight, X, FileText, Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import localforage from 'localforage';

const ReportFormPage = ({ t }) => {
  const [formData, setFormData] = useState({ 
    report_type: '', 
    location: '', 
    description: '',
    program: '',
    incident_date: ''
  });
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith('image/')) {
          try {
            return await imageCompression(file, options);
          } catch (error) {
            console.error('Compression error:', error);
            return file;
          }
        }
        return file;
      })
    );

    setEvidenceList(prev => [...prev, ...compressedFiles]);
  };

  const removeFile = (index) => {
    setEvidenceList(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Primary evidence (first one)
    if (evidenceList.length > 0) {
      const file = evidenceList[0];
      data.append('evidence', file, file.name || 'evidence.jpg');
    }
    
    // Additional evidence
    evidenceList.slice(1).forEach((file, index) => {
      data.append('additional_evidence', file, file.name || `evidence_${index+1}.jpg`);
    });

    if (!navigator.onLine) {
      const drafts = await localforage.getItem('offline_reports') || [];
      const serializedEvidence = await Promise.all(
        evidenceList.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
        }))
      );

      drafts.push({
        ...formData,
        evidenceList: serializedEvidence,
      });
      await localforage.setItem('offline_reports', drafts);
      toast(t('Offline: Your report has been saved locally. It will be sent automatically when you have internet.', 'I pe ki wifi: Ripot ma iandiko ni okit i dako. Abigole amanyun ka wifi otye.'));
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(`/reports/`, data);
      setSuccessData(res.data);
      setFormData({ report_type: '', location: '', description: '', program: '', incident_date: '' });
      setEvidenceList([]);
    } catch (err) {
      let message = err.message || t('Error: Connection failed. Please try again.', 'Rweny: Pe itye ki wifi. Tem kede dok iinget.');
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.detail) {
          message = err.response.data.detail;
        } else {
          message = JSON.stringify(err.response.data);
        }
      }
      toast(message);
    } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(successData.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = successData.tracking_id;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast("Failed to copy. Please select the text and copy manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500 text-center bg-white border border-gray-100 shadow-xl rounded-[2rem] p-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">{t('Report Submitted Successfully', 'Adot Ocwalere Maber')}</h3>
        <p className="text-gray-500 mb-10 text-lg">
          {t('Please save your tracking ID and download your receipt for future updates.', 'Gwok namba me yenyo canni me neno kit ma tic tye ka wot kwede.')}
        </p>
        
        <div className="bg-[#FAF9F6] border border-gray-200 rounded-3xl p-8 space-y-6 mb-10 shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Tracking ID</span>
            <div className="text-4xl font-mono font-bold tracking-widest text-[#1A3C34] select-all cursor-text">
              {successData.tracking_id}
            </div>
            <button 
              onClick={copyToClipboard}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1A3C34] bg-white border border-gray-200 px-6 py-2 rounded-full hover:bg-gray-50 transition-all shadow-sm"
            >
              {copied ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={16}/> Copied!</span> : <><Copy size={16}/> Copy to Clipboard</>}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-[#1A3C34] text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 shadow-lg">
            <Download size={18} /> {t('Download Receipt', 'Yabu Kakaba')}
          </button>
          <button onClick={() => setSuccessData(null)} className="flex-1 bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">
            {t('Submit Another', 'Cwala Adot Mukene')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-20">
      
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Submit an Anonymous Report', 'Miyo Ripot ma pe Nyuut Nying')}
        </h1>
        <p className="text-gray-500">
          {t('Your identity is never recorded. No IP address, name, or personal data is collected.', 'Pe kigwokko nyinge. Pe ki yeny kabilo ni onyo ngo.')}
        </p>
      </div>

      <div className="bg-[#EBF5F1] border-l-4 border-[#1A3C34] rounded-r-2xl p-6 flex gap-4 shadow-sm">
        <Info className="text-[#1A3C34] flex-shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="font-bold text-[#1A3C34]">{t('Your identity is fully protected.', 'Nyingi tye mager.')}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('This system does not require login, registration, or any personal details. Anonymous reporting is guaranteed by design.', 'Ticci pe yenyu nying, kabilo onyo gin mukene. Adot ma pe nyutu nying tye maber.')}
            <Link to="/whistleblower-protection" className="block mt-2 text-xs font-bold text-[#1A3C34] hover:underline">
               → {t('Learn about your legal protection', 'Nen kit me gengo ayela bot lakwor')}
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] p-10 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">Incident Details</span>
          <div className="h-[1px] w-full bg-gray-100"></div>
        </div>

        <form id="report-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">{t('Type of Corruption *', 'Kit camucana *')}</label>
              <select 
                required
                name="report_type" value={formData.report_type} onChange={(e) => setFormData({...formData, report_type: e.target.value})}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all appearance-none"
                style={{backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0/0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em'}}
              >
                <option value="" disabled>{t('Select type...', 'Yer kit camucana...')}</option>
                <option value="bribery">{t('Bribery', 'Camucana / Cora')}</option>
                <option value="embezzlement">{t('Embezzlement', 'Kwo me cente lwak')}</option>
                <option value="abuse_office">{t('Abuse of Office', 'Tic marac ki loc')}</option>
                <option value="influence_peddling">{t('Influence Peddling', 'Tic ki nying adwong')}</option>
                <option value="nepotism">{t('Nepotism / Favoritism', 'Miyo tic bot lanying / wat')}</option>
                <option value="ghost_beneficiaries">{t('Ghost Beneficiaries', 'Nying lutic ma pe tye')}</option>
                <option value="extortion">{t('Extortion / Demands', 'Gwenyo cente ki bit')}</option>
                <option value="diversion_funds">{t('Diversion of Funds', 'Tic ki cente yo mukene')}</option>
                <option value="conflict_interest">{t('Conflict of Interest', 'Rwenyo kodi tic')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">{t('Sub-County *', 'Sub-County *')}</label>
              <select 
                required
                name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all appearance-none"
                style={{backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0/0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em'}}
              >
                <option value="" disabled>{t('Select sub-county...', 'Yer sub-county...')}</option>
                <option value="Aboke">Aboke</option>
                <option value="Alito">Alito</option>
                <option value="Akalo">Akalo</option>
                <option value="Ayer">Ayer</option>
                <option value="Bala">Bala</option>
                <option value="Okwerodot">Okwerodot</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">{t('Government Program', 'Program me Gamente')}</label>
              <select 
                name="program" value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all appearance-none"
                style={{backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0/0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em'}}
              >
                <option value="">{t('Select if applicable...', 'Yer ka tye...')}</option>
                <option value="PDM">{t('Parish Development Model (PDM)', 'PDM')}</option>
                <option value="Emyooga">{t('Emyooga', 'Emyooga')}</option>
                <option value="UWEP">{t('Uganda Women Entrepreneurship Program (UWEP)', 'UWEP')}</option>
                <option value="YLP">{t('Youth Livelihood Program (YLP)', 'YLP')}</option>
                <option value="SAGE">{t('Social Assistance Grants (SAGE)', 'SAGE')}</option>
                <option value="NUSAF">{t('NUSAF / DRDIP', 'NUSAF / DRDIP')}</option>
                <option value="Health">{t('Health Services / Medicines', 'Yat / Tic me Yotkom')}</option>
                <option value="Education">{t('Education / School Construction', 'Tic me Skul')}</option>
                <option value="Roads">{t('Road Construction / Maintenance', 'Yoo')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">{t('Approximate Date', 'Nino dwe matye iye')}</label>
              <input 
                type="date" 
                name="incident_date" value={formData.incident_date} onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{t('Description of Incident *', 'Kit ma gin matime onongo tye kwede *')}</label>
            <textarea 
              placeholder={t('Describe what happened in detail...', 'Tit ngo matime maber...')} 
              rows="5"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
              className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-[#1A3C34] outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">{t('Evidence Upload (Up to 5 files)', 'Keto gin ma nyuto (Nino 5)')}</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload Trigger */}
              {evidenceList.length < 5 && (
                <div className="bg-[#FAF9F6] border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1A3C34] transition-all cursor-pointer relative group">
                  <input 
                      type="file" 
                      multiple
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  />
                  <div className="space-y-2 relative z-10 flex flex-col items-center">
                    <Upload size={24} className="text-gray-400 group-hover:text-[#1A3C34] transition-colors" />
                    <div className="text-gray-600 font-medium text-sm">{t('Add Files', 'Medo Waraga')}</div>
                  </div>
                </div>
              )}

              {/* File Previews */}
              {evidenceList.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-in zoom-in-95">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-[#1A3C34]/5 rounded-lg flex items-center justify-center text-[#1A3C34]">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 p-2">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-[#FEF3F2] border-l-4 border-[#B42318] rounded-r-2xl p-6 flex gap-4 shadow-sm">
        <AlertTriangle className="text-[#B42318] flex-shrink-0" size={24} />
        <p className="text-sm text-[#B42318] leading-relaxed font-medium">
          {t('Filing a false report is a criminal offence. Please ensure all information is truthful.', 'Cwala ripot ma goba tye mada i lwore me Uganda.')}
        </p>
      </div>

      <div className="flex items-center justify-end gap-6 pt-4">
        <p className="text-sm text-gray-400 italic">Review within 5 working days</p>
        <button 
          form="report-form"
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#1A3C34] text-white font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all cursor-pointer shadow-xl disabled:opacity-50"
        >
          {loading ? t('Processing...', 'Cing...') : <><ArrowRight size={20} /> {t('Submit Anonymously', 'Cwala ma pe Nyinge')}</>}
        </button>
      </div>

    </div>
  );
};

export default ReportFormPage;
