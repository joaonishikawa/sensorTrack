// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import SensorCard from './sensorCard';

function Dashboard({ serials, handleDeleteSerial }) {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all(
        serials.map(async (serial) => {
          try {
            const response = await fetch(`https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/general/${serial}`);
            return await response.json();
          } catch (error) {
            console.error('Erro ao buscar dados do sensor:', serial, error);
            return null;
          }
        })
      );
      setSensorData(data.filter(sensor => sensor !== null));
    };

    if (serials.length > 0) {
      fetchData();
    }
  }, [serials]);

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="">
            <th className="border-b p-2">Delete</th>
            <th className="border-b p-2">Informações</th>
            <th className="border-b p-2">Serial</th>
            <th className="border-b p-2">Último Envio</th>
            <th className="border-b p-2">Bateria</th>
            <th className="border-b p-2">Status da Bateria</th>
            <th className="border-b p-2">Gateway</th>
            <th className="border-b p-2">Comandos Confirmados?</th>
            <th className="border-b p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((sensor) => (
            <SensorCard key={sensor.device_serial} sensor={sensor} handleDeleteSerial={handleDeleteSerial}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
