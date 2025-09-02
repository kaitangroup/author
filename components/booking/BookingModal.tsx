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
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
  dayName: string;
  dayNumber: number;
  timeSlots: TimeSlot[];
}

export function BookingModal({ isOpen, onClose, tutor }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    time: '',
    duration: 60,
    message: '',
  });

    // Generate mock time slots
    const generateTimeSlots = (date: Date, isWeekend: boolean = false): TimeSlot[] => {
      const baseSlots = [
        '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm',
        '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm'
      ];
      
      return baseSlots.map((time, index) => ({
        time,
        available: !isWeekend && Math.random() > 0.3, // Random availability, less on weekends
      }));
    };
    const generateTimeSlots2 = (date: Date, isWeekend: boolean = false): TimeSlot[] => {
      const baseSlots = [
        '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm',
        '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm'
      ];
      const todayName = date.toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase(); // e.g. "monday"
      const exists = tutor?.availability?.some(slot => slot.toLowerCase().startsWith(todayName));
      
      return baseSlots.map((time, index) => ({
        time,
        available: exists? true:false, // Random availability, less on weekends
      }));
    };
   // Generate days for day view
  const generateDaysData = (): DayData[] => {
    const days: DayData[] = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 1);

    for (let i = 0; i < 3; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      days.push({
        date: `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`,
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        timeSlots: generateTimeSlots2(currentDate, isWeekend)
      });
    }
    
    return days;
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const todayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })
  .toLowerCase(); // e.g. "monday"
  const exists = tutor?.availability?.some(slot => slot.toLowerCase().startsWith(todayName));
 // const exists = true;
  
      days.push({
        date: currentDate,
        isExist: exists,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: currentDate.toDateString() === selectedDate.toDateString()
      });
    }
    return days;
  };

  const daysData = useMemo(() => generateDaysData(), [selectedDate]);
  const calendarDays = useMemo(() => generateCalendarDays(), [selectedDate]);

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
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.subject || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    const total = (tutor?.hourly_rate ? (tutor.hourly_rate * formData.duration) / 60 : 0);

    // const total = (tutor.hourly_rate * formData.duration) / 60;
    
    // Simulate booking
    toast.success(`Booking request sent! Total: $${total.toFixed(2)}`);
    onClose();
    
    // Reset form
   // setSelectedDate(undefined);
    setFormData({
      subject: '',
      time: '',
      duration: 60,
      message: '',
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 // const total = (tutor.hourly_rate * formData.duration) / 60;
 const total = (tutor?.hourly_rate ? (tutor.hourly_rate * formData.duration) / 60 : 0);

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

        

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="60 minutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell the tutor what you'd like to focus on..."
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
                  {day.timeSlots.slice(0, 6).map((slot, slotIndex) => (
                    <button
                      type="button"
                      key={slotIndex}
                      onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                      disabled={!slot.available}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !slot.available
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedTimeSlot === slot.time
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {day.timeSlots.slice(6).some(slot => !slot.available) && (
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
                  <div key={index} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day.isCurrentMonth && selectDate(day.date)}
                    disabled={!day.isCurrentMonth}
                    className={`aspect-square p-2 text-sm rounded-lg transition-all duration-200 ${
                      !day.isCurrentMonth || !day.isExist
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
                ))}
              </div>
            </div>

            {/* Selected Day Time Slots */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
                </h3>
                <p className="text-sm text-gray-600">{dayNames[selectedDate.getDay()]}</p>
              </div>
              <div className="space-y-2">
                {generateTimeSlots(selectedDate).slice(0, 8).map((slot, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                    disabled={!slot.available}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !slot.available
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedTimeSlot === slot.time
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
            <span>Additional tutors may contact you if they are able to help.</span>
            <Info size={16} className="text-gray-400" />
          </div>
          
          {selectedTimeSlot && (
            <p className="mt-3 text-sm text-gray-600">
              Selected: {selectedTimeSlot} on {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
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
                  <span>{selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{formData.time || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{formData.duration} minutes</span>
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

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
              Send Booking Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}