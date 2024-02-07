import '../styles/App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tesseractReady, setTesseractReady] = useState(false);
  const [openAIResponse, setOpenAIResponse] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => setTesseractReady(true);
    document.body.appendChild(script);
  }, []);

  const handleImageUpload = (event) => {
    if (!tesseractReady) {
      console.error("Tesseract.js is not ready yet.");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    window.Tesseract.recognize(
      file,
      'eng',
      { logger: m => console.debug(m) }
    ).then(async ({ data: { text } }) => {
      setText(text); // Display extracted OCR text
      
      // Call OpenAI serverless background function
      try {
        const aiResponse = await fetch('/.netlify/functions/openAIProxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: text }), // Send OCR text to your function
        });
        
        const aiData = await aiResponse.json();
        setOpenAIResponse(aiData.choices[0].message.content);

      } catch (error) {
        console.error('Error:', error);
        setOpenAIResponse('An error occurred.');
      } finally {
        setLoading(false);
      }
    }).catch(error => {
      console.error('OCR Error:', error);
      setLoading(false);
    });
  };

  return (
    <div className="container mt-5 bg-dark p-4 rounded">
      <h1 className="text-center mb-4 text-white">Food FACTS</h1>
      <div className="d-flex justify-content-center">
        <input type="file" onChange={handleImageUpload} accept="image/*" className="form-control custom-file-input" />
      </div>
      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <div className="text-center mt-3 text-white">
        <p>Extracted Text: {text}</p>
        <p>OpenAI Response: {openAIResponse}</p>
      </div>
    </div>
  );
}

export default App;
