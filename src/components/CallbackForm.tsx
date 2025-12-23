import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Phone, ChevronLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/5365219/ualt8zx/';
const callbackSchema = z.object({
  firstName: z.string().trim().min(1, {
    message: "First name is required"
  }).max(50, {
    message: "First name must be less than 50 characters"
  }),
  lastName: z.string().trim().min(1, {
    message: "Last name is required"
  }).max(50, {
    message: "Last name must be less than 50 characters"
  }),
  phone: z.string().trim().min(10, {
    message: "Phone number must be at least 10 digits"
  }).max(15, {
    message: "Phone number must be less than 15 characters"
  }).regex(/^[0-9+\-() ]+$/, {
    message: "Invalid phone number format"
  }),
  email: z.string().trim().email({
    message: "Invalid email address"
  }).max(255, {
    message: "Email must be less than 255 characters"
  })
});
interface CallbackFormProps {
  onClose: () => void;
}
export const CallbackForm = ({
  onClose
}: CallbackFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = callbackSchema.parse({
        firstName,
        lastName,
        phone,
        email
      });
      
      setIsSubmitting(true);
      
      const webhookPayload = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        email: validatedData.email,
        timestamp: new Date().toISOString(),
        source: 'Value Build Homes Chatbot',
        page_url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      };

      // Enhanced logging for debugging on client sites
      console.info('%c[VBH Widget] sending webhook', 'color: #3b82f6; font-weight: bold;');
      console.info('[VBH Widget] webhook target:', ZAPIER_WEBHOOK_URL);
      console.info('[VBH Widget] webhook payload:', JSON.stringify(webhookPayload, null, 2));

      await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(webhookPayload),
      });

      console.info('%c[VBH Widget] webhook sent successfully', 'color: #22c55e; font-weight: bold;');
      
      // Show success state
      setShowSuccess(true);
      
      toast({
        title: "Request Submitted",
        description: "We'll call you back soon!"
      });

      // Reset form and close after delay
      setTimeout(() => {
        setFirstName('');
        setLastName('');
        setPhone('');
        setEmail('');
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Error sending callback request:', error);
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <>
        <div className="flex items-center justify-between p-3 text-primary-foreground bg-primary border-b">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Request Callback</h2>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
          <p className="text-muted-foreground text-center">
            Your callback request has been submitted. We'll be in touch soon!
          </p>
        </div>
      </>
    );
  }
  return <>
      {/* Callback Form Header */}
      <div className="flex items-center justify-between p-3 text-primary-foreground bg-primary border-b">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Request Callback</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200" aria-label="Close callback form">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Callback Form Content */}
      <div className="flex-1 overflow-auto p-6 relative">
        {/* Back Button */}
        <Button variant="ghost" className="absolute top-3 left-3 hover:bg-accent font-medium transition-all duration-200" onClick={onClose}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>

        <div className="max-w-md mx-auto space-y-6 mt-8">
          <p className="text-foreground/80 text-base text-center font-medium leading-relaxed">
            Have a specific question?<br />
            Request a call back from our team!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={errors.firstName ? 'border-destructive' : ''} />
            {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={errors.lastName ? 'border-destructive' : ''} />
            {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className={errors.phone ? 'border-destructive' : ''} />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </div>
      </div>
    </>;
};