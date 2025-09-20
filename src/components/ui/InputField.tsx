'use client';
import React, { useState } from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  className?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue || isHovered;

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 pt-3 pb-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-50 focus:border-gray-50 transition-all duration-200"
          required={required}
        />
        <label
          className={`absolute bg-gray-800 px-2 transition-all duration-200 pointer-events-none ${
            isActive
              ? '-top-2 left-4 text-xs text-orange-400 font-medium'
              : 'top-1/2 left-4 -translate-y-1/2 text-sm text-gray-400'
          }`}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      </div>
    </div>
  );
};

export default InputField;
