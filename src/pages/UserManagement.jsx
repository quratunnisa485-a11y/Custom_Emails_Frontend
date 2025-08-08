import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import "../styles/UserManagement.css";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    active: true,
    role: "user",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [authDialog, setAuthDialog] = useState({ open: false, action: null, user: null });
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/user-management")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  const handleFormOpen = (user = null) => {
    setEditingUser(user);
    setFormData(
      user || {
        name: "",
        email: "",
        contact: "",
        password: "",
        active: true,
        role: "user",
      }
    );
    setShowPassword(false);
    setOpenForm(true);
  };

  const handleFormSubmit = () => {
    if (editingUser) {
      axios
        .put(`http://localhost:8081/user-management/${editingUser.id}`, formData)
        .then(() => {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? { ...editingUser, ...formData } : u))
          );
          setOpenForm(false);
        })
        .catch((err) => console.error("Error updating user:", err));
    } else {
      axios
        .post("http://localhost:8081/user-management", formData)
        .then((res) => {
          const newUser = {
            id: res.data.id,
            ...formData,
          };
          setUsers((prev) => [...prev, newUser]);
          setOpenForm(false);
        })
        .catch((err) => console.error("Error adding user:", err));
    }
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8081/user-management/${deleteConfirm.id}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
        setDeleteConfirm({ open: false, id: null });
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  const handleVerifyCredentials = () => {
    axios
      .post("http://localhost:8081/verify-credentials", {
        Email: authEmail,
        Password: authPassword,
      })
      .then((res) => {
        if (res.data.success) {
          if (authDialog.action === "edit") {
            handleFormOpen(authDialog.user);
          } else if (authDialog.action === "delete") {
            setDeleteConfirm({ open: true, id: authDialog.user.id });
          }
          setAuthDialog({ open: false, action: null, user: null });
        } else {
          setAuthError("Invalid email or password");
        }
      })
      .catch(() => {
        setAuthError("Invalid email or password");
      });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "contact", headerName: "Contact", flex: 1, minWidth: 150 },
    { field: "role", headerName: "Role", flex: 0.5, minWidth: 100 },
    {
      field: "active",
      headerName: "Active",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <Tooltip title="Edit" key="edit">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => {
              setAuthDialog({ open: true, action: "edit", user: params.row });
              setAuthEmail("");
              setAuthPassword("");
              setAuthError("");
            }}
          />
        </Tooltip>,
        <Tooltip title="Delete" key="delete">
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              setAuthDialog({ open: true, action: "delete", user: params.row });
              setAuthEmail("");
              setAuthPassword("");
              setAuthError("");
            }}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <div className="main-background">
      <h2 style={{ color: "black" }}>User Management</h2>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleFormOpen()}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <DataGrid
            className="data-grid-style"
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
          />
        </div>
      </div>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editingUser ? "Update User" : "Add User"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            }
            label="Active"
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit}>
            {editingUser ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={authDialog.open} onClose={() => setAuthDialog({ open: false, action: null, user: null })}>
        <DialogTitle>Enter Email & Password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
          />
          {authError && <p style={{ color: "red" }}>{authError}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialog({ open: false, action: null, user: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleVerifyCredentials}>Verify</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
