import React from 'react';
import { ClipboardCheck, AlertTriangle, Scale, Info } from 'lucide-react';

const TermsPage = ({ t }) => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex p-4 bg-[#1A3C34]/5 rounded-2xl text-[#1A3C34] mb-4">
          <Scale size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Terms of Use', 'Yoo me Tic kwede')}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Please read these terms carefully before using the Kole District 
          Corruption Reporting System.
        </p>
      </div>

      <div className="grid gap-12">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#1A3C34]">
            <ClipboardCheck size={24} />
            <h2 className="text-2xl font-serif font-bold italic">1. Purpose of the Platform</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            This platform is provided solely for the purpose of reporting suspected corruption, 
            mismanagement of public funds, and administrative malpractice within the jurisdiction 
            of Kole District Local Government.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={24} />
            <h2 className="text-2xl font-serif font-bold italic">2. False Reporting</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Providing false information or making malicious reports with the intent to damage the 
            reputation of an individual is a criminal offense under the <strong>Penal Code Act</strong>. 
            Kole District reserves the right to cooperate with law enforcement to investigate 
            deliberate misuse of this platform.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#1A3C34]">
            <Info size={24} />
            <h2 className="text-2xl font-serif font-bold italic">3. Limitation of Liability</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            While Kole District takes every measure to ensure the security of the platform, we are 
            not liable for any direct or indirect damages resulting from the use or inability 
            to use the system.
          </p>
        </section>

        <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] mt-8">
          <h3 className="font-serif font-bold text-lg text-orange-800 mb-4">Important Notice</h3>
          <p className="text-sm text-orange-700 leading-relaxed">
            By submitting a report, you acknowledge that you are providing information in 
            good faith. You agree that the information provided is accurate to the best of 
            your knowledge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
