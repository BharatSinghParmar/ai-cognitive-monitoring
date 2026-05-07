const fetch = require('node-fetch'); // or import fetch if using newer Node

const computePlagiarismScore = async (answer, reference) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/check-plagiarism', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: answer, reference: reference })
    });

    if (!response.ok) {
      throw new Error(`Failed to check plagiarism: ${response.statusText}`);
    }

    const data = await response.json();
    return data.plagiarism_score;

  } catch (error) {
    console.error('Error communicating with plagiarism microservice:', error);
    // Fallback if service fails
    return 0;
  }
};

module.exports = { computePlagiarismScore };
