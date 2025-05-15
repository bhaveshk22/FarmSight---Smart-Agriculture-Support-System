'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import WeatherApp from './WeatherApp';

interface WeatherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WeatherDialog({ open, onOpenChange }: WeatherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-md bg-white/90 max-w-md rounded-2xl shadow-lg">
        <WeatherApp />
      </DialogContent>
    </Dialog>
  );
}
