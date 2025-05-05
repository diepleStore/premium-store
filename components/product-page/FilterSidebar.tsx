'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProductStore } from '@/lib/store';
import { FilterState, SortOption } from '@/lib/types';

const colors = ['Red', 'Blue', 'Green', 'Black'];
const sizes = ['S', 'M', 'L', 'XL'];
const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour'];

export default function FilterSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, sort, setFilter, setSort, resetFilters } = useProductStore();

  const handleCheckboxChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const current = filters[key] as string[];
    const updated = checked ? [...current, value] : current.filter((item) => item !== value);
    setFilter(key, updated);
  };

  return (
    <div>
      {/* Mobile Filter Trigger */}
      <div className="md:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Lọc sản phẩm</Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 pt-24 overflow-scroll pb-20">
            <FilterContent
              filters={filters}
              sort={sort}
              setFilter={setFilter}
              setSort={setSort}
              handleCheckboxChange={handleCheckboxChange}
              resetFilters={resetFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block w-64 space-y-6">
        <FilterContent
          filters={filters}
          sort={sort}
          setFilter={setFilter}
          setSort={setSort}
          handleCheckboxChange={handleCheckboxChange}
          resetFilters={resetFilters}
        />
      </div>
    </div>
  );
}

interface FilterContentProps {
  filters: FilterState;
  sort: SortOption;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setSort: (sort: SortOption) => void;
  handleCheckboxChange: (key: keyof FilterState, value: string, checked: boolean) => void;
  resetFilters: () => void;
}

function FilterContent({
  filters,
  sort,
  setFilter,
  setSort,
  handleCheckboxChange,
  resetFilters,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Sắp xếp</h3>
        <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
            <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
            <SelectItem value="name-asc">Mới cập nhật</SelectItem>
            <SelectItem value="name-desc">Phổ biến nhất</SelectItem>
            <SelectItem value="name-desc">Bán chạy nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Màu sắc</h3>
        {colors.map((color) => (
          <div key={color} className="flex items-center space-x-2 mb-2">
            <Checkbox
              style={{ width: '23px', height: '23px' }}
              checked={filters.colors.includes(color)}
              onCheckedChange={(checked) => handleCheckboxChange('colors', color, !!checked)}
            />
            <label>{color}</label>
          </div>
        ))}
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Kích cỡ</h3>
        {sizes.map((size) => (
          <div key={size} className="flex items-center space-x-2 mb-2">
            <Checkbox
              style={{ width: '23px', height: '23px' }}
              checked={filters.sizes.includes(size)}
              onCheckedChange={(checked) => handleCheckboxChange('sizes', size, !!checked)}
            />
            <label>{size}</label>
          </div>
        ))}
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Thương hiệu</h3>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center space-x-2 mb-2">
            <Checkbox
              style={{ width: '23px', height: '23px' }}
              checked={filters.brands.includes(brand)}
              onCheckedChange={(checked) => handleCheckboxChange('brands', brand, !!checked)}
            />
            <label>{brand}</label>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Giá</h3>
        <Slider
          min={0}
          max={100000000}
          step={10}
          value={filters.priceRange}
          onValueChange={(value) => setFilter('priceRange', value as [number, number])}
          className="my-4"
        />
        <div className="flex justify-between text-sm">
          <span>{filters.priceRange[0]} đ</span>
          <span>{filters.priceRange[1]} đ</span>
        </div>
      </div>

      {/* Reset Filters */}
      <Button variant="outline" onClick={resetFilters}>
        Xóa Lọc
      </Button>
    </div>
  );
}