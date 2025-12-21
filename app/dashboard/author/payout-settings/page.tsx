'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PayoutStatus = {
  connected: boolean;
  payouts_enabled: boolean;
  balance: number;
  currency: string;
};

export default function PayoutSettingsPage() {
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('wpToken');
      const res = await fetch(
        `${apiUrl}/wp-json/authorconnect/v1/payout-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setStatus(data);
    };

    fetchStatus();
  }, []);

  const startOnboarding = async () => {
    const token = localStorage.getItem('wpToken');
    const res = await fetch(
      `${apiUrl}/wp-json/authorconnect/v1/stripe/onboard`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Payout Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Stripe Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex justify-between">
                <span>Connection Status</span>
                <Badge variant={status.connected ? 'default' : 'outline'}>
                  {status.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span>Payouts Enabled</span>
                <Badge
                  variant={status.payouts_enabled ? 'default' : 'secondary'}
                >
                  {status.payouts_enabled ? 'Yes' : 'Pending'}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span>Available Balance</span>
                <strong>
                  ${status.balance} {status.currency.toUpperCase()}
                </strong>
              </div>

              <Button onClick={startOnboarding}>
                {status.connected
                  ? 'Update Bank Details'
                  : 'Connect Stripe Account'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
