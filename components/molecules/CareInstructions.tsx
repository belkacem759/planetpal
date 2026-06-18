import { Product } from '@/types/types';
import { Droplets, Leaf, Package, Sun, Thermometer, Wind, Wrench, Zap } from 'lucide-react';

interface CareInstructionsProps {
  careInstructions: Product['care_instructions']
  isPlant: boolean;
}

export default function CareInstructions({ careInstructions, isPlant = false }: CareInstructionsProps) {
  if (!careInstructions) {return null;}

  const careIcons = {
    capacity: Package,
    features: Zap,
    fertilizer: Leaf,
    humidity: Wind,
    light: Sun,
    material: Wrench,
    temperature: Thermometer,
    water: Droplets,
  };

  const iconColors = {
    capacity: 'text-purple-500',
    features: 'text-orange-500',
    fertilizer: 'text-green-500',
    humidity: 'text-cyan-500',
    light: 'text-yellow-500',
    material: 'text-gray-600',
    temperature: 'text-red-500',
    water: 'text-blue-500',
  };

  const backgroundColors = {
    capacity: 'bg-purple-50 border-purple-100',
    features: 'bg-orange-50 border-orange-100',
    fertilizer: 'bg-green-50 border-green-100',
    humidity: 'bg-cyan-50 border-cyan-100',
    light: 'bg-yellow-50 border-yellow-100',
    material: 'bg-gray-50 border-gray-100',
    temperature: 'bg-red-50 border-red-100',
    water: 'bg-blue-50 border-blue-100',
  };

  const getDifficultyLevel = (difficulty?: number): number => {
    if (!difficulty) {return 1;}
    return Math.min(Math.max(difficulty, 1), 3);
  };

  const getDifficultyColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-green-200'; // light green
      case 2: return 'bg-green-400'; // green
      case 3: return 'bg-green-600'; // dark green
      default: return 'bg-gray-200';
    }
  };

  const DifficultyKnob = ({ difficulty }: { difficulty?: number }) => {
    const level = getDifficultyLevel(difficulty);
    if (level === 0) {return null;}

    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-gray-500 mr-1">Difficulty:</span>
        <div className="flex gap-0.5">
          {[1, 2, 3].map((i) => (
            <div
              className={`w-2 h-2 rounded-full ${i <= level ? getDifficultyColor(level) : 'bg-gray-200'
                }`}
              key={i}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderInstructions = () => {
    return Object.entries(careInstructions).map(([key, value]) => {
      if (!value || !value.text) {return null;}

      // Get icon and colors for the key
      const IconComponent = careIcons[key as keyof typeof careIcons];
      const iconColor = iconColors[key as keyof typeof iconColors] || 'text-gray-500';
      const bgColor = backgroundColors[key as keyof typeof backgroundColors] || 'bg-gray-50 border-gray-100';

      // Format the title
      const title = key.charAt(0).toUpperCase() + key.slice(1).replaceAll(/([A-Z])/g, ' $1');

      return (
        <div className={`flex items-start gap-2 p-2 rounded-lg border ${bgColor} transition-all hover:shadow-sm`} key={key}>
          <div className={`${iconColor} mt-0.5 shrink-0`}>
            {IconComponent ? (
              <IconComponent className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4 text-center text-xs">📋</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-0.5 text-gray-800">{title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{value.text}</p>
            <DifficultyKnob difficulty={value.difficulty} />
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Package className="h-5 w-5 text-gray-600" />
        Product Information
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {renderInstructions()}
      </div>
    </div>
  );
}