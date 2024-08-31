import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faGear, faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const backendHost = process.env.REACT_APP_BACKEND_HOST;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendHost}/admin/users`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users. Please try again.");
    }
  };

  const handleAddUser = async () => {
    setError(null);
    setSuccess(null);
    if (!newUsername || !newPassword) {
      setError("Username and password are required.");
      return;
    }

    try {
      await axios.post(
        `${backendHost}/admin/users`,
        {
          username: newUsername,
          password: newPassword,
          role: newRole,
        },
        { withCredentials: true }
      );
      fetchUsers();
      setNewUserModal(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      setSuccess("User added successfully.");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Error adding user. Please try again.");
    }
  };

  const handleEditUser = async () => {
    setError(null);
    setSuccess(null);
    try {
      await axios.put(
        `${backendHost}/admin/users/${selectedUser}`,
        {
          newUsername: editUsername,
          newPassword: editPassword,
        },
        { withCredentials: true }
      );
      fetchUsers();
      setEditUserModal(false);
      setEditUsername("");
      setEditPassword("");
      setSuccess("User updated successfully.");
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user. Please try again.");
    }
  };

  const handleDeleteUser = async (username) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${backendHost}/admin/users/${username}`, {
        withCredentials: true,
      });
      fetchUsers();
      setSuccess("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error deleting user. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-4">
        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none"
          style={{ color: "inherit" }}
        >
          <img
            src="/images/sitelogo.png"
            alt="Logo"
            style={{ width: "50px", height: "50px", marginRight: "10px" }}
          />
          <h5 className="m-0 logoname">{process.env.REACT_APP_TITLE}</h5>
        </Link>
      </div>

      <div className="settings-bar d-flex justify-content-between align-items-center p-3">
        <Form className="d-flex">
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form>
        <div>
          <Button variant="primary" className="me-2" as={Link} to="/">
            <FontAwesomeIcon icon={faHome} /> Home
          </Button>
          <Button
            variant="success"
            className="me-2"
            onClick={() => setNewUserModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add User
          </Button>
        </div>
      </div>

      <div className="content">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="custom-table-container">
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th className="username-column">Username</th>
                <th className="role-column">Role</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.username}>
                  <td className="username-column">{user.username}</td>
                  <td className="role-column">{user.role}</td>
                  <td className="actions-column">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user.username);
                        setEditUsername(user.username);
                        setEditUserModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faGear} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal for Adding New User */}
      <Modal show={newUserModal} onHide={() => setNewUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
              />
            </Form.Group>
            <Form.Group controlId="formRole" className="mt-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNewUserModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Editing User */}
      <Modal show={editUserModal} onHide={() => setEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEditUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </Form.Group>
            <Form.Group controlId="formEditPassword" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditUserModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
