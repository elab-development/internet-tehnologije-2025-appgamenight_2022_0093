import React from 'react';
import { Card as BsCard } from 'react-bootstrap';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerActions,
  footer,
  onClick,
  hoverable = false
}) => {
  const cardStyle: React.CSSProperties = {
    cursor: onClick || hoverable ? 'pointer' : 'default',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  return (
    <BsCard
      className={`${className} ${hoverable ? 'card-hoverable' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      {(title || headerActions) && (
        <BsCard.Header className="d-flex justify-content-between align-items-center">
          <div>
            {title && <h5 className="mb-0">{title}</h5>}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </BsCard.Header>
      )}
      <BsCard.Body>{children}</BsCard.Body>
      {footer && <BsCard.Footer>{footer}</BsCard.Footer>}
    </BsCard>
  );
};

export default Card;
