import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentSuccessData = {
  registrationId: string;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get payment data from location state
  const paymentData = location.state as PaymentSuccessData | undefined;

  useEffect(() => {
    // If no payment data, redirect to home
    if (!paymentData) {
      toast({
        title: 'Invalid Access',
        description: 'No payment information found. Please complete the payment process.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [paymentData, navigate, toast]);

  if (!paymentData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-green-100 rounded-full p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration ID:</span>
                <span className="font-medium">{paymentData.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-medium">{paymentData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">XAF {paymentData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
              </div>
              {paymentData.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">{paymentData.transactionId}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">What's next?</h4>
            <p className="text-sm text-blue-700">
              A receipt has been downloaded to your device. Our team will verify your payment and contact you if needed.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.print()}
          >
            Print Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
