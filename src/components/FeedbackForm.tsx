import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

type FeedbackType = 'suggestion' | 'bug' | 'other';

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('_subject', `New ${type} - Success Slips Feedback`);
      formData.append('_next', `${window.location.origin}/thank-you`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('feedback_type', type);
      formData.append('page_url', window.location.href);
      formData.append('message', message);
      if (email) formData.append('email', email);
      
      // Submit to FormSubmit
      const response = await fetch('https://formsubmit.co/ajax/ratsmart92@gmail.com', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.success === 'true') {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        });
        setMessage('');
        setEmail('');
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Share Your Feedback</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We'd love to hear your suggestions or report any issues you've encountered.
      </p>
      
      <form 
        action="https://formsubmit.co/ratsmart92@gmail.com" 
        method="POST"
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        {/* FormSubmit configuration */}
        <input type="hidden" name="_subject" value={`New ${type} - Success Slips Feedback`} />
        <input type="hidden" name="_next" value={`${window.location.origin}/thank-you`} />
        <input type="hidden" name="_captcha" value="false" />
        <input type="text" name="_honey" style={{ display: 'none' }} />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="feedback_type" value={type} />
        <input type="hidden" name="page_url" value={window.location.href} />
        <div className="space-y-2">
          <label className="block text-sm font-medium">Feedback Type</label>
          <div className="flex gap-4">
            {[
              { value: 'suggestion', label: 'Suggestion' },
              { value: 'bug', label: 'Bug Report' },
              { value: 'other', label: 'Other' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={type === option.value}
                  onChange={() => setType(option.value as FeedbackType)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium">
            {type === 'bug' ? 'Describe the issue' : 'Your feedback'}
          </label>
          <Textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'bug'
                ? 'Please describe the issue you encountered...'
                : 'Share your suggestions or feedback...'
            }
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email (optional)
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <p className="text-xs text-muted-foreground">
            Only if you'd like us to respond to your feedback
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </div>
  );
}
