import HomeClient from '@/components/HomeClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getMovies() {
  try {
    console.log('Fetching movies from:', API_URL);
    const res = await fetch(`${API_URL}/movies`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch movies, status:', res.status);
      return [];
    }

    const data = await res.json();
    console.log('Successfully fetched', data.length, 'movies');
    return data;
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
