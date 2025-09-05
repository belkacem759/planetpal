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
import { useState } from 'react';

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
  ];

  const selectedDifficultyLabel = difficultyOptions.find(
    option => option.value === filters.difficulty
  )?.label || 'All Levels';

  const selectedCategoryName = categories.find(
    cat => cat.id === filters.category
  )?.name;

  // Applied price range from URL filters (used for display and slider init)
  const appliedRange: [number, number] = [
    filters.minPrice || 0,
    filters.maxPrice || 1000
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search plants and accessories..."
          value={filters.search || ''}
          onChange={(e) => setParam('search', e.target.value || null)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
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
                onClick={() => setParam('search', null)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCategoryName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategoryName}
              <button
                onClick={() => setParam('category', null)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
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
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">Category</h3>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <div className="space-y-2">
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
                {categories.map((category) => (
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
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
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
          </div>
        </div>
      )}
    </div>
  );
}