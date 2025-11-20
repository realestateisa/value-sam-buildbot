import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const callbackSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  email: z.string().trim().email('Invalid email address').max(100, 'Email too long'),
});

interface CallbackFormCreeksideProps {
  onClose: () => void;
}

export const CallbackFormCreekside = ({ onClose }: CallbackFormCreeksideProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitSuccess(false);

    try {
      const validatedData = callbackSchema.parse({
        firstName,
        lastName,
        phone,
        email,
      });

      setIsSubmitting(true);
      
      // Prepare webhook payload
      const webhookPayload = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        email: validatedData.email,
        timestamp: new Date().toISOString(),
        source: 'Creekside Homes Chatbot',
      };

      console.log('📤 [CREEKSIDE WIDGET] Sending callback request to Zapier:', webhookPayload);
      console.log('🌐 [CREEKSIDE WIDGET] Current location:', window.location.href);
      console.log('📍 [CREEKSIDE WIDGET] Widget context:', document.querySelector('creekside-chatbot') ? 'Shadow DOM' : 'Regular DOM');
      
      // Send webhook to Zapier
      const webhookUrl = 'https://hooks.zapier.com/hooks/catch/5365219/u88do5x/';
      
      try {
        console.log('🔗 [CREEKSIDE WIDGET] Webhook URL:', webhookUrl);
        console.log('📦 [CREEKSIDE WIDGET] Payload:', JSON.stringify(webhookPayload, null, 2));
        console.log('⏰ [CREEKSIDE WIDGET] Request timestamp:', new Date().toISOString());
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(webhookPayload),
        });
        
        console.log('✅ [CREEKSIDE WIDGET] Webhook request sent successfully (no-cors mode - response is opaque)');
        console.log('⚠️ [CREEKSIDE WIDGET] Note: With no-cors mode, we cannot verify if Zapier received the data.');
        console.log('📊 [CREEKSIDE WIDGET] Check your Zapier dashboard to confirm the webhook was triggered.');
        
        // Show success state
        setSubmitSuccess(true);
        
        // Wait 2 seconds to show success message, then close
        setTimeout(() => {
          setFirstName('');
          setLastName('');
          setPhone('');
          setEmail('');
          onClose();
        }, 2000);
        
      } catch (error) {
        console.error('❌ [CREEKSIDE WIDGET] Error sending webhook:', error);
        console.error('🔍 [CREEKSIDE WIDGET] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined,
          webhookUrl,
          payload: webhookPayload,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      toast({
        title: 'Request Received',
        description: 'Thank you! A Creekside Homes representative will contact you shortly.',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center -mx-6 -mt-6 mb-6 rounded-t-lg" style={{ backgroundColor: '#465E4C' }}>
        <h3 className="font-semibold text-white">Request a Call Back</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {submitSuccess ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6">
          <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#465E4C' }}>
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center">Request Submitted!</h3>
          <p className="text-center text-muted-foreground">
            Thank you! A Creekside Homes representative will contact you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            style={{ borderColor: '#465E4C', color: '#465E4C' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#465E4C' }}
            aria-label="Submit callback request"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
};
