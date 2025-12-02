'use client';

import React, { useState, useMemo } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
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
  description?: string;
  avatar?: string;
  website?: string;
  degree?: string;
  hourly_rate?: number;
  staff_id?: number;
  service_id?: number;
  subjects: string[];
  education?: string;
  experience?: string;
  availability?: string[];
  teaching_experience?: string;
  teaching_style?: string;
  date_of_birth?: string;
  university?: string;
  graduation_year?: string;
  languages?: string;
  tutoring_experience?: string;
  why_tutor?: string;
  references?: string;
  location_city_state?: string;
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor?: WPTutor; // now optional
}

interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

interface DayData {
  date: string;
  fullDate: Date; // actual Date object for uniqueness
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
    duration: 60, // fixed 60 minutes
    message: '',
  });

  // Helpers
  function parseTwelveHour(time: string) {
    const m = time.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3];
    if (ap === 'pm' && h !== 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    return { h, min };
  }

  function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function toIsoWithOffset(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const offMin = -d.getTimezoneOffset();
    const sign = offMin >= 0 ? '+' : '-';
    const abs = Math.abs(offMin);
    const oh = pad(Math.floor(abs / 60));
    const om = pad(abs % 60);
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
      `${sign}${oh}:${om}`
    );
  }

  // Derive the actual selected date from the time-slot key: "timestamp|time"
  const selectedSlotDate: Date | null = useMemo(() => {
    if (!selectedTimeSlot) return null;
    const [ts] = selectedTimeSlot.split('|');
    const ms = Number(ts);
    if (!Number.isFinite(ms)) return null;
    const d = new Date(ms);
    return normalizeDate(d);
  }, [selectedTimeSlot]);

  // Generate mock time slots
  const generateTimeSlots = (date: Date, isWeekend: boolean = false): TimeSlot[] => {
    const baseSlots = [
      '7:00 am',
      '8:00 am',
      '9:00 am',
      '10:00 am',
      '11:00 am',
      '12:00 pm',
      '1:00 pm',
      '2:00 pm',
      '3:00 pm',
      '4:00 pm',
      '5:00 pm',
      '6:00 pm',
    ];

    return baseSlots.map((time) => ({
      time,
      available: !isWeekend && Math.random() > 0.3,
    }));
  };

  const generateTimeSlots2 = (date: Date): TimeSlot[] => {
    const baseSlots = [
      "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am",
      "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm",
      "5:00 pm", "6:00 pm"
    ];
  
    const weekday = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  
    // Find availability for this weekday ONLY
    const dayAvailability = tutor?.availability?.filter((a) =>
      a.toLowerCase().startsWith(weekday)
    ) ?? [];
  
    // Parse availability → blocks
    const blocks: Record<string, string[]> = {
      morning: ["7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am", "12:00 pm"],
      afternoon: ["1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm"],
      evening: ["6:00 pm"] // optional, you can expand
    };
  
    let allowedSlots: string[] = [];
  
    dayAvailability.forEach((item) => {
      const lower = item.toLowerCase();
      if (lower.includes("morning")) allowedSlots = allowedSlots.concat(blocks.morning);
      if (lower.includes("afternoon")) allowedSlots = allowedSlots.concat(blocks.afternoon);
      if (lower.includes("evening")) allowedSlots = allowedSlots.concat(blocks.evening);
    });
  
    const now = new Date();
  
    return baseSlots.map((time) => {
      const parsed = parseTwelveHour(time);
      if (!parsed) return { time, available: false };
  
      const slotDate = new Date(date);
      slotDate.setHours(parsed.h, parsed.min, 0, 0);
  
      const isInPast = slotDate.getTime() < now.getTime();
      const tutorAllows = allowedSlots.includes(time);
  
      return {
        time,
        available: tutorAllows && !isInPast, // always boolean
      };
    });
  };
  
  
  

  // Generate days for day view (3-day window)
  const generateDaysData = (): DayData[] => {
    const days: DayData[] = [];
    const startDate = new Date(selectedDate);
    // show selectedDate -1, selectedDate, selectedDate +1
    startDate.setDate(startDate.getDate() - 1);

    for (let i = 0; i < 3; i++) {
      const currentDate = normalizeDate(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      days.push({
        date: `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`,
        fullDate: new Date(currentDate), // store actual Date object
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        timeSlots: generateTimeSlots2(currentDate),
      });
    }

    return days;
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    

    const days: Array<{
      date: Date;
      isExist: boolean;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const todayName = currentDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      const exists = tutor?.availability?.some((slot) => slot.toLowerCase().startsWith(todayName));

      days.push({
        date: currentDate,
        isExist: !!exists,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: normalizeDate(currentDate).getTime() === normalizeDate(selectedDate).getTime(),
      });
    }
    return days;
  };

  const daysData = useMemo(() => generateDaysData(), [selectedDate, tutor]);
  const calendarDays = useMemo(() => generateCalendarDays(), [selectedDate, tutor]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const selectDate = (date: Date) => {
    const localDate = normalizeDate(date);
    setSelectedDate(localDate);
    setSelectedTimeSlot(null); // clear previously selected time when changing day
    if (viewMode === 'month') {
      setViewMode('day');
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      toast.error('Pick a time first');
      return;
    }

    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    if (!formData.subject || !selectedTimeSlot) {
      toast.error('Please fill all fields');
      return;
    }

    // selectedTimeSlot example: "1700284800000|10:00 am"
    const parts = selectedTimeSlot.split('|');
    if (parts.length < 2) {
      toast.error('Invalid selection');
      return;
    }
    const [ts] = parts;
    const timeStr = parts.slice(1).join('|'); // handle any pipes in time though not expected
    const parsed = parseTwelveHour(timeStr);
    if (!parsed) {
      toast.error('Invalid time slot format');
      return;
    }

    const ms = Number(ts);
    if (!Number.isFinite(ms) || !selectedSlotDate) {
      toast.error('Invalid date selection');
      return;
    }

    // Build the booking start using the actual slot date, not the current middle column
    const start = new Date(selectedSlotDate);
    start.setHours(parsed.h, parsed.min, 0, 0);
    const startIso = toIsoWithOffset(start);

    // Get WP user id (Header stores this in localStorage at login)
    const raw = localStorage.getItem('wpUserdata');
    const wpdata = raw ? JSON.parse(raw) : null;
    const userId = wpdata?.id;
    if (!userId) {
      toast.error('Not logged in (no WordPress user id found).');
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_BOOKLY_ENDPOINT!;
    const token = process.env.NEXT_PUBLIC_BOOKLY_TOKEN!;
    const serviceId = Number(tutor?.service_id || 0);
    const staffId = Number(tutor?.staff_id || 0);

    if (!endpoint || !token || !serviceId || !staffId) {
      toast.error('Missing Bookly env config.');
      return;
    }

    // Amount based on 1 hour (duration fixed to 60)
    const total = Number(tutor?.hourly_rate || 0);
    const amountInCents = Math.round(total * 100);

    try {
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
        return;
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Create booking in Bookly
        const res2 = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: serviceId,
            staff_id: staffId,
            tutor_id: tutor?.id,
            subject: formData.subject,
            message: formData.message,      
            start: startIso,
            user_id: Number(userId),
            persons: 1,
            customer: {
              full_name: wpdata?.first_name,
              email: wpdata?.email,
              phone: wpdata?.phone,
            },
            payment: {
              total: total,
              paid: total,
              currency: 'usd',
              status: 'completed',
              type: 'stripe',
              external: {
                gateway: 'sslcommerz',
                transaction_id: 'TXN12345',
                meta: { order_id: 'ABC-1' },
              },
            },
          }),
        });

        if (!res2.ok) {
          const err = await res2.json().catch(() => ({}));
          throw new Error(err?.message || `HTTP ${res2.status}`);
        }

        const data = await res2.json();
        console.log('Bookly response:', data);
        toast.success('Booking created!');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Booking failed: ${err.message || err}`);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // total uses 1 hour fixed duration
  const total = Number(tutor?.hourly_rate || 0);

  const selectedDisplayDate = selectedSlotDate || selectedDate;
  const selectedTimeText = selectedTimeSlot ? selectedTimeSlot.split('|')[1] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Lesson with {tutor?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            {/* Booking Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutor?.subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration removed - fixed at 60 minutes */}

              <div>
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell the author what you'd like to focus on..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Select Date</Label>
              <Card>
                <CardContent className="p-3">
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
                      {/* Header */}
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                          When would you like to meet?
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <span>Your time zone:</span>
                          <span className="font-medium">Pacific Time (US & Canada)</span>
                          <Info size={16} className="text-gray-400" />
                        </div>
                      </div>

                      {/* View Toggle */}
                      <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 rounded-full p-1 flex">
                          <button
                            type="button"
                            onClick={() => setViewMode('day')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              viewMode === 'day'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Day
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode('month')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              viewMode === 'month'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Month
                          </button>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-center mb-6">
                        <button
                          type="button"
                          onClick={() => navigateDate('prev')}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="mx-8 text-center">
                          {viewMode === 'month' ? (
                            <h2 className="text-lg font-semibold text-gray-900">
                              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </h2>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigateDate('next')}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <ChevronRight size={20} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Day View */}
                      {viewMode === 'day' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          {daysData.map((day, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                              <div className="text-center mb-4">
                                <h3 className="font-semibold text-gray-900">{day.date}</h3>
                                <p className="text-sm text-gray-600">{day.dayName}</p>
                              </div>
                              <div className="space-y-2">
                                {day.timeSlots.slice(0, 12).map((slot, slotIndex) => {
                                  const keyForSlot = `${day.fullDate.getTime()}|${slot.time}`;
                                  return (
                                    <button
                                      type="button"
                                      key={slotIndex}
                                      onClick={() =>
                                        slot.available && setSelectedTimeSlot(keyForSlot)
                                      }
                                      disabled={!slot.available}
                                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        !slot.available
                                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          : selectedTimeSlot === keyForSlot
                                          ? 'bg-blue-500 text-white shadow-md'
                                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                      }`}
                                    >
                                      {slot.time}
                                    </button>
                                  );
                                })}
                                {day.timeSlots.slice(12).some((slot) => !slot.available) && (
                                  <div className="text-xs text-gray-400 text-center pt-2">
                                    More times available
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Month View */}
                      {viewMode === 'month' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          {/* Calendar */}
                          <div>
                            <div className="grid grid-cols-7 gap-1 mb-4">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                <div
                                  key={index}
                                  className="text-center text-sm font-medium text-gray-600 py-2"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
  const isPastDate =
    normalizeDate(day.date).getTime() <
    normalizeDate(new Date()).getTime();

  return (
    <button
      key={index}
      onClick={() =>
        !isPastDate && day.isCurrentMonth && selectDate(day.date)
      }
      disabled={!day.isCurrentMonth || isPastDate}
      className={`aspect-square p-2 text-sm rounded-lg transition-all duration-200 ${
        !day.isCurrentMonth || isPastDate || !day.isExist
          ? 'text-gray-300 cursor-not-allowed'
          : day.isSelected
          ? 'bg-blue-500 text-white font-semibold shadow-md'
          : day.isToday
          ? 'bg-blue-100 text-blue-600 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {day.date.getDate()}
    </button>
  );
})}

                            </div>
                          </div>

                          {/* Selected Day Time Slots */}
                          <div className="bg-gray-50 rounded-xl p-6">
                            <div className="text-center mb-4">
                              <h3 className="font-semibold text-gray-900">
                                {monthNames[selectedDisplayDate.getMonth()]}{' '}
                                {selectedDisplayDate.getDate()}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {dayNames[selectedDisplayDate.getDay()]}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {generateTimeSlots2(selectedDisplayDate).slice(0, 8).map((slot, index) => {
                                const keyForSlot = `${selectedDisplayDate.getTime()}|${slot.time}`;
                                return (
                                  <button
                                    type="button"
                                    key={index}
                                    onClick={() =>
                                      slot.available && setSelectedTimeSlot(keyForSlot)
                                    }
                                    disabled={!slot.available}
                                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      !slot.available
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : selectedTimeSlot === keyForSlot
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                    }`}
                                  >
                                    {slot.time}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
                          <span>
                            Additional authors may contact you if they are able to help.
                          </span>
                          <Info size={16} className="text-gray-400" />
                        </div>

                        {selectedTimeText && selectedDisplayDate && (
                          <p className="mt-3 text-sm text-gray-600">
                            Selected: {selectedTimeText} on{' '}
                            {monthNames[selectedDisplayDate.getMonth()]}{' '}
                            {selectedDisplayDate.getDate()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>
                    {selectedDisplayDate
                      ? format(selectedDisplayDate, 'PPP')
                      : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTimeText ?? 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>${tutor?.hourly_rate}/hour</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${total?.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Label>Payment Details</Label>
            <CardElement className="border p-3 rounded-md" />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
            >
              Send Booking Request
            </Button>
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
