'use client';

import { colors, borderRadius } from '@/lib/design-tokens';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export function Input({ 
  label, 
  placeholder, 
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: colors.textSecondary 
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          backgroundColor: colors.surfaceVariant,
          border: error ? `2px solid ${colors.error}` : '2px solid transparent',
          borderRadius: borderRadius.md,
          padding: '14px 16px',
          fontSize: '16px',
          color: colors.textPrimary,
          outline: 'none',
          transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? colors.error : colors.primary;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? colors.error : 'transparent';
        }}
      />
      {error && (
        <span style={{ fontSize: '12px', color: colors.error }}>
          {error}
        </span>
      )}
    </div>
  );
}
