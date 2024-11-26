// src/components/SensorCard.js
import React, { useEffect, useState } from 'react';

function SensorCard({ sensor }) {
  const { device_serial, last_ack, battery_level, parent } = sensor;
  const [commandsConfirmed, setCommandsConfirmed] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(null);

  // Determinando se o sensor está ativo (se enviou informações nas últimas 4 horas)
  const isActive = last_ack && (new Date() - new Date(last_ack) < 14400000);

  const getLocalTime = (gmtTime) => {
    const date = new Date(gmtTime);
    const localTime = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false,
    });
    return localTime;
  };

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await fetch(`https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/commands/${device_serial}`);
        const data = await response.json();
        if (data.commands && data.commands.length > 0) {
          // Verificar se todos os comandos foram confirmados (campo `done` não nulo)
          const allConfirmed = data.commands.every(command => command.done !== null);
          setCommandsConfirmed(allConfirmed);
        }
      } catch (error) {
        console.error('Erro ao buscar comandos do sensor:', device_serial, error);
      }
    };

    const fetchLastStatus = async () => {
      try {
        const response = await fetch(`https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/laststatus/${device_serial}`);
        const data = await response.json();
        if (data.laststatus && data.laststatus.length > 0) {
          // Encontrar o nível de bateria (type === "battery")
          const batteryInfo = data.laststatus.find(status => status.type === "battery");
          if (batteryInfo) {
            setBatteryLevel(parseFloat(batteryInfo.value.toFixed(1)));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status do sensor:', device_serial, error);
      }
    };

    if (device_serial) {
      fetchCommands();
      fetchLastStatus()
    }
  }, [device_serial]);
  
  return (
    <tr className="text-center">
      <td className="border p-2">{device_serial}</td>
      <td className="border p-2">{last_ack ? getLocalTime(last_ack) : 'N/A'}</td>
      <td className="border p-2">{batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}</td>
      <td className="border p-2">{parent}</td>
      <td className="border p-2">
        {commandsConfirmed ? (
          <span className="text-green-500">Confirmados</span>
        ) : (
          <span className="text-red-500">Não Confirmados</span>
        )}
      </td>
      <td className="border p-2">
        {isActive ? (
          <span className="text-green-500">Ativo</span>
        ) : (
          <span className="text-red-500">Inativo</span>
        )}
      </td>
    </tr>
  );
}

export default SensorCard;
