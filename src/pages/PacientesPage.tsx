import { useEffect, useState } from "react";
import { getPacientes } from "../api/pacientes";
import type { Paciente } from "../api/pacientes";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Error cargando pacientes", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando pacientes...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pacientes</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Apellido</th>
            <th className="border p-2">DNI</th>
          </tr>
        </thead>

        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.nombre}</td>
              <td className="border p-2">{p.apellido}</td>
              <td className="border p-2">{p.dni}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}