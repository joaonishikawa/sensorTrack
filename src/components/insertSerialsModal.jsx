// src/components/InsertSerialsModal.js
import React, { useState } from 'react';

function InsertSerialsModal({ show, onClose, onSave }) {
  const [serialInput, setSerialInput] = useState('');

  if (!show) {
    return null;
  }

  const handleSave = () => {
    const serials = serialInput.split(/[;,]/).map((serial) => serial.trim());
    onSave(serials);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded">
        <h2 className="mb-4 font-semibold text-xl">Inserir Seriais</h2>
        <textarea
          value={serialInput}
          onChange={(e) => setSerialInput(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          rows="5"
          placeholder="Insira os seriais separados por ',' ou ';'"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 rounded-md text-white px-4 py-2 mr-2"
        >
          Salvar
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 rounded-md text-white px-4 py-2"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default InsertSerialsModal;
