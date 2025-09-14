'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUrlFilters, FilterParams } from '@/hooks/useUrlFilters';
import { useCategoriesQuery, Category } from '@/hooks/useCategories';
import type { ChangeEvent } from 'react';

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

const CollapsibleSection = ({ title, defaultOpen = true, children }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center font-medium py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:shadow-sm group"
      >
        <h3 className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{title}</h3>
        {isOpen ? <ChevronUp className="h-4 w-4 group-hover:text-green-500 transition-all duration-200" /> : <ChevronDown className="h-4 w-4 group-hover:text-green-500 transition-all duration-200" />}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
};

export function FilterSidebar() {
  const { filters, setParam, setParams, clearFilters } = useUrlFilters();
  const { data: categoriesData, isLoading } = useCategoriesQuery();
  const categories: Category[] = categoriesData?.categories || [];

  // Local search input state decoupled from URL to avoid lag
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Keep local input synced when URL search changes elsewhere
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounce URL updates from local input
  // Removed local debounced effect to avoid double debouncing. The hook already debounces URL updates.

  // Price range state
  const [appliedRange, setAppliedRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000,
  ]);

  // Update local price range when URL params change
  useEffect(() => {
    setAppliedRange([filters.minPrice || 0, filters.maxPrice || 1000]);
  }, [filters.minPrice, filters.maxPrice]);

  // Difficulty options
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  // Care instruction types
  const careInstructionTypes = [
    { value: 'watering', label: 'Watering' },
    { value: 'sunlight', label: 'Sunlight' },
    { value: 'soil', label: 'Soil' },
  ];

  // Care difficulty levels
  const careDifficultyLevels = [
    { value: 1, label: 'Level 1/5' },
    { value: 2, label: 'Level 2/5' },
    { value: 3, label: 'Level 3/5' },
    { value: 4, label: 'Level 4/5' },
    { value: 5, label: 'Level 5/5' },
  ];

  // Selected category name
  const selectedCategory = categories.find((c: Category) => c.id === filters.category);
  const selectedCategoryName = selectedCategory?.name;

  // Selected difficulty label
  const selectedDifficultyOption = difficultyOptions.find((o) => o.value === filters.difficulty);
  const selectedDifficultyLabel = selectedDifficultyOption?.label || 'All Levels';

  // Check if there are any active filters
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== null);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-black z-10 pb-4 border-b mb-4">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Filters
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Search Field */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value;
              setSearchInput(v);
              setParam('search', v ? v : null);
            }}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => setParam('search', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {selectedCategoryName && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 animate-in slide-in-from-left-2">
                {selectedCategoryName}
                <button
                  onClick={() => setParam('category', null)}
                  className="ml-1 hover:bg-blue-300 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors duration-150 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ${filters.minPrice || 0} - ${filters.maxPrice || 1000}
                <button
                  onClick={() => {
                    setParams({ minPrice: undefined, maxPrice: undefined });
                  }}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.difficulty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedDifficultyLabel}
                <button
                  onClick={() => setParam('difficulty', null)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.isPlant && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Plants Only
                <button
                  onClick={() => setParam('isPlant', null)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Care Instruction Difficulty Badges */}
            {careInstructionTypes.map(({ value, label }) => {
              const filterKey = `care_difficulty_${value}` as keyof FilterParams;
              const filterValue = filters[filterKey] as number | undefined;
              if (!filterValue) return null;

              return (
                <Badge key={value} variant="secondary" className="flex items-center gap-1">
                  {label}: {filterValue}/5
                  <button
                    onClick={() => setParam(filterKey, null)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}

            {filters.max_care_difficulty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Max Difficulty: {filters.max_care_difficulty}/5
                <button
                  onClick={() => setParam('max_care_difficulty', null)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <CollapsibleSection title="Category" defaultOpen={true}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm text-gray-500">Loading categories...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              <button
                onClick={() => setParam('category', null)}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  !filters.category
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-50"
                )}
              >
                All Categories
              </button>
              {categories.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => setParam('category', category.id)}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    filters.category === category.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Price Range */}
        <CollapsibleSection title="Price Range">
          <div className="px-3">
            <Slider
              key={`price-${appliedRange[0]}-${appliedRange[1]}`}
              defaultValue={appliedRange}
              onValueCommit={(range) => {
                const [min, max] = range;
                setParams({
                  minPrice: min > 0 ? min : undefined,
                  maxPrice: max < 1000 ? max : undefined,
                });
              }}
              max={1000}
              min={0}
              step={10}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${appliedRange[0]}</span>
              <span>${appliedRange[1]}</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Difficulty Level */}
        <CollapsibleSection title="Difficulty Level">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedDifficultyLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuItem onClick={() => setParam('difficulty', null)}>
                All Levels
              </DropdownMenuItem>
              {difficultyOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setParam('difficulty', option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CollapsibleSection>

        {/* Plants Only */}
        <CollapsibleSection title="Plants Only">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="plants-only"
              checked={!!filters.isPlant}
              onCheckedChange={(checked) => setParam('isPlant', checked || null)}
            />
            <label
              htmlFor="plants-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only plants
            </label>
          </div>
        </CollapsibleSection>

        {/* Care Instruction Difficulty Filters */}
        {filters.isPlant && (
          <>
            <CollapsibleSection title="Care Instruction Difficulty">
              <div className="space-y-4">
                {careInstructionTypes.map(({ value, label }) => {
                  const filterKey = `care_difficulty_${value}` as keyof FilterParams;
                  const currentValue = filters[filterKey] as number | undefined;

                  return (
                    <div key={value}>
                      <label className="text-sm font-medium mb-2 block">{label}</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {currentValue ? `Level ${currentValue}/5` : 'Any Level'}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setParam(filterKey, null)}>
                            Any Level
                          </DropdownMenuItem>
                          {careDifficultyLevels.map((level) => (
                            <DropdownMenuItem
                              key={level.value}
                              onClick={() => setParam(filterKey, level.value)}
                            >
                              {level.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Maximum Care Difficulty">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.max_care_difficulty ? `Max ${filters.max_care_difficulty}/5` : 'No Limit'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setParam('max_care_difficulty', null)}>
                    No Limit
                  </DropdownMenuItem>
                  {careDifficultyLevels.map((level) => (
                    <DropdownMenuItem
                      key={level.value}
                      onClick={() => setParam('max_care_difficulty', level.value)}
                    >
                      Max {level.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-gray-500 mt-1">
                Show plants where all care instructions are at or below this difficulty level
              </p>
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}