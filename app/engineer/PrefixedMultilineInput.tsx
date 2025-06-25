import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';

const MAX_LENGTH = 50;

function formatNumberedInput(text: string) {
  // Remove any existing numbering (e.g., "1. ", "2. ", etc.)
  const raw = text.replace(/(^|\n)\d+\.\s?/g, '');
  // Split into chunks of MAX_LENGTH
  const lines = [];
  for (let i = 0; i < raw.length; i += MAX_LENGTH) {
    lines.push(raw.substr(i, MAX_LENGTH));
  }
  // Add numbering
  return lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
}

interface PrefixedMultilineInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export default function PrefixedMultilineInput({ value, onChange, label }: PrefixedMultilineInputProps) {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (text: string) => {
    const formatted = formatNumberedInput(text);
    setInternalValue(formatted);
    onChange(formatted);
  };

  return (
    <View>
      {label ? <Text style={{ marginBottom: 4 }}>{label}</Text> : null}
      <TextInput
        multiline
        value={internalValue}
        onChangeText={handleChange}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 10,
          minHeight: 80,
          backgroundColor: '#f9f9f9',
          color: '#333',
        }}
        placeholder="Enter material details (each line max 50 chars)..."
      />
    </View>
  );
}
