import HomeClient from '@/components/HomeClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getMovies() {
  try {
    const res = await fetch(`${API_URL}/movies`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

export default async function Home() {
  console.log("--------------------------------------------------");
  console.log("SERVER SIDE LOG: LUMIERE PREMIUM UI IS RUNNING");
  console.log("--------------------------------------------------");
  const movies = await getMovies();

  return <HomeClient movies={movies} />;
}
