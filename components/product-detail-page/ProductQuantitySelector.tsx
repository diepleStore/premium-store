'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ProductQuantitySelectorProps {
  selectedQuantity: number;
  setSelectedQuantity: (quantity: number) => void;
  maxQuantity: number;
}

export default function ProductQuantitySelector({
  selectedQuantity,
  setSelectedQuantity,
  maxQuantity,
}: ProductQuantitySelectorProps) {
  const [inputValue, setInputValue] = useState<string>(selectedQuantity.toString());

  const handleIncrement = () => {
    const newQuantity = Math.min(selectedQuantity + 1, maxQuantity);
    setSelectedQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(1, selectedQuantity - 1);
    setSelectedQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuantity) {
      setSelectedQuantity(numValue);
    }
  };

  return (
    <div className="mb-4 flex items-center space-x-2">
      <h3 className="text-lg font-semibold">Quantity</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={selectedQuantity <= 1}
      >
        -
      </Button>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-16 text-center"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={selectedQuantity >= maxQuantity}
      >
        +
      </Button>
    </div>
  );
}