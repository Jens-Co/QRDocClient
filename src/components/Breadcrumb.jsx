import React from 'react';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFolder } from '@fortawesome/free-solid-svg-icons';

const Breadcrumb = ({ currentPath }) => {
  const navigate = useNavigate();
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <BootstrapBreadcrumb className="custom-breadcrumb">
      <BootstrapBreadcrumb.Item onClick={() => navigate('/files')}>
        <FontAwesomeIcon icon={faHome} className="breadcrumb-icon" /> Home
      </BootstrapBreadcrumb.Item>
      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join('/');
        return (
          <BootstrapBreadcrumb.Item
            key={path}
            active={index === pathParts.length - 1}
            onClick={() => navigate(`/files/${encodeURIComponent(path)}`)}
            
          >
            <FontAwesomeIcon icon={faFolder} className="breadcrumb-icon" /> {part}
          </BootstrapBreadcrumb.Item>
        );
      })}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;
