'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductSizeSelectorProps {
  sizes: string[];
  selectedOption2: string | null;
  setSelectedOption2: (option2: string) => void;
}

export default function ProductSizeSelector({ sizes, selectedOption2, setSelectedOption2 }: ProductSizeSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Size</h3>
      <Select value={selectedOption2 || ''} onValueChange={setSelectedOption2}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}