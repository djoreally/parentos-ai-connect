
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';

interface MfaFormProps {
  handleVerifyOtp: (e: React.FormEvent) => void;
  otp: string;
  setOtp: (otp: string) => void;
  isLoading: boolean;
}

const MfaForm: React.FC<MfaFormProps> = ({
  handleVerifyOtp,
  otp,
  setOtp,
  isLoading,
}) => {
  return (
    <form onSubmit={handleVerifyOtp}>
      <CardContent className="pt-6">
        <Label htmlFor="otp">One-Time Password</Label>
        <div className="flex justify-center pt-2">
          <InputOTP
            id="otp"
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="pt-4 text-center text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app. It expires and regenerates every 30 seconds.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
          {isLoading ? 'Verifying...' : 'Verify & Sign In'}
        </Button>
      </CardFooter>
    </form>
  );
};

export default MfaForm;
