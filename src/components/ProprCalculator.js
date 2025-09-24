import React, { useState } from 'react';

const RectalProlapseCalculator = () => {
  // State for patient data
  const [patientData, setPatientData] = useState({
    age: 50,
    erpLength: 5.0,
    priorSurgery: false,
    rectalFixation: false,
    smisScore: 5,
    bmi: 25
  });

  // State for calculation results
  const [results, setResults] = useState({
    probability: null,
    riskCategory: null,
    showResults: false
  });

  // State for current step in multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Coefficient values from the model
  const coefficients = {
    intercept: -4.1062,
    erpLength: 2.064089,
    priorSurgery: 1.697194,
    smisScore: 0.554364,
    age: 0.156223,
    bmi: -0.481154,
    rectalFixation: -0.553348
  };

  // Means and standard deviations for feature standardization
  const featureStats = {
    age: { mean: 40.13, std: 16.12 },
    erpLength: { mean: 5.05, std: 1.12 },
    smisScore: { mean: 5.21, std: 3.98 },
    bmi: { mean: 23.12, std: 4.56 }
  };

  // Function to handle input changes
  const handleInputChange = (name, value) => {
    setPatientData({
      ...patientData,
      [name]: value
    });
  };

  // Function to handle numeric input changes
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : (parseFloat(value) || 0);
    setPatientData({
      ...patientData,
      [name]: numValue
    });
  };

  // Function to standardize a feature value
  const standardize = (value, mean, std) => {
    return (value - mean) / std;
  };

  // Function to calculate recurrence probability
  const calculateProbability = () => {
    // Make sure all inputs are numbers before calculation
    const age = typeof patientData.age === 'string' ? parseFloat(patientData.age) || 0 : patientData.age;
    const erpLength = typeof patientData.erpLength === 'string' ? parseFloat(patientData.erpLength) || 0 : patientData.erpLength;
    const smisScore = typeof patientData.smisScore === 'string' ? parseFloat(patientData.smisScore) || 0 : patientData.smisScore;
    const bmi = typeof patientData.bmi === 'string' ? parseFloat(patientData.bmi) || 0 : patientData.bmi;
    
    // Standardize continuous features
    const standardizedAge = standardize(age, featureStats.age.mean, featureStats.age.std);
    const standardizedERP = standardize(erpLength, featureStats.erpLength.mean, featureStats.erpLength.std);
    const standardizedSMIS = standardize(smisScore, featureStats.smisScore.mean, featureStats.smisScore.std);
    const standardizedBMI = standardize(bmi, featureStats.bmi.mean, featureStats.bmi.std);

    // Calculate linear predictor
    const linearPredictor = 
      coefficients.intercept + 
      (coefficients.age * standardizedAge) +
      (coefficients.erpLength * standardizedERP) +
      (coefficients.priorSurgery * (patientData.priorSurgery ? 1 : 0)) +
      (coefficients.rectalFixation * (patientData.rectalFixation ? 1 : 0)) +
      (coefficients.smisScore * standardizedSMIS) +
      (coefficients.bmi * standardizedBMI);

    // Convert to probability using logistic function
    const probability = 1 / (1 + Math.exp(-linearPredictor));
    
    // Determine risk category
    let riskCategory;
    if (probability < 0.15) {
      riskCategory = "Low Risk";
    } else if (probability < 0.40) {
      riskCategory = "Moderate Risk";
    } else {
      riskCategory = "High Risk";
    }

    return {
      probability,
      riskCategory
    };
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const result = calculateProbability();
    setResults({
      probability: result.probability,
      riskCategory: result.riskCategory,
      showResults: true
    });
  };

  // Function to go to the next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // If on last step, calculate results
      const result = calculateProbability();
      setResults({
        probability: result.probability,
        riskCategory: result.riskCategory,
        showResults: true
      });
    }
  };

  // Function to go to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to reset calculator
  const resetCalculator = () => {
    setPatientData({
      age: 50,
      erpLength: 5.0,
      priorSurgery: false,
      rectalFixation: false,
      smisScore: 5,
      bmi: 25
    });
    setResults({
      probability: null,
      riskCategory: null,
      showResults: false
    });
    setCurrentStep(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-500 p-5 text-white shadow-md">
        <div className="container mx-auto flex items-center">
          <div className="flex items-center">
            {/* Logo - Rectal Prolapse Image */}
            <div className="w-14 h-14 rounded-full bg-white p-1 mr-4 flex items-center justify-center overflow-hidden">
                <img 
                    src={process.env.PUBLIC_URL + '/prolapse-logo.jpg'} 
                    alt="Rectal Prolapse" 
                    className="w-12 h-12 object-cover rounded-full" 
                />
            </div>         
               {/* <div className="w-14 h-14 rounded-full bg-white p-1 mr-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-12 h-12">
                <defs>
                  <clipPath id="circleView">
                    <circle cx="50" cy="50" r="40" />
                  </clipPath>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#f0f0f0" />
                <g clipPath="url(#circleView)">
                  <ellipse cx="50" cy="55" rx="35" ry="45" fill="#f8d0c4" />
                  <ellipse cx="50" cy="55" rx="28" ry="40" fill="#ea9a8f" />
                  <ellipse cx="50" cy="50" rx="22" ry="30" fill="#d04c4c" stroke="#991f1f" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="18" ry="25" fill="#d04c4c" stroke="#991f1f" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="14" ry="20" fill="#d04c4c" stroke="#991f1f" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="10" ry="15" fill="#d04c4c" stroke="#991f1f" strokeWidth="1" />
                  <ellipse cx="50" cy="50" rx="6" ry="10" fill="#d04c4c" stroke="#991f1f" strokeWidth="1" />
                  <circle cx="50" cy="50" r="4" fill="#000" />
                  <path d="M48 50 L52 50 M50 48 L50 52" stroke="#000" strokeWidth="1" />
                </g>
              </svg>
            </div> */}
            <div>
              <h1 className="text-2xl font-bold">PROPR</h1>
              <p className="text-sm opacity-90">PRedictor of rectal Prolapse Recurrance</p>
            </div>
          </div>
          <div className="ml-auto hidden md:flex items-center space-x-2 text-sm bg-teal-800 rounded px-3 py-1">
            <span className="font-bold">AUC: 0.962</span>
            <div className="h-4 border-r border-teal-300"></div>
            <span className="font-bold">Bootstrap Validated</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Progress bar */}
            {!results.showResults && (
              <div className="bg-gray-100 p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          
            {!results.showResults ? (
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-teal-800 border-b pb-2">
                  {currentStep === 1 ? "Patient Demographics" : 
                   currentStep === 2 ? "Clinical Assessment" : 
                   "Surgical History"}
                </h2>
                
                {/* Step 1: Demographics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Age */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="age"
                            value={patientData.age}
                            onChange={handleNumericChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                      
                      {/* BMI */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BMI (kg/m²)</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="bmi"
                            value={patientData.bmi}
                            onChange={handleNumericChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-sm font-semibold text-blue-800 mb-2">Impact on Recurrence Risk</h3>
                      <ul className="text-sm text-blue-800 space-y-1 pl-5 list-disc">
                        <li>Older age is associated with increased recurrence risk</li>
                        <li>Lower BMI is associated with increased recurrence risk</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Clinical Assessment */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* ERP Length */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">External Rectal Prolapse Length (cm)</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="erpLength"
                            value={patientData.erpLength}
                            onChange={handleNumericChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                      
                      {/* SMIS Score */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preoperative SMIS Score</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="smisScore"
                            value={patientData.smisScore}
                            onChange={handleNumericChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">Valid range: 0-24</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-sm font-semibold text-blue-800 mb-2">Clinical Parameters Information</h3>
                      <ul className="text-sm text-blue-800 space-y-1 pl-5 list-disc">
                        <li>Longer prolapse is a strong predictor of recurrence</li>
                        <li>SMIS (St. Mark's Incontinence Score) measures fecal incontinence severity</li>
                        <li>Higher SMIS scores indicate worse incontinence and higher recurrence risk</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Surgical History */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Prior Surgery */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">History of Rectal Prolapse Surgery</label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${patientData.priorSurgery ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          onClick={() => handleInputChange('priorSurgery', true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${!patientData.priorSurgery ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          onClick={() => handleInputChange('priorSurgery', false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    
                    {/* Rectal Fixation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rectal Fixation</label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${patientData.rectalFixation ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          onClick={() => handleInputChange('rectalFixation', true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${!patientData.rectalFixation ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          onClick={() => handleInputChange('rectalFixation', false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Risk Factors</h3>
                      <ul className="text-sm text-yellow-800 space-y-1 pl-5 list-disc">
                        <li><strong>Previous rectal prolapse surgery</strong> is the strongest predictor (OR 3.64, p&lt;0.001)</li>
                        <li>Patients with prior surgery have 11.6x higher recurrence risk</li>
                        <li>Rectal fixation provides a protective effect against recurrence</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </button>
                  
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      Calculate Risk
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Risk Assessment Results</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-700">Recurrence Probability</h3>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                      <div className="text-4xl font-bold text-teal-700 mb-4">
                        {(results.probability * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="h-3 rounded-full" 
                          style={{ 
                            width: `${Math.min(results.probability * 100, 100)}%`,
                            backgroundColor: results.probability < 0.15 ? '#10B981' : results.probability < 0.4 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between w-full text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-700">Risk Category</h3>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                      <div className={`text-2xl font-bold mb-4 ${
                        results.riskCategory === 'Low Risk' ? 'text-green-600' : 
                        results.riskCategory === 'Moderate Risk' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {results.riskCategory}
                      </div>
                      {/* Removed expected recurrence rate */}
                    </div>
                  </div>
                </div>
                
                <div className={`p-5 rounded-lg ${
                  results.riskCategory === 'Low Risk' ? 'bg-green-50 border border-green-200' : 
                  results.riskCategory === 'Moderate Risk' ? 'bg-amber-50 border border-amber-200' : 
                  'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-3 ${
                    results.riskCategory === 'Low Risk' ? 'text-green-800' : 
                    results.riskCategory === 'Moderate Risk' ? 'text-amber-800' : 
                    'text-red-800'
                  }`}>
                    Clinical Recommendations
                  </h3>
                  <div className={`text-sm ${
                    results.riskCategory === 'Low Risk' ? 'text-green-700' : 
                    results.riskCategory === 'Moderate Risk' ? 'text-amber-700' : 
                    'text-red-700'
                  }`}>
                    {results.riskCategory === 'Low Risk' && (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Standard postoperative follow-up protocol</li>
                        <li>Routine pelvic floor physiotherapy</li>
                        <li>Any surgical approach may be appropriate</li>
                        <li>Regular monitoring at standard intervals</li>
                      </ul>
                    )}
                    {results.riskCategory === 'Moderate Risk' && (
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Enhanced follow-up protocol (more frequent in first year)</li>
                        <li>Consider abdominal approach over perineal approach</li>
                        <li>Intensive pelvic floor physiotherapy</li>
                        <li>Early investigation of symptoms suggesting recurrence</li>
                      </ul>
                    )}
                    {results.riskCategory === 'High Risk' && (
                      <ul className="list-disc space-y-1 pl-5">
                        <li><strong>Strongly prefer abdominal approach with mesh reinforcement</strong></li>
                        <li>Perineal approach has 59.1% recurrence rate vs 5.6% for abdominal</li>
                        <li>Intensive follow-up protocol with early imaging</li>
                        <li>Pre-emptive referral to specialized colorectal center for recurrence</li>
                        <li>Clear patient counseling regarding high recurrence risk</li>
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Patient Data Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">Age:</span> {patientData.age} years
                    </div>
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">BMI:</span> {patientData.bmi} kg/m²
                    </div>
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">ERP Length:</span> {patientData.erpLength} cm
                    </div>
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">SMIS Score:</span> {patientData.smisScore}
                    </div>
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">Prior Surgery:</span> {patientData.priorSurgery ? 'Yes' : 'No'}
                    </div>
                    <div className="px-3 py-2 bg-white rounded border border-gray-100">
                      <span className="text-gray-500">Rectal Fixation:</span> {patientData.rectalFixation ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={resetCalculator}
                    className="px-4 py-2 border border-teal-600 text-teal-600 font-medium rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Calculate Another
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Print Results
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Model information */}
          <div className="mt-6 bg-white rounded-lg shadow p-5 text-sm">
            <h3 className="font-medium text-gray-800 mb-3">About the PROPR Calculator</h3>
            <p className="text-gray-600 mb-3">
              This calculator implements a validated predictive model for rectal prolapse recurrence risk after surgery. 
              The model was developed using data from 132 patients with bootstrap validation (AUC 0.962, 95% CI: 0.935-0.987).
            </p>
            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="bg-teal-50 p-3 rounded">
                <h4 className="font-medium text-teal-800 mb-1">Model Performance</h4>
                <div className="text-teal-700 space-y-1">
                  <div className="flex justify-between">
                    <span>AUC:</span>
                    <span>0.962</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sensitivity:</span>
                    <span>90.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specificity:</span>
                    <span>95.5%</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              This calculator is intended as a clinical decision support tool. Clinical judgment should always supersede calculator recommendations.
            </p>
            <p className="text-xs text-gray-700 mt-3 font-medium">
              Developed by Gaurav Shah, IIT Gandhinagar, India. Julie Shah, KGMU, India.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-teal-900 text-white py-4">
        <div className="container mx-auto px-5 text-center text-sm">
          <p>© {new Date().getFullYear()} PROPR: PRedictor of rectal Prolapse Recurrence</p>
          <p className="text-teal-200 text-xs mt-1">
            Based on research using data from patients with rectal prolapse surgery.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RectalProlapseCalculator;