"use client";

import { useEffect, useState } from "react";

export default function PatientsPage() {
  // If you have an API: fetch("/api/patients")
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "" });

  useEffect(() => {
    // try to fetch from API, otherwise use mock data
    const load = async () => {
      try {
        const res = await fetch("/api/patients");
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        } else {
          // fallback mock data
          setPatients([
            { id: 1, name: "Juan Dela Cruz", age: 28, gender: "Male" },
            { id: 2, name: "Maria Clara", age: 32, gender: "Female" },
          ]);
        }
      } catch (err) {
        setPatients([
          { id: 1, name: "Juan Dela Cruz", age: 28, gender: "Male" },
          { id: 2, name: "Maria Clara", age: 32, gender: "Female" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    // If you have POST /api/patients implement here
    // For now add to local list
    const newPatient = { id: Date.now(), ...form };
    setPatients((p) => [newPatient, ...p]);
    setForm({ name: "", age: "", gender: "" });
    setShowForm(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Patient Management</h3>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Patient</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2">
          <input className="border p-2 w-full" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
          <input className="border p-2 w-full" placeholder="Age" value={form.age} onChange={(e)=>setForm({...form,age:e.target.value})} required />
          <select className="border p-2 w-full" value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})} required>
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
            <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Age</th>
              <th className="py-2">Gender</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.id}</td>
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.age}</td>
                <td className="py-2">{p.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
