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
  const { clearFilters, filters, hasActiveFilters, setParam, setParams } = useUrlFilters();

  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({
    limit: 100,
    offset: 0
  });

  const categories = categoriesData || [];
  const isLoading = categoriesLoading;

  const difficultyOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ] as const;
  
  const careInstructionTypes = [
    { label: 'Water Care', value: 'water' },
    { label: 'Light Requirements', value: 'light' },
    { label: 'Humidity Needs', value: 'humidity' },
    { label: 'Fertilizer Schedule', value: 'fertilizer' },
    { label: 'Temperature Range', value: 'temperature' },
  ] as const;
  
  const careDifficultyLevels = [
    { label: 'Very Easy (1)', value: 1 },
    { label: 'Easy (2)', value: 2 },
    { label: 'Moderate (3)', value: 3 },
    { label: 'Hard (4)', value: 4 },
    { label: 'Very Hard (5)', value: 5 },
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
      maxPrice: max < 1000 ? max : 1000,
      minPrice: min > 0 ? min : 0,
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
            className="pl-10"
            onChange={handleSearchChange}
            placeholder="Search products..."
            type="text"
            value={filters.search}
          />
          {filters.search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setParam('search', '')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </Button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            className="text-gray-500 hover:text-gray-700"
            onClick={clearFilters}
            variant="ghost"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge className="flex items-center gap-1" variant="secondary">
              Search: {filters.search}
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setParam('search', '')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Selected Categories Badges */}
          {selectedCategories.map((category) => (
            <Badge className="flex items-center gap-1" key={category.slug} variant="secondary">
              {category.name}
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => handleCategoryToggle(category.slug)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Price Range Badge */}
          {(filters.minPrice !== 0 || filters.maxPrice !== 1000) && (
            <Badge className="flex items-center gap-1" variant="secondary">
              ${filters.minPrice} - ${filters.maxPrice}
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setParams({ maxPrice: 1000, minPrice: 0 })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Difficulty Badge */}
          {filters.difficulty && (
            <Badge className="flex items-center gap-1" variant="secondary">
              {selectedDifficultyLabel}
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setParam('difficulty', null)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Plants Only Badge */}
          {filters.isPlant && (
            <Badge className="flex items-center gap-1" variant="secondary">
              Plants Only
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setParam('isPlant', false)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Care Instruction Difficulty Badges */}
          {careInstructionTypes.map(({ label, value }) => {
            const filterKey = `care_difficulty_${value}` as keyof typeof filters;
            const filterValue = filters[filterKey] as number | undefined;
            if (!filterValue) {return null;}

            return (
              <Badge className="flex items-center gap-1" key={value} variant="secondary">
                {label}: {filterValue}/5
                <button
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  onClick={() => setParam(filterKey, null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* Max Care Difficulty Badge */}
          {filters.max_care_difficulty && (
            <Badge className="flex items-center gap-1" variant="secondary">
              Max Difficulty: {filters.max_care_difficulty}/5
              <button
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setParam('max_care_difficulty', null)}
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
                    checked={filters.categories.length === 0}
                    id="all-categories-bar"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setParam('categories', []);
                      }
                    }}
                  />
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="all-categories-bar"
                  >
                    All Categories
                  </label>
                </div>
                {categories.map((category) => (
                  <div className="flex items-center space-x-2" key={category.id}>
                    <Checkbox
                      checked={filters.categories.includes(category.slug)}
                      id={`category-bar-${category.slug}`}
                      onCheckedChange={() => handleCategoryToggle(category.slug)}
                    />
                    <label
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      htmlFor={`category-bar-${category.slug}`}
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
                className="mb-4"
                max={1000}
                min={0}
                onValueChange={handlePriceRangeChange}
                step={10}
                value={[filters.minPrice, filters.maxPrice]}
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
                <Button className="w-full justify-between" variant="outline">
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
                checked={filters.isPlant}
                id="plants-only-bar"
                onCheckedChange={(checked) => setParam('isPlant', !!checked)}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="plants-only-bar"
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
                  {careInstructionTypes.map(({ label, value }) => {
                    const filterKey = `care_difficulty_${value}` as keyof typeof filters;
                    const currentValue = filters[filterKey] as number | undefined;

                    return (
                      <div key={value}>
                        <label className="text-sm font-medium mb-2 block">{label}</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="w-full justify-between" variant="outline">
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
                    <Button className="w-full justify-between" variant="outline">
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