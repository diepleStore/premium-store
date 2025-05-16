'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductColorSelectorProps {
  colors: string[];
  selectedOption1: string | null;
  setSelectedOption1: (option1: string) => void;
}

export default function ProductColorSelector({ colors, selectedOption1, setSelectedOption1 }: ProductColorSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Color</h3>
      <Select value={selectedOption1 || ''} onValueChange={setSelectedOption1}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color} value={color}>
              {color}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}