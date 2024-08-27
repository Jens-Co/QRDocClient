// src/components/Files.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faBars, faFolder, faQrcode, faTrash, faEdit, faUpload, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Button, Form, Modal as BootstrapModal, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import ImageViewer from './ImageViewer';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [uploadModalIsOpen, setUploadModalIsOpen] = useState(false);
  const [renameModalIsOpen, setRenameModalIsOpen] = useState(false);
  const [createFolderModalIsOpen, setCreateFolderModalIsOpen] = useState(false);
  const [qrCodeModalIsOpen, setQrCodeModalIsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const { '*': wildcardPath } = useParams();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentPath, setCurrentPath] = useState(decodeURIComponent(wildcardPath) || '');
  const qrCodeRef = useRef(null); 
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const backendHost = "http://localhost:3001";
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`${backendHost}/api/files/${encodeURIComponent(currentPath)}`, {
        withCredentials: true,
      });
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [currentPath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (wildcardPath) {
      setCurrentPath(decodeURIComponent(wildcardPath));
    } else {
      setCurrentPath('');
    }
  }, [wildcardPath]);

  const handleShowQrCode = (file) => {
    setQrCodeUrl(file.qrCode);
    setQrCodeModalIsOpen(true);
  };

  const handleDelete = async (filename, isDirectory) => {
    try {
      await axios.delete(`${backendHost}/api/files/${encodeURIComponent(currentPath)}/${encodeURIComponent(filename)}`, {
        withCredentials: true,
      });
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file or folder:", error.response ? error.response.data : error.message);
    }
  };

  const handleOpenRenameModal = (file) => {
    setCurrentFile(file);
    setNewFileName(file.name);
    setRenameModalIsOpen(true);
  };

  const handleCloseRenameModal = () => {
    setRenameModalIsOpen(false);
    setCurrentFile(null);
    setNewFileName('');
  };

  const handleRename = async () => {
    if (currentFile) {
      try {
        await axios.put(`${backendHost}/api/files/${encodeURIComponent(currentPath)}/${encodeURIComponent(currentFile.name)}`,
          { newName: newFileName },
          { withCredentials: true }
        );
        fetchFiles();
        handleCloseRenameModal();
      } catch (error) {
        console.error("Error renaming file:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('currentPath', currentPath);

    try {
      await axios.post(`${backendHost}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      fetchFiles();
      setUploadFile(null);
      setUploadModalIsOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(`${backendHost}/api/files/${encodeURIComponent(currentPath)}/create-folder`,
        { name: newFolderName },
        { withCredentials: true }
      );
      fetchFiles();
      setNewFolderName('');
      setCreateFolderModalIsOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleNavigate = (dir) => {
    const newPath = currentPath === '' ? dir : `${currentPath}/${dir}`;
    setCurrentPath(newPath);
    navigate(`/files/${encodeURIComponent(newPath)}`);
  };

  const handleFileOpen = (file) => {
    if (file.isDirectory) {
      handleNavigate(file.name);
    } else {
      const fileUrl = `${backendHost}/data/${encodeURIComponent(currentPath)}/${encodeURIComponent(file.name)}`;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
        setImageUrl(fileUrl);
        setShowImageViewer(true);
      } else {
        window.open(fileUrl, '_blank');
      }
    }
  };

  const handlePrintQrCode = () => {
    if (qrCodeRef.current) {
      const printArea = qrCodeRef.current.outerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { text-align: center; padding: 20px; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${printArea}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); }
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <img src="/images/sitelogo.png" alt="Logo" style={{ maxWidth: '150px' }} />
      </div>
      <div className="d-flex flex-column align-items-center mb-4">
        <Breadcrumb currentPath={currentPath} />
      </div>
      <div className="d-flex justify-content-center mb-4">
        <Dropdown className="d-block d-sm-none me-2">
          <Dropdown.Toggle variant="secondary">
            <FontAwesomeIcon icon={faBars} /> Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setUploadModalIsOpen(true)}>Upload</Dropdown.Item>
            <Dropdown.Item onClick={() => setCreateFolderModalIsOpen(true)}>Nieuwe Map</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button className="d-none d-sm-inline-block" variant="primary" onClick={() => setUploadModalIsOpen(true)}>
          <FontAwesomeIcon icon={faUpload} /> Upload
        </Button>
        <Button className="d-none d-sm-inline-block ms-2" variant="secondary" onClick={() => setCreateFolderModalIsOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Nieuwe Map
        </Button>
      </div>
      <div className="row">
        {files.map(file => (
          <div key={file.name} className="col-md-3 mb-4">
            <div className="tile" onClick={() => handleFileOpen(file)}>
              <div className="tile-icon">
                <FontAwesomeIcon icon={file.isDirectory ? faFolder : faFile} />
              </div>
              <div className="tile-content">
                <div className="tile-name">{file.name}</div>
                <div className="tile-actions">
                  <Button variant="link" onClick={(e) => { e.stopPropagation(); handleShowQrCode(file); }}>
                    <FontAwesomeIcon icon={faQrcode} />
                  </Button>
                  <Button variant="link" onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(file); }} className="text-warning">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button variant="link" onClick={(e) => { e.stopPropagation(); handleDelete(file.name, file.isDirectory); }} className="text-danger">
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ImageViewer Modal */}
      <ImageViewer show={showImageViewer} imageUrl={imageUrl} onClose={() => setShowImageViewer(false)} />

      {/* Existing Modals */}
      {/* Upload Modal */}
      <BootstrapModal show={uploadModalIsOpen} onHide={() => setUploadModalIsOpen(false)}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Upload Bestand</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Form>
            <Form.Group controlId="formFile">
              <Form.Label>Selecteer Bestand</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group controlId="formCurrentPath" className="mt-3">
              <Form.Label>Huidig pad</Form.Label>
              <Form.Control type="text" value={currentPath} readOnly />
            </Form.Group>
          </Form>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={() => setUploadModalIsOpen(false)}>Sluiten</Button>
          <Button variant="primary" onClick={handleFileUpload}>Upload</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>

      {/* Rename Modal */}
      <BootstrapModal show={renameModalIsOpen} onHide={handleCloseRenameModal}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Wijzig Naam</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Form.Group controlId="formNewFileName">
            <Form.Label>Nieuwe Naam</Form.Label>
            <Form.Control
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
          </Form.Group>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={handleCloseRenameModal}>Cancel</Button>
          <Button variant="primary" onClick={handleRename}>Rename</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>

      {/* Create Folder Modal */}
      <BootstrapModal show={createFolderModalIsOpen} onHide={() => setCreateFolderModalIsOpen(false)}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Maak Nieuwe Map</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Form.Group controlId="formNewFolderName">
            <Form.Label>Map Naam</Form.Label>
            <Form.Control
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </Form.Group>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={() => setCreateFolderModalIsOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateFolder}>Maak Map</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>

      {/* QR Code Modal */}
      <BootstrapModal show={qrCodeModalIsOpen} onHide={() => setQrCodeModalIsOpen(false)}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>QR Code</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          {qrCodeUrl && (
            <img ref={qrCodeRef} src={qrCodeUrl} alt="QR Code" className="img-fluid" />
          )}
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={() => setQrCodeModalIsOpen(false)}>Close</Button>
          <Button variant="primary" onClick={handlePrintQrCode}>Print QR</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>
    </div>
  );
}