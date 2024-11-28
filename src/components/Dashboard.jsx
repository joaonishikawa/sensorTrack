import React, { useEffect, useState } from "react";
import SensorCard from "./sensorCard";
import emptyImage from "../icons/dataNotFound.svg";

function Dashboard({ serials, handleDeleteSerial }) {
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorSerials, setErrorSerials] = useState([]);
  const [addedSensorsCount, setAddedSensorsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const errors = [];
      const validSensors = [];

      // Resetar flags do localStorage antes de uma nova tentativa de buscar dados
      localStorage.setItem("modalsShown", JSON.stringify({ success: false, error: false }));

      const data = await Promise.all(
        serials.map(async (serial) => {
          try {
            const response = await fetch(
              `https://apidev.neoapp.cloud/sensorservice/v1/sensordevice/general/${serial}`
            );
            if (!response.ok) {
              throw new Error(`Erro ao buscar o sensor ${serial}`);
            }
            const sensor = await response.json();
            validSensors.push(sensor);
            return sensor;
          } catch (error) {
            console.error("Erro ao buscar dados do sensor:", serial, error);
            errors.push(serial);
            return null;
          }
        })
      );

      setSensorData(validSensors);
      setAddedSensorsCount(validSensors.length);
      setErrorSerials(errors);
      setIsLoading(false);

      // Checar se já mostramos o modal nesta sessão
      const alreadyShown = JSON.parse(localStorage.getItem("modalsShown")) || {
        success: false,
        error: false,
      };

      if (validSensors.length > 0 && !alreadyShown.success) {
        setShowSuccessModal(true);
        alreadyShown.success = true;
      }

      if (errors.length > 0 && !alreadyShown.error) {
        setShowErrorModal(true);
        alreadyShown.error = true;
      }

      // Atualizar a flag no local storage
      localStorage.setItem("modalsShown", JSON.stringify(alreadyShown));
    };

    if (serials.length > 0) {
      fetchData();
    } else {
      setSensorData([]);
    }
  }, [serials]);

  return (
    <>
      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>{addedSensorsCount} sensores adicionados com sucesso!</p>
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {showErrorModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-bold text-red-600">
              Houve um erro ao adicionar os seguintes sensores:
            </p>
            <p>{errorSerials.join(", ")}</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Sensores */}
      <div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b"></th>
              <th className="border-b p-2"></th>
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
            {isLoading ? (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  <p className="text-gray-500 text-xl mt-2">
                    Carregando dados dos sensores...
                  </p>
                </td>
              </tr>
            ) : sensorData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={emptyImage}
                      alt="Nada por aqui"
                      className="w-64 h-64"
                    />
                    <p className="text-gray-500 text-xl">
                      Hmmm, nada por aqui...
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sensorData.map((sensor) => (
                <SensorCard
                  key={sensor.device_serial}
                  sensor={sensor}
                  handleDeleteSerial={handleDeleteSerial}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Dashboard;
