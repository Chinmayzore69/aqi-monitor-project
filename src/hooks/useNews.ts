import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle } from '@/lib/types';

interface NewsMeta {
  keyMissing?: boolean;
  fallback?: boolean;
  location?: string;
  error?: string;
  query?: string;
}

interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  meta: NewsMeta | null;
}

export function useNews(district: string | null, state: string | null, country: string | null = 'India') {
  const [state_, setState] = useState<NewsState>({
    articles: [],
    loading: false,
    error: null,
    meta: null,
  });

  const fetchNews = useCallback(async () => {
    const location = district || state || country;
    if (!location) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (district) params.set('district', district);
      if (state) params.set('state', state);
      if (country) params.set('country', country);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/news-fetch?${params.toString()}`;
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();
      setState({
        articles: Array.isArray(data.articles) ? data.articles : [],
        loading: false,
        error: data.meta?.error || null,
        meta: data.meta || null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load news.',
      }));
    }
  }, [district, state, country]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { ...state_, refetch: fetchNews };
}
