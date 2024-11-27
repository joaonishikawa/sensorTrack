// src/App.js
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InsertSerialsModal from './components/insertSerialsModal';
import './index.css';
import SensorCompletelyWhite from './icons/SensorCompleteWhite'

function App() {
  // Inicializar os seriais usando o local storage
  const [serials, setSerials] = useState(() => {
    const savedSerials = localStorage.getItem('sensorSerials');
    return savedSerials ? JSON.parse(savedSerials) : [];
  });
  
  const [showModal, setShowModal] = useState(false);

  // Atualizar o local storage sempre que o estado dos seriais mudar
  useEffect(() => {
    localStorage.setItem('sensorSerials', JSON.stringify(serials));
  }, [serials]);

  // Adicionar seriais sem duplicá-los
  const handleInsertSerials = (newSerials) => {
    const uniqueSerials = [...new Set([...serials, ...newSerials])];
    setSerials(uniqueSerials);
  };

  // Limpar todos os seriais do estado e do local storage
  const handleClearSerials = () => {
    setSerials([]);
    localStorage.removeItem('sensorSerials');
  };

  return (
    <div className="App">
      <header className="bg-[#1b75bb] text-white p-4">
        <div className=' py-2'>
          <SensorCompletelyWhite />
        </div>
        
      </header>
      <main className="p-4">
        <h1 className="text-3xl font-medium my-10">Dashboard de Instalação</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-500 rounded-md text-white px-4 py-2 mb-4 mr-4"
        >
          Inserir Seriais
        </button>
        <button 
          onClick={handleClearSerials}
          className="bg-red-500 rounded-md text-white px-4 py-2 mb-4"
        >
          Limpar Seriais
        </button>
        {showModal && (
          <InsertSerialsModal 
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleInsertSerials}
          />
        )}
        <Dashboard serials={serials} />
      </main>
    </div>
  );
}

export default App;
