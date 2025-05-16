import React, { useState } from 'react';
import { Send, Plus, Brain, X, Clock, ChevronDown, Search, History, Bookmark, MoreVertical } from 'lucide-react';

const ZoneGBTPage: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState('1');
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50">
      <div className="container-custom h-full py-4">
        <div className="flex h-full overflow-hidden rounded-xl bg-white shadow-md">
          {/* Left Sidebar */}
          {showSidebar && (
            <div className="w-72 flex-shrink-0 border-r border-gray-200">
              <div className="p-4">
                <button className="mb-4 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  <div className="flex items-center">
                    <Plus size={16} className="mr-2" />
                    <span>New Conversation</span>
                  </div>
                </button>
                
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations"
                    className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-2 flex items-center justify-between">
                  <button className="flex items-center space-x-1 text-sm font-medium text-gray-600">
                    <History size={14} />
                    <span>Recent</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              
              <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-2">
                <button
                  className={`flex w-full items-start space-x-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 ${
                    activeChatId === '1' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setActiveChatId('1')}
                >
                  <Brain size={18} className="mt-0.5 text-primary-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">Heart Failure Management Protocol</p>
                    <p className="truncate text-sm text-gray-500">Analyzing the latest guidelines for acute treatment</p>
                  </div>
                </button>
                
                <button
                  className={`flex w-full items-start space-x-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 ${
                    activeChatId === '2' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setActiveChatId('2')}
                >
                  <Brain size={18} className="mt-0.5 text-primary-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">Complex Case Analysis</p>
                    <p className="truncate text-sm text-gray-500">48-year-old patient with atypical symptoms</p>
                  </div>
                </button>
                
                <button
                  className={`flex w-full items-start space-x-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 ${
                    activeChatId === '3' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setActiveChatId('3')}
                >
                  <Brain size={18} className="mt-0.5 text-primary-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">Research Paper Draft</p>
                    <p className="truncate text-sm text-gray-500">Help with structuring methods section</p>
                  </div>
                </button>
                
                <button
                  className={`flex w-full items-start space-x-3 rounded-md px-3 py-3 text-left hover:bg-gray-100 ${
                    activeChatId === '4' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setActiveChatId('4')}
                >
                  <Brain size={18} className="mt-0.5 text-primary-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate">Differential Diagnosis</p>
                    <p className="truncate text-sm text-gray-500">Unusual presentation of chest pain</p>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center">
                {!showSidebar && (
                  <button 
                    className="mr-3 rounded-md p-1 text-gray-500 hover:bg-gray-100"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Brain size={20} />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold">Heart Failure Management Protocol</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>Started 2 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                  <Bookmark size={18} />
                </button>
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                  <MoreVertical size={18} />
                </button>
                {showSidebar && (
                  <button 
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="space-y-6">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-3xl rounded-lg bg-primary-500 p-4 text-white">
                    <p>I'm reviewing the latest heart failure management guidelines from the American College of Cardiology. Can you summarize the key changes in the 2025 update compared to the previous version, particularly regarding medication protocols for acute decompensated heart failure?</p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                        <Brain size={18} className="text-purple-600" />
                      </div>
                      <span className="ml-2 font-semibold">ZoneGBT</span>
                    </div>
                    
                    <div className="space-y-3">
                      <p>Here's a summary of the key changes in the 2025 ACC/AHA Heart Failure Guidelines compared to the previous version, specifically regarding medication protocols for acute decompensated heart failure:</p>
                      
                      <h4 className="font-bold text-md">1. Initial Stabilization Phase</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Now recommends a more aggressive upfront diuretic strategy with higher initial doses based on clinical presentation (Class I recommendation, up from Class IIa)</li>
                        <li>Earlier implementation of non-invasive ventilation in patients with pulmonary edema (within first hour)</li>
                        <li>New caution about excessive fluid restriction (&lt;1.5L/day) which received a Class III Harm designation</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">2. Pharmacologic Therapy Updates</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>SGLT2 inhibitors now have a Class I recommendation for initiation during hospitalization (previously Class IIa)</li>
                        <li>Earlier initiation of ARNI therapy (sacubitril/valsartan) is now recommended, with in-hospital initiation receiving a Class I recommendation for eligible patients</li>
                        <li>The guidelines now specify a sequential approach to vasodilator therapy, with clearer thresholds for initiation</li>
                        <li>Specific timelines for medication titration are now provided</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">3. New Therapeutic Additions</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Introduction of selective cardiac myosin activators (omecamtiv mecarbil) as a Class IIb recommendation for specific subgroups</li>
                        <li>Expanded role for soluble guanylate cyclase stimulators (vericiguat) in post-stabilization phase (Class IIa)</li>
                        <li>First-time inclusion of the IL-1 receptor antagonist (anakinra) for patients with elevated inflammatory markers (Class IIb)</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">4. Cardiorenal Syndrome Management</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>New dedicated section on cardiorenal syndrome with specific protocols</li>
                        <li>Sequential nephron blockade strategy detailed with specific timing</li>
                        <li>Lower threshold for ultrafiltration consideration in diuretic resistance (Class IIa, previously IIb)</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">5. Discharge and Transition Planning</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>More stringent requirements for discharge readiness including stability on oral diuretics for at least 24 hours</li>
                        <li>Comprehensive medication reconciliation with patient demonstration of understanding (new Class I recommendation)</li>
                        <li>Follow-up appointment within 7 days now a Class I recommendation (previously 14 days)</li>
                      </ul>
                      
                      <p>The 2025 guidelines place significantly more emphasis on early implementation of disease-modifying therapies and provide more specific, directive recommendations regarding medication timing and dosing compared to previous versions.</p>
                      
                      <p>Would you like me to elaborate on any specific aspect of these changes?</p>
                    </div>
                  </div>
                </div>
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-3xl rounded-lg bg-primary-500 p-4 text-white">
                    <p>Thanks for the comprehensive summary. I'm particularly interested in the SGLT2 inhibitor recommendations. Could you provide more details about the specific dosing, timing, and patient selection criteria in the new guidelines?</p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                        <Brain size={18} className="text-purple-600" />
                      </div>
                      <span className="ml-2 font-semibold">ZoneGBT</span>
                    </div>
                    
                    <div className="space-y-3">
                      <p>Here are the detailed SGLT2 inhibitor recommendations from the 2025 ACC/AHA Heart Failure Guidelines for acute decompensated heart failure management:</p>
                      
                      <h4 className="font-bold text-md">Patient Selection Criteria</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Primary Indication:</span> All patients with HFrEF (LVEF ≤40%) regardless of diabetes status (Class I)</li>
                        <li><span className="font-medium">Extended Indication:</span> Patients with HFmrEF (LVEF 41-49%) regardless of diabetes status (Class IIa)</li>
                        <li><span className="font-medium">New Addition:</span> Selected patients with HFpEF (LVEF ≥50%) with elevated natriuretic peptides or recent hospitalization (Class IIa, new in 2025)</li>
                        <li><span className="font-medium">Contraindications:</span> More clearly defined - eGFR &lt;20 mL/min/1.73m² (previously &lt;30), active ketoacidosis, Type 1 diabetes, pregnancy</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">Timing of Initiation</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Recommended window:</span> Once euvolemia is approached but prior to discharge (ideally 24-48 hours before planned discharge)</li>
                        <li><span className="font-medium">New "opportunity window" concept:</span> Guidelines now emphasize the hospitalization as a critical opportunity for initiation with specific timing recommendations</li>
                        <li><span className="font-medium">Pre-discharge requirement:</span> At least one dose should be administered with monitoring before discharge (new recommendation)</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">Specific Agents and Dosing</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Preferred agents:</span> Dapagliflozin 10mg daily or Empagliflozin 10mg daily (both Class I)</li>
                        <li><span className="font-medium">Alternative agent:</span> Canagliflozin 100mg daily (Class IIa)</li>
                        <li><span className="font-medium">Sotagliflozin:</span> Added as an option for patients with diabetes (Class IIa, new in 2025)</li>
                        <li><span className="font-medium">No dose titration needed:</span> Guidelines specify that unlike other HF medications, SGLT2 inhibitors should be initiated at target dose</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">Renal Considerations (Expanded in 2025)</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Extended renal range:</span> Now recommended for patients with eGFR as low as 20 mL/min/1.73m² (previously 30)</li>
                        <li><span className="font-medium">AKI management:</span> New guidance to continue SGLT2 inhibitors during mild acute kidney injury if closely monitored</li>
                        <li><span className="font-medium">Diuretic interaction:</span> Specific guidance about potential need for diuretic dose adjustment following SGLT2 inhibitor initiation</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">Monitoring Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Initial monitoring:</span> Renal function, electrolytes, and euvolemic status within 1-3 days after first dose (in-hospital)</li>
                        <li><span className="font-medium">Post-discharge:</span> Follow-up laboratory testing within 7-14 days</li>
                        <li><span className="font-medium">Volume status assessment:</span> Special attention to combined effects with other diuretics</li>
                        <li><span className="font-medium">Genital hygiene:</span> New standardized patient education requirements for preventing genital mycotic infections</li>
                      </ul>
                      
                      <h4 className="font-bold text-md">Integration with Other Therapies</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-medium">Quadruple therapy concept:</span> SGLT2 inhibitors now firmly established as the fourth pillar of quadruple therapy along with ARNI/ACEi/ARB, beta-blockers, and MRAs</li>
                        <li><span className="font-medium">Sequencing guidance:</span> Specific recommendations on order of initiation with other medications during hospitalization</li>
                        <li><span className="font-medium">Prioritization:</span> In cases where not all therapies can be initiated before discharge, SGLT2 inhibitors are given priority along with beta-blockers</li>
                      </ul>
                      
                      <p>These updated recommendations reflect the substantial evidence accumulated since the previous guidelines, particularly from trials showing benefit of early in-hospital initiation and extension to broader heart failure populations.</p>
                      
                      <p>Is there anything specific about these SGLT2 inhibitor recommendations you'd like me to elaborate on further?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2">
                  <input
                    type="text"
                    placeholder="Ask ZoneGBT a question..."
                    className="w-full text-sm outline-none"
                  />
                </div>
                <button className="rounded-md bg-primary-500 p-2 text-white hover:bg-primary-600">
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500">
                <span>ZoneGBT may produce inaccurate information. Always verify important medical information.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneGBTPage;