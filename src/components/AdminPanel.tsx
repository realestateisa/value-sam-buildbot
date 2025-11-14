import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const AdminPanel = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<string>('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isEmbeddingLoading, setIsEmbeddingLoading] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [embeddingResults, setEmbeddingResults] = useState<any>(null);

  const handleScrapeWebsite = async () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one URL',
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
                Website URLs (one per line)
              </label>
              <Textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder={defaultUrls}
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter URLs to scrape, one per line. Default Value Build Homes pages are suggested above.
              </p>
            </div>

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
