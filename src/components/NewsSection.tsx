import { ExternalLink, RefreshCw, Newspaper, KeyRound, Clock, AlertCircle } from 'lucide-react';
import type { NewsArticle } from '@/lib/types';
import { useNews } from '@/hooks/useNews';
import { formatTimeShort } from '@/lib/utils';

interface NewsSectionProps {
  district: string | null;
  state: string | null;
  country?: string | null;
}

export function NewsSection({ district, state, country = 'India' }: NewsSectionProps) {
  const { articles, loading, error, meta, refetch } = useNews(district, state, country);

  const locationLabel = district || state || country || 'your region';

  return (
    <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-[#F4F8FC] flex items-center gap-2">
            <Newspaper size={18} className="text-cyan-400" />
            Air Quality News
          </h3>
          <p className="text-xs text-[#9DB1C4] mt-0.5">
            Latest news about air quality in{' '}
            <span className="text-cyan-400 font-medium">{locationLabel}</span>
            {meta?.fallback && (
              <span className="ml-1 text-[#9DB1C4]/60 italic">
                (showing {state || country} news — no district-level results found)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="p-2 text-[#9DB1C4] hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Refresh news"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Key missing state */}
      {meta?.keyMissing && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <KeyRound size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">NewsAPI key not configured</p>
            <p className="text-xs text-[#9DB1C4] mt-1 leading-relaxed">
              To enable live news, add your <code className="text-cyan-400">NEWSAPI_KEY</code> from{' '}
              <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                newsapi.org
              </a>{' '}
              as a Supabase Edge Function secret. Once configured, this section will show real air quality news for your district and state.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !meta?.keyMissing && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-[#071724]/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Articles grid */}
      {!loading && articles.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {articles.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
        </div>
      )}

      {/* Empty state (key is configured but no articles) */}
      {!loading && !error && !meta?.keyMissing && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-[#9DB1C4]/50 gap-2">
          <Newspaper size={28} />
          <p className="text-sm">No news articles found for this location.</p>
          <button onClick={refetch} className="text-xs text-cyan-400 hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const timeStr = article.publishedAt ? formatTimeShort(article.publishedAt) : '';

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 p-3.5 rounded-xl bg-[#071724]/60 border border-white/5 hover:border-cyan-500/20 hover:bg-[#071724]/80 transition-all"
    >
      {/* Optional image */}
      {article.urlToImage && (
        <div className="w-full h-28 rounded-lg overflow-hidden bg-[#0D2233]">
          <img
            src={article.urlToImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-[#F4F8FC] line-clamp-3 leading-relaxed group-hover:text-cyan-300 transition-colors">
          {article.title}
        </p>
        {article.description && (
          <p className="text-[11px] text-[#9DB1C4] line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-[10px] text-[#9DB1C4] font-medium">{article.source}</span>
        </div>
        <div className="flex items-center gap-1 text-[#9DB1C4]/50">
          <Clock size={10} />
          <span className="text-[10px]">{timeStr}</span>
          <ExternalLink size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}
