import React from 'react';
import { Button as BsButton, Spinner } from 'react-bootstrap';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | 'outline-primary' | 'outline-secondary' | 'outline-danger';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  type = 'button',
  size,
  disabled = false,
  loading = false,
  className = '',
  onClick
}) => {
  return (
    <BsButton
      variant={variant}
      type={type}
      size={size}
      disabled={disabled || loading}
      className={className}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Ucitavanje...
        </>
      ) : (
        children
      )}
    </BsButton>
  );
};

export default Button;
