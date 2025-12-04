import HomeClient from '@/components/HomeClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getMovies() {
  try {
    console.log('Fetching movies with showtimes from:', API_URL);
    const res = await fetch(`${API_URL}/movies/with-showtimes`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch movies, status:', res.status);
      return [];
    }

    const data = await res.json();
    console.log('Successfully fetched', data.length, 'movies with showtimes');
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

async function getAds() {
  try {
    const res = await fetch(`${API_URL}/ads`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

export default async function Home() {
  console.log("--------------------------------------------------");
  console.log("SERVER SIDE LOG: LUMIERE PREMIUM UI IS RUNNING");
  console.log("--------------------------------------------------");

  // Fetch both in parallel for faster loading
  const [movies, ads] = await Promise.all([
    getMovies(),
    getAds()
  ]);

  return <HomeClient movies={movies} ads={ads} />;
}
