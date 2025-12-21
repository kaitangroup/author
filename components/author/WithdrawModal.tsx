'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  open: boolean;
  onClose: () => void;
  available: number;
  onSuccess: () => void;
};

export default function WithdrawModal({
  open,
  onClose,
  available,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState(available);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_WP_URL;
  const token = localStorage.getItem('wpToken');

  const submitWithdraw = async () => {
    setError('');

    if (amount <= 0 || amount > available) {
      setError('Invalid amount');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${apiUrl}/wp-json/authorconnect/v1/withdraw`,
        {
          method: 'POST',     
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({amount: amount}),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Withdraw failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Available balance: <strong>${available.toFixed(2)}</strong>
          </p>

          <Input
            type="number"
            min={1}
            max={available}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            className="w-full"
            disabled={loading}
            onClick={submitWithdraw}
          >
            {loading ? 'Processing...' : 'Confirm Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
