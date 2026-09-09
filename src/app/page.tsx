'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
  });

  // 1. Bewerber aus Supabase laden
  const fetchCandidates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden:', error);
    } else {
      setCandidates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 1b. Realtime-Subscription: Änderungen an "candidates" sofort im UI reflektieren
  useEffect(() => {
    const channel = supabase
      .channel('candidates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        (payload) => {
          setCandidates((current) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as Candidate;
              if (current.some((c) => c.id === row.id)) return current;
              return [row, ...current].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            }

            if (payload.eventType === 'UPDATE') {
              const row = payload.new as Candidate;
              return current.map((c) => (c.id === row.id ? row : c));
            }

            if (payload.eventType === 'DELETE') {
              const oldRow = payload.old as Partial<Candidate>;
              return current.filter((c) => c.id !== oldRow.id);
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Neuen Bewerber hinzufügen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.role) return;

    const { error } = await supabase.from('candidates').insert([
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        status: 'Pending',
      },
    ]);

    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      setFormData({ first_name: '', last_name: '', email: '', role: '' });
      fetchCandidates(); // Liste aktualisieren
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Arvana GmbH — Candidate Onboarding</h1>
            <p className="text-sm text-slate-500">Bewerberübersicht & Status-Tracking</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">PoC Active</span>
        </header>

        {/* Formular: Neuer Bewerber */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Neuen Bewerber anlegen</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Vorname"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Nachname"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="E-Mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Rolle (z. B. Developer)"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="md:col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Kandidat hinzufügen
            </button>
          </form>
        </section>

        {/* Tabelle: Bewerberliste */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-800">Aktuelle Bewerber</h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Lade Daten...</p>
          ) : candidates.length === 0 ? (
            <p className="p-6 text-slate-500">Keine Bewerber gefunden.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                  <th className="p-4">Name</th>
                  <th className="p-4">E-Mail</th>
                  <th className="p-4">Rolle</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-900">{c.first_name} {c.last_name}</td>
                    <td className="p-4">{c.email}</td>
                    <td className="p-4">{c.role}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          c.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : c.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}