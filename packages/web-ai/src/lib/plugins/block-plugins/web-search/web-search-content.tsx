'use client';

import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Globe, ExternalLink } from 'lucide-react';
import type { WebSearchResult } from '@skeleton/core-api-models';

interface WebSearchResultItemProps {
  result: WebSearchResult;
  className?: string;
}

/**
 * Renders a single web search result.
 */
function WebSearchResultItem({ result, className }: WebSearchResultItemProps) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col gap-1 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="flex-1 text-sm font-medium text-foreground group-hover:text-primary">
          {result.title}
        </h4>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="truncate">{formatUrl(result.url)}</span>
        {result.pageAge && (
          <>
            <span className="text-border">|</span>
            <span>{result.pageAge}</span>
          </>
        )}
      </div>
    </a>
  );
}

interface WebSearchContentProps {
  results: WebSearchResult[];
  isStreaming?: boolean;
  className?: string;
}

/**
 * Renders a list of web search results.
 */
export function WebSearchContent({ results, isStreaming, className }: WebSearchContentProps) {
  const { t } = useTranslation();

  if (results.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div className={cn('my-2', className)}>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Globe className="size-4" />
        <span>
          {t('ai.webSearch.results')}
          {isStreaming && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" />
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {results.map((result, index) => (
          <WebSearchResultItem key={`${result.url}-${index}`} result={result} />
        ))}
      </div>
    </div>
  );
}

/**
 * Format URL for display (remove protocol, www, and truncate if needed).
 */
function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname;
    return host + (path !== '/' ? path : '');
  } catch {
    return url;
  }
}
