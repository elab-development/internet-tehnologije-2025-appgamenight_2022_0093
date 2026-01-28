import React from 'react';
import { Modal as BsModal } from 'react-bootstrap';
import Button from './Button';

interface ModalProps {
  show: boolean;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  loading?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
  showFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  show,
  title,
  children,
  size,
  confirmText = 'Potvrdi',
  cancelText = 'Odustani',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  showFooter = true
}) => {
  return (
    <BsModal show={show} onHide={onCancel} size={size} centered>
      <BsModal.Header closeButton>
        <BsModal.Title>{title}</BsModal.Title>
      </BsModal.Header>
      <BsModal.Body>{children}</BsModal.Body>
      {showFooter && (
        <BsModal.Footer>
          <Button variant="outline-secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          )}
        </BsModal.Footer>
      )}
    </BsModal>
  );
};

export default Modal;
