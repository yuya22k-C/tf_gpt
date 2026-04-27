import { useEffect, useState } from 'react';

type Flower = {
  id: number;
  name: string;
  color: string;
  season: string;
};

function App() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const res = await fetch('/api/flowers');
        if (!res.ok) {
          throw new Error('Failed to fetch flowers');
        }
        const data: Flower[] = await res.json();
        setFlowers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, []);

  return (
    <main className="container">
      <header className="header">
        <h1>Flower Catalog</h1>
        <p>Responsive flower list (PC / Mobile)</p>
      </header>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="grid" aria-label="flowers list">
          {flowers.map((flower) => (
            <article className="card" key={flower.id}>
              <h2>{flower.name}</h2>
              <ul>
                <li>
                  <strong>Color:</strong> {flower.color}
                </li>
                <li>
                  <strong>Season:</strong> {flower.season}
                </li>
              </ul>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;
