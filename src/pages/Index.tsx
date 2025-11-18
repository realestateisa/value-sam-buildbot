import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageSquare, Calendar, MapPin, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<script src="https://4b482d74-c976-43c4-8d7d-de411c7ba68f.lovableproject.com/chatbot-widget.js"></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Value Build Homes Chatbot
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered home building assistant for Sydney, NSW, and QLD territories
          </p>
        </div>

        {/* Embed Code Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy and paste this code into your website's HTML to add the chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm flex items-center justify-between">
              <code className="flex-1 truncate">{embedCode}</code>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="ml-2 flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">AI-powered responses trained on Value Build Homes content</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">Automatic territory detection (Sydney, NSW, QLD)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">Integrated appointment booking via Cal.com</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">Callback request form for flexible contact</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">Citations with source links for transparency</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Covered Territories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Sydney Metro</h4>
                <p className="text-sm text-muted-foreground">In-person consultations available</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">NSW Regional</h4>
                <p className="text-sm text-muted-foreground">Virtual appointments via video call</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Queensland</h4>
                <p className="text-sm text-muted-foreground">Virtual appointments via video call</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Highlights */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Technical Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Shadow DOM isolation for style protection
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Responsive design (mobile & desktop)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Session persistence with localStorage
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Built with React, TypeScript, and Tailwind
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Powered by OpenAI GPT-4 via Supabase Edge Functions
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Auto-deployed via GitHub Actions
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-2xl font-bold">Try the Chatbot Now!</h3>
            <p className="text-muted-foreground">
              Click the chat icon in the bottom-right corner to start a conversation
            </p>
            <Button onClick={() => navigate('/embed-demo')} size="lg" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              View Demo Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
