import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck, Scale, FileText, AlertTriangle } from 'lucide-react';

const WhistleblowerPage = ({ t }) => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex p-4 bg-[#1A3C34]/5 rounded-3xl text-[#1A3C34] mb-4">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Whistleblower Protection', 'Gengo Ayela me Lakwor')}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Your safety and anonymity are guaranteed by the laws of Uganda.
        </p>
      </div>

      <div className="space-y-12">
        {/* Core Protection Section */}
        <section className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#1A3C34] text-white rounded-2xl shadow-lg">
              <Lock size={24} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">{t('Total Anonymity', 'Nyingi okit maber')}</h2>
          </div>
          <div className="space-y-4 text-gray-600 leading-relaxed relative z-10">
            <p>
              In Kole District, we understand the risks of speaking up. Our system is built with 
              <strong> Privacy by Design</strong>:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                <EyeOff className="text-[#1A3C34] shrink-0" size={18} />
                <span className="text-sm font-medium">No login or registration required to file a report.</span>
              </li>
              <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                <UserCheck className="text-[#1A3C34] shrink-0" size={18} />
                <span className="text-sm font-medium">Your IP address is not tracked or stored in our database.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* The Whistleblowers Protection Act, 2010 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#1A3C34]">
              <FileText size={24} />
              <h3 className="text-2xl font-serif font-bold">{t('The Act (2010)', 'Cik me 2010')}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              The <strong>Whistleblowers Protection Act, 2010</strong> was enacted to protect individuals 
              who disclose information about corruption, misuse of public funds, and other 
              illegal activities.
            </p>
            <div className="p-4 bg-[#FAF9F6] border-l-4 border-[#1A3C34] rounded-r-2xl">
              <p className="text-xs font-bold text-[#1A3C34] italic">
                "No person shall be subjected to any victimization by his or her employer or by 
                any other person for having made a disclosure."
              </p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <h4 className="text-xl font-serif font-bold flex items-center gap-2">
              <Scale size={20} className="text-green-400" />
              Legal Remedies
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              If you face retaliation (e.g. losing your job or being threatened) because of a 
              report made here, you have the right to:
            </p>
            <ul className="space-y-3 text-xs font-bold">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Reinstatement to your job</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Financial compensation</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Protection from the IGG</li>
            </ul>
          </div>
        </div>

        {/* Warning Section */}
        <section className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
           <div className="p-4 bg-red-100 text-red-600 rounded-full">
             <AlertTriangle size={32} />
           </div>
           <div className="space-y-1 text-center md:text-left">
             <h4 className="font-serif font-bold text-red-900 text-lg">Good Faith Reporting</h4>
             <p className="text-sm text-red-700 opacity-80">
               Protection only applies if you believe the information is true. Knowingly filing 
               false reports to damage someone's reputation is an offense under the same Act.
             </p>
           </div>
        </section>

        <div className="pt-10 text-center">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">Ready to proceed?</p>
          <a href="/report" className="inline-block bg-[#1A3C34] text-white px-12 py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all">
             File a Secure Report
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhistleblowerPage;
