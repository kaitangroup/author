'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type WPTutor = {
  id: number;
  name: string;
  bio: string;
  slug: string;
  location: string;
  roles: string[];
  hourly_rate?: number;
  subjects: string[];
  availability?: string[];
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor?: WPTutor;
}

interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

interface DayData {
  date: string;
  dayName: string;
  dayNumber: number;
  timeSlots: TimeSlot[];
}

function BookingModalInner({ isOpen, onClose, tutor }: BookingModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    time: '',
    duration: 60,
    message: '',
  });

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const baseSlots = [
      '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm',
      '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm'
    ];
    const todayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const exists = tutor?.availability?.some(slot => slot.toLowerCase().startsWith(todayName));
    return baseSlots.map(time => ({ time, available: !!exists }));
  };

  const generateDaysData = (): DayData[] => {
    const days: DayData[] = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 1);

    for (let i = 0; i < 3; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      days.push({
        date: `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`,
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        timeSlots: generateTimeSlots(currentDate)
      });
    }
    return days;
  };

  const daysData = useMemo(() => generateDaysData(), [selectedDate]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const total = (tutor?.hourly_rate ? (tutor.hourly_rate * formData.duration) / 60 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    if (!formData.subject || !selectedTimeSlot) {
      toast.error('Please fill all fields');
      return;
    }

    const amountInCents = Math.round(total * 100);
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInCents }),
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    if (result.error) {
      toast.error(result.error.message || 'Payment failed');
    } else if (result.paymentIntent?.status === 'succeeded') {
      toast.success('Payment successful! Booking confirmed.');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Lesson with {tutor?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Subject *</Label>
            <Select onValueChange={(value) => handleInputChange('subject', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {tutor?.subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Message</Label>
            <Textarea
              placeholder="Tell the tutor what you'd like to focus on..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
            />
          </div>

          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Duration:</span><span>{formData.duration} min</span></div>
                <div className="flex justify-between"><span>Rate:</span><span>${tutor?.hourly_rate}/hour</span></div>
                <div className="flex justify-between font-medium"><span>Total:</span><span>${total.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Label>Payment Details</Label>
            <CardElement className="border p-3 rounded-md" />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-lg">Pay & Book</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BookingModal(props: BookingModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <BookingModalInner {...props} />
    </Elements>
  );
}
