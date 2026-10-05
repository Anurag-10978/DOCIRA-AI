import React from 'react';

interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
  onChange: (value: number) => void;
}

export const SliderSetting: React.FC<SliderSettingProps> = ({
  label, value, min, max, step = 1, unit = '', description, onChange,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <span className="text-sm font-bold text-accent">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 surface-control rounded-full appearance-none cursor-pointer accent-indigo-500"
    />
    <div className="flex justify-between text-[10px] text-text-muted">
      <span>{min}{unit}</span>
      {description && <span className="text-center">{description}</span>}
      <span>{max}{unit}</span>
    </div>
  </div>
);