import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ImageViewer = ({ show, imageUrl, onClose }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      fullscreen
      className="image-viewer-modal"
    >
      <Modal.Body className="p-0" style={{ backgroundColor: 'black' }}>
        <img
          src={imageUrl}
          alt="Preview"
          className="img-fluid w-100 h-100"
          style={{ objectFit: 'contain' }}
        />
      </Modal.Body>
      <Button
        variant="light"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
      >
        Close
      </Button>
    </Modal>
  );
};

export default ImageViewer;
