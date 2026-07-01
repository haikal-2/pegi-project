import React from 'react';

interface BadgeItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ icon, title, description }) => {
  return (
    <div className="badge-item">
      <div className="badge-icon-wrapper">
        {icon}
      </div>
      <h4 className="badge-title">{title}</h4>
      <p className="badge-desc">{description}</p>
    </div>
  );
};

export default BadgeItem;