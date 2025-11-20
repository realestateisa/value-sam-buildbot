import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

const EmbedDemoCreekside = () => {
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<script src="https://cdn.jsdelivr.net/gh/realestateisa/value-sam-buildbot@main/public/widget-dist/creekside-chatbot-widget.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[hsl(12,78%,58%)]">
            Creekside Homes Chatbot
          </h1>
          <p className="text-lg text-muted-foreground">
            Embed our AI-powered assistant on your website to help visitors learn about Creekside Homes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
            <CardDescription>
              Copy and paste this code into your website's HTML to add the chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <Button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-[hsl(12,78%,58%)] hover:bg-[hsl(12,78%,48%)] text-white"
                size="sm"
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

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Conversations</h3>
                <p className="text-sm text-muted-foreground">
                  SAM uses advanced AI trained on Creekside Homes' information to provide accurate, helpful responses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Direct Appointment Booking</h3>
                <p className="text-sm text-muted-foreground">
                  One-click access to schedule appointments via Motion calendar integration
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Callback Request Form</h3>
                <p className="text-sm text-muted-foreground">
                  Easy-to-use form for visitors who prefer to be contacted by phone
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Persistent Chat Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Conversations are saved for 7 days so visitors can continue where they left off
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Mobile Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Full-screen experience on mobile devices with responsive design
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,78%,58%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Source Citations</h3>
                <p className="text-sm text-muted-foreground">
                  Every response includes links to source material for transparency and trust
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,68%,48%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Shadow DOM Isolation</h3>
                <p className="text-sm text-muted-foreground">
                  Widget styles won't conflict with your website's existing CSS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,68%,48%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Lightweight & Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Optimized bundle size ensures quick loading without impacting page performance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,68%,48%)]" />
              <div>
                <h3 className="font-semibold text-foreground">CustomGPT Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by CustomGPT API for intelligent, context-aware responses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-[hsl(12,68%,48%)]" />
              <div>
                <h3 className="font-semibold text-foreground">Lovable Cloud Backend</h3>
                <p className="text-sm text-muted-foreground">
                  Serverless edge functions ensure reliability and scalability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-sm bg-[hsl(12,78%,58%)]">
                  1
                </span>
                Visitor Opens Chat
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Clicking the chat button opens SAM, who greets them and offers assistance
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-sm bg-[hsl(12,78%,58%)]">
                  2
                </span>
                Ask Questions
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Visitors can ask about homes, communities, pricing, features, and more
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-sm bg-[hsl(12,78%,58%)]">
                  3
                </span>
                Get Accurate Answers
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                SAM provides detailed responses with source citations for verification
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-sm bg-[hsl(12,78%,58%)]">
                  4
                </span>
                Schedule or Request Callback
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                When ready, visitors can book an appointment or request a callback with one click
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4 text-[hsl(12,78%,58%)]">
              Test the Chatbot
            </h3>
            <p className="text-muted-foreground mb-4">
              The chatbot is already active on this page. Click the button in the bottom-right corner to try it out!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-[hsl(142,71%,45%)] animate-pulse" />
              <span>Live and ready to chat</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmbedDemoCreekside;
