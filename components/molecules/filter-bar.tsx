"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { useCategoriesQuery, useUrlFilters } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronDown, Filter, Search, X } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';

export function FilterBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { filters, setParam, clearFilters, hasActiveFilters, setParams } = useUrlFilters();

  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({
    limit: 100,
    offset: 0
  });

  const categories = categoriesData?.data || [];
  const isLoading = categoriesLoading;

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ] as const;
  
  const careInstructionTypes = [
    { value: 'water', label: 'Water Care' },
    { value: 'light', label: 'Light Requirements' },
    { value: 'humidity', label: 'Humidity Needs' },
    { value: 'fertilizer', label: 'Fertilizer Schedule' },
    { value: 'temperature', label: 'Temperature Range' },
  ] as const;
  
  const careDifficultyLevels = [
    { value: 1, label: 'Very Easy (1)' },
    { value: 2, label: 'Easy (2)' },
    { value: 3, label: 'Moderate (3)' },
    { value: 4, label: 'Hard (4)' },
    { value: 5, label: 'Very Hard (5)' },
  ];

  // Get selected categories by slug
  const selectedCategories = categories.filter((c) => 
    filters.categories.includes(c.slug)
  );

  const selectedDifficultyLabel = difficultyOptions.find(
    (option) => option.value === filters.difficulty
  )?.label || 'All Levels';

  // Handle category selection (multiple)
  const handleCategoryToggle = (categorySlug: string) => {
    const currentCategories = filters.categories;
    const isSelected = currentCategories.includes(categorySlug);
    
    if (isSelected) {
      // Remove category
      setParam('categories', currentCategories.filter(slug => slug !== categorySlug));
    } else {
      // Add category
      setParam('categories', [...currentCategories, categorySlug]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParam('search', value || '');
  };

  // Handle price range change
  const handlePriceRangeChange = (range: number[]) => {
    const [min, max] = range;
    setParams({
      minPrice: min > 0 ? min : 0,
      maxPrice: max < 1000 ? max : 1000,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Top Row: Search and Toggle */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => setParam('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </Button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <button
                onClick={() => setParam('search', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Selected Categories Badges */}
          {selectedCategories.map((category) => (
            <Badge key={category.slug} variant="secondary" className="flex items-center gap-1">
              {category.name}
              <button
                onClick={() => handleCategoryToggle(category.slug)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Price Range Badge */}
          {(filters.minPrice !== 0 || filters.maxPrice !== 1000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ${filters.minPrice} - ${filters.maxPrice}
              <button
                onClick={() => setParams({ minPrice: 0, maxPrice: 1000 })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Difficulty Badge */}
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

          {/* Plants Only Badge */}
          {filters.isPlant && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Plants Only
              <button
                onClick={() => setParam('isPlant', false)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Care Instruction Difficulty Badges */}
          {careInstructionTypes.map(({ value, label }) => {
            const filterKey = `care_difficulty_${value}` as keyof typeof filters;
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

          {/* Max Care Difficulty Badge */}
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

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Categories - Multiple Selection */}
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-categories-bar"
                    checked={filters.categories.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setParam('categories', []);
                      }
                    }}
                  />
                  <label
                    htmlFor="all-categories-bar"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Categories
                  </label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-bar-${category.slug}`}
                      checked={filters.categories.includes(category.slug)}
                      onCheckedChange={() => handleCategoryToggle(category.slug)}
                    />
                    <label
                      htmlFor={`category-bar-${category.slug}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="px-3">
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <h3 className="font-medium mb-3">Difficulty Level</h3>
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
          </div>

          {/* Plants Only */}
          <div>
            <h3 className="font-medium mb-3">Plants Only</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plants-only-bar"
                checked={filters.isPlant}
                onCheckedChange={(checked) => setParam('isPlant', !!checked)}
              />
              <label
                htmlFor="plants-only-bar"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only plants
              </label>
            </div>
          </div>

          {/* Care Instruction Difficulty Filters */}
          {filters.isPlant && (
            <>
              <div>
                <h3 className="font-medium mb-3">Care Instruction Difficulty</h3>
                <div className="space-y-4">
                  {careInstructionTypes.map(({ value, label }) => {
                    const filterKey = `care_difficulty_${value}` as keyof typeof filters;
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
              </div>

              <div>
                <h3 className="font-medium mb-3">Maximum Care Difficulty</h3>
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
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}