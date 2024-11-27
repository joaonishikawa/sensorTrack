// src/components/SensorCard.js
import React, { useEffect, useState } from 'react';


function SensorCard({ sensor, handleDeleteSerial }) {
  const { device_serial, last_ack, parent } = sensor;
  const [commandsConfirmed, setCommandsConfirmed] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [batteryStatus, setBatteryStatus] = useState ('');
  const [showModal, setShowModal] = useState(false);


  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Determinando se o sensor está ativo (se enviou informações nas últimas 4 horas)
  const isActive = last_ack && (new Date() - new Date(last_ack) < 14400000);

  const translations = {
    "power_down" : "Desligado",
    "power_down_with_low_battery" : "Desligado com pouca bateria",
    "power_up_charging" : "Ligado carregando",
    "charging" : "Carregando",
    "power_up_on_battery" : "Ligado na bateria",
    "on_battery" : "Na bateria"
  };

  const getLocalTime = (gmtTime) => {
    const date = new Date(gmtTime);
    const localTime = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false,
    });
    return localTime;
  };

  const [commands, setCommands] = useState([]);

  useEffect(() => {
    const fetchLastStatus = async () => {
      try {
        const response = await fetch(`https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/laststatus/${device_serial}`);
        const data = await response.json();
        if (data.laststatus && data.laststatus.length > 0) {
          const batteryInfo = data.laststatus.find(status => status.type === "battery");
          if (batteryInfo) {
            setBatteryLevel(parseFloat(batteryInfo.value.toFixed(1)));
          }

          const batteryStatusInfo = data.laststatus.find(status => status.type === "diagnostic");
          if (batteryStatusInfo) {
            setBatteryStatus(translations[batteryStatusInfo.description] || batteryStatusInfo.description);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status do sensor:', device_serial, error);
      }
    };

    const fetchCommands = async () => {
      try {
        const response = await fetch(`https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/commands/${device_serial}`);
        const data = await response.json();
        if (data.commands && data.commands.length > 0) {
          setCommands(data.commands);
          const allConfirmed = data.commands.every(command => command.done !== null);
          setCommandsConfirmed(allConfirmed);
        }
      } catch (error) {
        console.error('Erro ao buscar comandos do sensor:', device_serial, error);
      }
    };

    if (device_serial) {
      fetchLastStatus();
      fetchCommands();
    }
  }, [device_serial]);

  return (
    <>
      <tr className="text-center bg-[#F8F8F8]">
          <td className='p-2 border cursor-pointer' onClick={handleDeleteSerial}>🗑️</td>
          <td className="p-2 border cursor-pointer " onClick={handleOpenModal}>📑</td>
        <td className="p-2 border">{device_serial}</td>
        <td className="p-2 border">{last_ack ? getLocalTime(last_ack) : 'N/A'}</td>
        <td className="p-2 border">{batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}</td>
        <td className="p-2 border">{batteryStatus || 'N/A'}</td>
        <td className="p-2 border">{parent}</td>
        <td className="p-2 border">
          {commandsConfirmed ? (
            <span className="text-green-500">Confirmados</span>
          ) : (
            <span className="text-red-500">Não Confirmados</span>
          )}
        </td>
        <td className="p-2">
          {isActive ? (
            <span className="text-green-500">Ativo</span>
          ) : (
            <span className="text-red-500">Inativo</span>
          )}
        </td>
      </tr>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-3/4 max-w-md">
            <h2 className="text-xl font-bold mb-4">Informações do Sensor</h2>
            <p><strong>Serial:</strong> {device_serial}</p>
            <p><strong>Último Envio:</strong> {last_ack ? getLocalTime(last_ack) : 'N/A'}</p>
            <p><strong>Nível da Bateria:</strong> {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}</p>
            <p><strong>Status da Bateria:</strong> {batteryStatus || 'N/A'}</p>
            <p><strong>Gateway:</strong> {parent}</p>
            <p className="overflow-auto"><strong>Último Comando Enviado:<br></br></strong> {commands.length > 0 ? commands[0].value.split(',').map((item, index) => (
    <span key={index}>
      {item}
      <br />
    </span>)) : 'N/A'}</p>
            <button
              onClick={handleCloseModal}
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SensorCard;
