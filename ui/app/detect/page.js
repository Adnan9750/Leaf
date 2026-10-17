'use client';

import { useState } from 'react';

export default function DetectPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    const formData = new FormData();
    formData.append('image', image);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-teal-100">
      <h1 className="text-3xl font-bold mb-6">Plant Disease Detection</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="border rounded p-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
        >
          {loading ? 'Processing...' : 'Detect'}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-md">
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : (
            <>
              <p><strong>Prediction:</strong> {result.prediction}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
