import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const EmbedDemo = () => {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- Value Build Homes Chatbot Widget -->
<div id="vbh-chatbot-root"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/chatbot-widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Value Build Homes Chatbot</h1>
          <p className="text-muted-foreground">
            SAM - Your Digital Assistant for Custom Home Building
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Embed Code</h2>
          <p className="text-muted-foreground mb-4">
            Copy the code below and paste it into your website's HTML to add the chatbot widget:
          </p>
          
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <Button
              onClick={handleCopy}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ AI-powered conversations using Claude</li>
            <li>✓ Automatic territory detection for appointment booking</li>
            <li>✓ Integrated Cal.com calendar for all sales territories</li>
            <li>✓ Book appointments or request callbacks</li>
            <li>✓ Trained on Value Build Homes website content</li>
            <li>✓ Company-branded design (#E2362B red theme)</li>
            <li>✓ Mobile responsive</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Covered Territories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Greenville</h3>
              <p className="text-muted-foreground text-xs">In-person appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Columbia</h3>
              <p className="text-muted-foreground text-xs">Virtual appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Greensboro</h3>
              <p className="text-muted-foreground text-xs">Virtual appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Oxford</h3>
              <p className="text-muted-foreground text-xs">In-person appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Monroe</h3>
              <p className="text-muted-foreground text-xs">Virtual appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Smithfield</h3>
              <p className="text-muted-foreground text-xs">In-person appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sanford</h3>
              <p className="text-muted-foreground text-xs">In-person appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Statesville</h3>
              <p className="text-muted-foreground text-xs">In-person appointments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Wilmington</h3>
              <p className="text-muted-foreground text-xs">Virtual appointments</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-primary text-primary-foreground">
          <h2 className="text-2xl font-semibold mb-2">Test the Chatbot</h2>
          <p className="text-sm opacity-90">
            Click the chat icon in the bottom left corner to test the chatbot functionality right here!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default EmbedDemo;
