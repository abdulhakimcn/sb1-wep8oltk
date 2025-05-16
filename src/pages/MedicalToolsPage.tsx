import React, { useState } from 'react';
import { Calculator, Activity, Scale, DollarSign, FileText, Stethoscope, Thermometer, Heart, Settings as Lungs, Brain, Droplet } from 'lucide-react';

type CalculatorType = 'gfr' | 'dosage' | 'bmi' | 'currency' | 'pdf';

const MedicalToolsPage: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('gfr');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [race, setRace] = useState('non-black');
  const [result, setResult] = useState<number | null>(null);

  const calculateGFR = () => {
    const cr = parseFloat(creatinine);
    const ageNum = parseFloat(age);
    
    if (!cr || !ageNum) return;

    // CKD-EPI equation
    let gfr = 141 * Math.min(cr / 0.9, 1) ** -0.411 * Math.max(cr / 0.9, 1) ** -1.209 * 0.993 ** ageNum;
    
    if (gender === 'female') {
      gfr *= 1.018;
    }
    if (race === 'black') {
      gfr *= 1.159;
    }

    setResult(Math.round(gfr * 100) / 100);
  };

  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (!weightNum || !heightNum) return;

    const bmi = weightNum / ((heightNum / 100) * (heightNum / 100));
    setResult(Math.round(bmi * 10) / 10);
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'gfr':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">GFR Calculator</h3>
            <p className="text-gray-600">Calculate estimated Glomerular Filtration Rate using the CKD-EPI equation.</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age (years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter creatinine"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Race</label>
                <select
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="non-black">Non-Black</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={calculateGFR}
              className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            >
              Calculate GFR
            </button>
            
            {result !== null && (
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <p className="text-lg font-semibold">Estimated GFR: {result} mL/min/1.73m²</p>
                <p className="mt-2 text-sm text-gray-600">
                  {result >= 90 ? 'Normal kidney function' :
                   result >= 60 ? 'Mildly reduced kidney function' :
                   result >= 30 ? 'Moderately reduced kidney function' :
                   result >= 15 ? 'Severely reduced kidney function' :
                   'Kidney failure'}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'bmi':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">BMI Calculator</h3>
            <p className="text-gray-600">Calculate Body Mass Index using weight and height.</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter weight"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter height"
                />
              </div>
            </div>
            
            <button
              onClick={calculateBMI}
              className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            >
              Calculate BMI
            </button>
            
            {result !== null && (
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <p className="text-lg font-semibold">BMI: {result} kg/m²</p>
                <p className="mt-2 text-sm text-gray-600">
                  {result < 18.5 ? 'Underweight' :
                   result < 25 ? 'Normal weight' :
                   result < 30 ? 'Overweight' :
                   'Obese'}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'dosage':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Drug Dosage Calculator</h3>
            <p className="text-gray-600">Calculate medication dosages based on patient parameters.</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Weight (kg)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter weight"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Medication</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select medication</option>
                  <option value="amoxicillin">Amoxicillin</option>
                  <option value="paracetamol">Paracetamol</option>
                  <option value="ibuprofen">Ibuprofen</option>
                  <option value="metformin">Metformin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Renal Function</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="normal">Normal (GFR &gt; 90)</option>
                  <option value="mild">Mild Impairment (GFR 60-89)</option>
                  <option value="moderate">Moderate Impairment (GFR 30-59)</option>
                  <option value="severe">Severe Impairment (GFR 15-29)</option>
                </select>
              </div>
            </div>
            
            <button
              className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            >
              Calculate Dosage
            </button>
            
            <div className="mt-4 rounded-md bg-gray-50 p-4">
              <p className="text-center text-gray-600">Enter patient parameters to calculate recommended dosage</p>
            </div>
          </div>
        );
      
      case 'currency':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Medical Currency Converter</h3>
            <p className="text-gray-600">Convert medical costs between different currencies.</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    className="block w-full pl-7 pr-12 py-2 rounded-md border border-gray-300 focus:border-primary-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">From Currency</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">To Currency</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            
            <button
              className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            >
              Convert
            </button>
            
            <div className="mt-4 rounded-md bg-gray-50 p-4">
              <p className="text-center text-gray-600">Enter amount and select currencies to convert</p>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Medical PDF Analyzer</h3>
            <p className="text-gray-600">Extract and analyze medical information from PDF documents.</p>
            
            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <div className="flex flex-col items-center">
                <FileText size={48} className="text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop a PDF file here, or click to select</p>
                <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600">
                  Select PDF
                </button>
              </div>
            </div>
            
            <div className="mt-4 rounded-md bg-gray-50 p-4">
              <p className="text-center text-gray-600">Upload a medical PDF to extract key information</p>
            </div>
          </div>
        );
    }
  };

  // List of all available tools
  const tools = [
    { id: 'gfr', name: 'GFR Calculator', icon: <Droplet size={20} /> },
    { id: 'bmi', name: 'BMI Calculator', icon: <Scale size={20} /> },
    { id: 'dosage', name: 'Drug Dosage Calculator', icon: <Activity size={20} /> },
    { id: 'currency', name: 'Currency Converter', icon: <DollarSign size={20} /> },
    { id: 'pdf', name: 'PDF Analyzer', icon: <FileText size={20} /> },
    { id: 'heart', name: 'Cardiac Risk Calculator', icon: <Heart size={20} /> },
    { id: 'lung', name: 'Pulmonary Function', icon: <Lungs size={20} /> },
    { id: 'neuro', name: 'Neurological Scales', icon: <Brain size={20} /> },
    { id: 'vitals', name: 'Vital Signs Tracker', icon: <Thermometer size={20} /> },
    { id: 'medical', name: 'Medical Conversions', icon: <Stethoscope size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medical Tools</h1>
          <p className="mt-2 text-gray-600">Essential calculators and tools for medical professionals</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-md">
              <h2 className="mb-4 font-semibold">Available Tools</h2>
              <div className="space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => tool.id === 'gfr' || tool.id === 'bmi' || tool.id === 'dosage' || tool.id === 'currency' || tool.id === 'pdf' 
                      ? setActiveCalculator(tool.id as CalculatorType) 
                      : null}
                    className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                      activeCalculator === tool.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              {renderCalculator()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalToolsPage;