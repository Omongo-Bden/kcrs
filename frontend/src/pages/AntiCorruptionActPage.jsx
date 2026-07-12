import React from 'react';
import { Landmark, Gavel, FileText, AlertCircle, ShieldCheck, Scale, Info, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AntiCorruptionActPage = ({ t }) => {
  const corruptionTypes = [
    {
      title: t('Embezzlement (Section 19)', 'Kwo Cente me lwak'),
      description: t('A person who steals or diverts any property or money that belongs to their employer or a public body.', 'Ka ngat mo okwal cente me dako.'),
      details: t('This applies to both public and private sector employees. It carries a sentence of up to 14 years.', 'Pire tye me keto lonyo me lwak i ticere.')
    },
    {
      title: t('Bribery (Section 2 & 5)', 'Miya / Jolo Camucana'),
      description: t('Giving or receiving a "kickback" or "gratification" to influence a public action.', 'Miyo cente me wilo tam me adwong.'),
      details: t('Includes offering money to get a contract, a job, or to avoid a fine. Both the giver and the taker are guilty.', 'Oroma cente me miyo tic onyo me loyo bura.')
    },
    {
      title: t('Abuse of Office (Section 11)', 'Tic ki twero i yo marac'),
      description: t('Doing something arbitrary or illegal while using your official power.', 'Tic ki twero me dako i yo me gwenyo cente.'),
      details: t('For example, an official awarding a contract to their own company without following the rules.', 'Nen i yo me miyo tic bot lanyingi onyo wat.')
    },
    {
      title: t('Conflict of Interest (Section 9)', 'Rwenyo kodi tic'),
      description: t('Participating in a decision where you or your family has a private interest.', 'Donyo i tam me tic ka in iye iye wat onyo lanying.'),
      details: t('Officials must declare their interests and step away from decisions that benefit them personally.', 'Adwong tye me miyo tam ma pe luro watere.')
    },
    {
      title: t('Influence Peddling (Section 10)', 'Tic ki nying lwak'),
      description: t('Using your "connections" to get favors for others in exchange for money.', 'Tic ki nying adwong me miyo tic onyo kony.'),
      details: t('Claiming you can influence a Minister or District Head for a fee is a criminal offense.', 'Weco ni iromo konyo ngat mo i dako pi cente.')
    },
    {
      title: t('Diversion of Funds (Section 6)', 'Wilo cente me tic mukene'),
      description: t('Using money meant for one project (e.g. Health) for another (e.g. Travel).', 'Tic ki cente me yat me wilo gari me dako.'),
      details: t('Even if the money is not "stolen", using it for the wrong purpose is illegal under this Act.', 'Kadi bed cente ni pe okwal, tic kede i yo marac ni pe atir.')
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex p-4 bg-[#1A3C34]/5 rounded-3xl text-[#1A3C34] mb-4">
          <Scale size={48} />
        </div>
        <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">
          {t('Legal Framework & Anti-Corruption Laws', 'Cik me Gengo Camucana i Uganda')}
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Understanding your rights and the laws that protect public funds in Kole District.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#1A3C34]">
              <Gavel size={28} />
              <h2 className="text-3xl font-serif font-bold italic">{t('The Anti-Corruption Act, 2009', 'Cik me 2009')}</h2>
            </div>
            <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed">
              <p>
                The <strong>Anti-Corruption Act, 2009</strong> is Uganda's primary weapon against the theft of public resources. 
                It was designed to give the government and citizens the power to identify, report, and punish 
                those who betray the public trust.
              </p>
              <p className="mt-4">
                In Kole District, this law applies to every civil servant, politician, and contractor who handles 
                taxpayer money meant for schools, hospitals, and roads.
              </p>
            </div>
          </section>

          {/* Corruption Types Grid */}
          <section className="space-y-8">
            <h3 className="text-xl font-serif font-bold text-gray-900 border-b pb-4">{t('Defined Corruption Offenses', 'Kodi Camucana ma Cik Gengo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {corruptionTypes.map((type, idx) => (
                <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#1A3C34] mb-6 group-hover:bg-[#1A3C34] group-hover:text-white transition-colors">
                    <Info size={20} />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-gray-900 mb-2">{type.title}</h4>
                  <p className="text-sm font-bold text-[#1A3C34]/80 mb-3">{type.description}</p>
                  <p className="text-xs text-gray-500 leading-relaxed italic">{type.details}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Whistleblower Protection */}
          <section className="bg-gradient-to-br from-[#1A3C34] to-[#2D5A4E] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold">{t('Whistleblowers Protection Act, 2010', 'Cik ma Gengo Lakwor')}</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                You are protected by law. The <strong>Whistleblowers Protection Act (2010)</strong> makes it illegal for anyone 
                to victimize, harass, or dismiss you for reporting corruption in good faith.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {t('Identity Confidentiality', 'Gengo nying ni')}
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {t('Protection from Retaliation', 'Gengo ayela')}
                </div>
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </section>
        </div>

        {/* Sidebar / Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 bg-[#FAF9F6] border border-gray-100 rounded-[2.5rem] space-y-6">
            <h4 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
              <Landmark size={20} className="text-[#1A3C34]" />
              {t('National Context', 'Piny Uganda')}
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Article 17(1)(i)</p>
                <p className="text-xs text-gray-700 font-medium italic">
                  "It is the duty of every citizen of Uganda to combat corruption and misuse or waste of public property."
                </p>
                <p className="text-[9px] font-bold text-[#1A3C34] mt-2">— Constitution of Uganda</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Maximum Penalty</p>
                <p className="text-xs text-gray-700 font-bold">14 Years Imprisonment</p>
                <p className="text-[9px] text-gray-500 mt-1">For embezzlement and serious corruption offenses.</p>
              </div>
            </div>
            <div className="pt-4">
               <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Oversight Bodies</h5>
               <div className="flex flex-col gap-2">
                 {['Inspectorate of Government', 'Police Anti-Corruption Unit', 'State House Anti-Corruption Unit', 'Public Accounts Committee'].map(body => (
                   <div key={body} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                     <div className="w-1 h-1 bg-[#1A3C34] rounded-full"></div>
                     {body}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] space-y-4">
             <AlertCircle size={32} className="text-red-600" />
             <h4 className="font-serif font-bold text-lg text-red-900">{t('Zero Tolerance', 'Cwir cwir')}</h4>
             <p className="text-xs text-red-700 leading-relaxed">
               Kole District operates a <strong>Zero Tolerance Policy</strong>. Every report is taken seriously and 
               handed over to the relevant authorities for investigation.
             </p>
             <Link to="/report" className="block w-full bg-red-600 text-white text-center font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                Report a Violation
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiCorruptionActPage;
