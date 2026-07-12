import React from 'react';
import { Shield, Lock, EyeOff, Gavel } from 'lucide-react';

const PrivacyPage = ({ t }) => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex p-4 bg-[#1A3C34]/5 rounded-2xl text-[#1A3C34] mb-4">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Privacy Policy', 'Kigera me Gwokko Lwak')}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          How we protect your identity and secure your data in accordance with the 
          <strong> Uganda Data Protection and Privacy Act (2019)</strong>.
        </p>
      </div>

      <div className="grid gap-12">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#1A3C34]">
            <EyeOff size={24} />
            <h2 className="text-2xl font-serif font-bold italic">Anonymity by Design</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The Kole District Corruption Reporting System (CRS) is designed to protect whistleblowers. 
            We do not collect IP addresses, device identifiers, or browser metadata that could be used to 
            trace a report back to an individual. Submission is entirely anonymous unless you choose 
            to provide contact details.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#1A3C34]">
            <Lock size={24} />
            <h2 className="text-2xl font-serif font-bold italic">End-to-End Encryption</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            All messages, voice notes, and evidence uploaded to the platform are encrypted during transmission 
            and at rest. Access to unencrypted data is strictly limited to authorized District Officials 
            and Agency Auditors through secure, audited administrative portals.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#1A3C34]">
            <Gavel size={24} />
            <h2 className="text-2xl font-serif font-bold italic">Whistleblower Protection</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            In compliance with the <strong>Whistleblowers Protection Act (2010)</strong>, any individual 
            who makes a disclosure in good faith through this system is protected from victimization, 
            dismissal, or harassment. Kole District Local Government is committed to upholding these 
            protections for all citizens.
          </p>
        </section>

        <div className="bg-[#FAF9F6] border border-gray-100 p-8 rounded-[2rem] mt-8">
          <h3 className="font-serif font-bold text-lg mb-4">Data Retention</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Reports and related evidence are retained for the duration of the investigation and for 
            a period of 7 years thereafter as required by the National Records and Archives Act. 
            However, any identifying metadata (if provided) is purged immediately after the 
            investigation is closed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
