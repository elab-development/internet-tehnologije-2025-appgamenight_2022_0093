import React from 'react';
import { Form } from 'react-bootstrap';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea';
  name: string;
  value: string | number;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 3,
  min,
  max,
  onChange,
  onBlur
}) => {
  const isTextarea = type === 'textarea';

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      {isTextarea ? (
        <Form.Control
          as="textarea"
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          isInvalid={!!error}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : (
        <Form.Control
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          isInvalid={!!error}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default InputField;
