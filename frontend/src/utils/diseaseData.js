export const getDiseaseInfo = (predictionLabel) => {
  const label = predictionLabel.toLowerCase();
  
  if (label.includes('healthy')) {
    return {
      status: 'healthy',
      description: 'Your wheat crop appears to be healthy with no visible signs of disease.',
      severity: 'Low',
      impact: 'Minimal',
      aiExplanation: 'I detected uniform green pigment and smooth leaf surface without any irregular pustules or discoloration patterns typical of fungal growth.',
      maintenance: [
        'Maintain regular watering schedule (1-1.5 inches per week).',
        'Ensure appropriate fertilizer application based on soil tests.',
        'Continue regular monitoring for early signs of pests or diseases.',
        'Keep the field free of weeds to reduce competition.'
      ]
    };
  } else if (label.includes('yellow rust') || label.includes('stripe rust')) {
    return {
      status: 'disease',
      description: 'Yellow Rust (Stripe Rust) detected. This is a highly infectious fungal disease that can severely impact yield if left untreated.',
      severity: 'High',
      impact: 'Severe',
      aiExplanation: 'I identified linear yellow-to-orange stripes formed by uredinia (pustules) along the leaf veins, which is a hallmark signature of yellow rust.',
      maintenance: [
        'Apply an appropriate systemic fungicide (e.g., tebuconazole or propiconazole) immediately.',
        'Spray at 14-21 day intervals if weather conditions remain cool and wet.',
        'Remove and destroy heavily infected plant debris to reduce inoculum.',
        'Ensure balanced nitrogen fertilization (excess nitrogen increases susceptibility).'
      ]
    };
  } else if (label.includes('brown rust') || label.includes('leaf rust')) {
    return {
      status: 'disease',
      description: 'Brown Rust (Leaf Rust) detected. A common fungal disease characterized by small, orange-brown pustules on leaves.',
      severity: 'Medium',
      impact: 'Moderate',
      aiExplanation: 'I flagged scattered, circular-to-oval orange-brown pustules that erupt through the epidermis, primarily on the upper leaf surface.',
      maintenance: [
        'Apply an approved foliar fungicide while improving canopy airflow to protect the upper leaves (especially the flag leaf).',
        'Monitor weather; disease thrives in high humidity and temperatures between 15-22°C.',
        'Practice crop rotation to break the disease cycle.',
        'Destroy volunteer wheat plants before planting the new crop.'
      ]
    };
  } else if (label.includes('septoria')) {
     return {
      status: 'disease',
      description: 'Septoria Leaf Blotch detected. This fungal disease thrives in wet, windy conditions.',
      severity: 'Medium',
      impact: 'Moderate',
      aiExplanation: 'I recognized necrotic, lens-shaped lesions with dark specks (pycnidia) in the center, which are key diagnostic features for Septoria.',
      maintenance: [
        'Apply fungicide early in the season, typically when the flag leaf emerges.',
        'Maintain optimal plant spacing to improve canopy airflow.',
        'Incorporate crop residues into the soil after harvest.',
        'Delay sowing to reduce early exposure to inoculum.'
      ]
     };
  } else {
    // Generic fallback for any other disease
    return {
      status: 'disease',
      description: 'A potential crop issue or disease has been detected. Further diagnosis may be required.',
      severity: 'Medium',
      impact: 'Moderate',
      aiExplanation: 'I detected irregular patterns of chlorosis or necrosis that deviate from typical healthy wheat leaf morphology.',
      maintenance: [
        'Isolate the affected area to prevent spread.',
        'Consult with a local agricultural extension agent or agronomist.',
        'Consider applying a broad-spectrum fungicide as a preventative measure.',
        'Avoid working in the field when plants are wet to minimize spread.'
      ]
    };
  }
};
