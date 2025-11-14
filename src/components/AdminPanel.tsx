import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const AdminPanel = () => {
  const { toast } = useToast();
  const [sitemapUrl, setSitemapUrl] = useState<string>('https://www.valuebuildhomes.com/sitemap.xml');
  const [urls, setUrls] = useState<string>('');
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [isLoadingSitemap, setIsLoadingSitemap] = useState(false);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isEmbeddingLoading, setIsEmbeddingLoading] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [embeddingResults, setEmbeddingResults] = useState<any>(null);

  const handleLoadSitemap = async () => {
    if (!sitemapUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a sitemap URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingSitemap(true);

    try {
      const response = await fetch(sitemapUrl);
      if (!response.ok) throw new Error('Failed to fetch sitemap');

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const urlElements = xmlDoc.getElementsByTagName('url');
      const extractedUrls: string[] = [];

      for (let i = 0; i < urlElements.length; i++) {
        const locElement = urlElements[i].getElementsByTagName('loc')[0];
        if (locElement && locElement.textContent) {
          extractedUrls.push(locElement.textContent);
        }
      }

      if (extractedUrls.length === 0) {
        throw new Error('No URLs found in sitemap');
      }

      setSitemapUrls(extractedUrls);
      setSelectedUrls(new Set(extractedUrls));
      toast({
        title: 'Sitemap Loaded',
        description: `Found ${extractedUrls.length} URLs`,
      });
    } catch (error) {
      console.error('Sitemap loading error:', error);
      toast({
        title: 'Failed to Load Sitemap',
        description: error instanceof Error ? error.message : 'Failed to parse sitemap',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSitemap(false);
    }
  };

  const toggleUrlSelection = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  const selectAllUrls = () => {
    setSelectedUrls(new Set(sitemapUrls));
  };

  const deselectAllUrls = () => {
    setSelectedUrls(new Set());
  };

  const handleScrapeWebsite = async () => {
    const urlList = sitemapUrls.length > 0 
      ? Array.from(selectedUrls)
      : urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one URL to scrape',
        variant: 'destructive',
      });
      return;
    }

    setIsScrapingLoading(true);
    setScrapeResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: { urls: urlList }
      });

      if (error) throw error;

      setScrapeResults(data);
      toast({
        title: 'Scraping Complete',
        description: `Successfully scraped ${data.results?.length || 0} URLs`,
      });
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: 'Scraping Failed',
        description: error instanceof Error ? error.message : 'Failed to scrape website',
        variant: 'destructive',
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    setIsEmbeddingLoading(true);
    setEmbeddingResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { batchSize: 20 }
      });

      if (error) throw error;

      setEmbeddingResults(data);
      toast({
        title: 'Embeddings Generated',
        description: `Processed ${data.processed} chunks successfully`,
      });
    } catch (error) {
      console.error('Embedding error:', error);
      toast({
        title: 'Embedding Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate embeddings',
        variant: 'destructive',
      });
    } finally {
      setIsEmbeddingLoading(false);
    }
  };

  const defaultUrls = `https://www.valuebuildhomes.com
https://www.valuebuildhomes.com/floor-plans
https://www.valuebuildhomes.com/financing
https://www.valuebuildhomes.com/about`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RAG Admin Panel</CardTitle>
          <CardDescription>
            Scrape website content and generate embeddings for the chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Load from Sitemap
              </label>
              <div className="flex gap-2">
                <Textarea
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://www.valuebuildhomes.com/sitemap.xml"
                  className="h-10 resize-none"
                />
                <Button
                  onClick={handleLoadSitemap}
                  disabled={isLoadingSitemap}
                  variant="secondary"
                >
                  {isLoadingSitemap ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Load Sitemap'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically fetch URLs from website sitemap
              </p>
            </div>

            {sitemapUrls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Select URLs to Scrape ({selectedUrls.size} selected)
                  </label>
                  <div className="flex gap-2">
                    <Button
                      onClick={selectAllUrls}
                      variant="ghost"
                      size="sm"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={deselectAllUrls}
                      variant="ghost"
                      size="sm"
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
                  {sitemapUrls.map((url) => (
                    <label
                      key={url}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUrls.has(url)}
                        onChange={() => toggleUrlSelection(url)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-mono truncate flex-1">
                        {url}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {sitemapUrls.length === 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Or Enter URLs Manually (one per line)
                </label>
                <Textarea
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder={defaultUrls}
                  className="min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter URLs to scrape, one per line.
                </p>
              </div>
            )}

            <Button
              onClick={handleScrapeWebsite}
              disabled={isScrapingLoading}
              className="w-full"
            >
              {isScrapingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape Website'
              )}
            </Button>

            {scrapeResults && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Scraping Results</h3>
                <pre className="text-xs overflow-auto max-h-[200px]">
                  {JSON.stringify(scrapeResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Generate Embeddings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                After scraping, generate embeddings for the content to enable semantic search.
              </p>
            </div>

            <Button
              onClick={handleGenerateEmbeddings}
              disabled={isEmbeddingLoading}
              className="w-full"
              variant="secondary"
            >
              {isEmbeddingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Embeddings...
                </>
              ) : (
                'Generate Embeddings'
              )}
            </Button>

            {embeddingResults && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Embedding Results</h3>
                <pre className="text-xs overflow-auto max-h-[200px]">
                  {JSON.stringify(embeddingResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
