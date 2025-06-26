import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';


interface PrefixedMultilineInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const styles = StyleSheet.create({
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
});

export default function PrefixedMultilineInput({ value, onChange, label }: PrefixedMultilineInputProps) {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (text: string) => {
    setInternalValue(text);
    onChange(text);
  };





  return (
    <View>
      {label ? <Text style={styles.formLabel}>{label}</Text> : null}
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
        maxLength={300}
        placeholder="Enter material details...upto 300 characters"
      />
    </View>
  );
}
