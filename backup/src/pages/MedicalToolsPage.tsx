import React, { useState } from 'react';
import { Calculator, Activity, Scale, DollarSign, FileText } from 'lucide-react';

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
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Activity size={48} className="mx-auto mb-4 text-primary-500" />
              <h3 className="text-xl font-semibold">Drug Dosage Calculator</h3>
              <p className="mt-2 text-gray-600">Coming soon! Calculate precise drug dosages based on patient parameters.</p>
            </div>
          </div>
        );
      
      case 'currency':
        return (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-primary-500" />
              <h3 className="text-xl font-semibold">Medical Currency Converter</h3>
              <p className="mt-2 text-gray-600">Coming soon! Convert medical costs between different currencies.</p>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-primary-500" />
              <h3 className="text-xl font-semibold">Medical PDF Analyzer</h3>
              <p className="mt-2 text-gray-600">Coming soon! Extract and analyze medical information from PDF documents.</p>
            </div>
          </div>
        );
    }
  };

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
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCalculator('gfr')}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                    activeCalculator === 'gfr' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <Calculator size={20} />
                  <span>GFR Calculator</span>
                </button>
                
                <button
                  onClick={() => setActiveCalculator('bmi')}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                    activeCalculator === 'bmi' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <Scale size={20} />
                  <span>BMI Calculator</span>
                </button>
                
                <button
                  onClick={() => setActiveCalculator('dosage')}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                    activeCalculator === 'dosage' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <Activity size={20} />
                  <span>Drug Dosage Calculator</span>
                </button>
                
                <button
                  onClick={() => setActiveCalculator('currency')}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                    activeCalculator === 'currency' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <DollarSign size={20} />
                  <span>Currency Converter</span>
                </button>
                
                <button
                  onClick={() => setActiveCalculator('pdf')}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left ${
                    activeCalculator === 'pdf' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <FileText size={20} />
                  <span>PDF Analyzer</span>
                </button>
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