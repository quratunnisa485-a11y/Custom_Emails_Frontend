
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PersonalEmails() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = () => {
    fetch("http://localhost:8081/personalemails")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item, index) => ({
          id: index + 1,
          email: item.email,
          password: item.password,
          phone: item.phone || "",
          website: item.website || "",
          name: item.name || "",
          signature_email: item.signature_email || "",
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Error fetching emails:", err));
  };

  const handleDelete = (email) => {
    fetch(`http://localhost:8081/personalemails/${email}`, {
      method: "DELETE",
    })
      .then(() => {
        setRows((prevRows) => prevRows.filter((row) => row.email !== email));
        setOpenDelete(false);
      })
      .catch((err) => console.error("Delete error", err));
  };

  const buildSignature = (row) => {
    return `
      📞 ${row.phone}<br/>
      📧 ${row.signature_email}<br/>
      🔗 ${row.website}<br/>
      ✍️ Regards, ${row.name}
    `;
  };

  const columns = [
    { field: "email", headerName: "Email", flex: 1 },
    { field: "password", headerName: "Password", flex: 1 },
    {
      field: "signature",
      headerName: "Signature",
      flex: 2,
      renderCell: (params) => {
        const signature = buildSignature(params.row);
        return (
          <div
            style={{ whiteSpace: "normal" }}
            dangerouslySetInnerHTML={{ __html: signature }}
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => {
            setSelectedRow(params.row);
            setOpenAdd(true);
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedRow(params.row);
            setOpenDelete(true);
          }}
        />,
      ],
    },
  ];

  return (
    <div style={{ height: 450, marginBottom: 50 }}>
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => {
          setSelectedRow(null);
          setOpenAdd(true);
        }}
        sx={{ mb: 1 }}
      >
        Add Personal Email
      </Button>

      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        autoHeight
        getRowHeight={() => "auto"}
      />

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>{selectedRow ? "Update" : "Add"} Personal Email</DialogTitle>
        <AddOrEditForm
          selectedRow={selectedRow}
          setRows={setRows}
          rows={rows}
          onClose={() => setOpenAdd(false)}
        />
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this entry?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={() => handleDelete(selectedRow?.email)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function AddOrEditForm({ selectedRow, setRows, rows, onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    website: "",
    name: "",
    signature_email: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (selectedRow) {
      setFormData({
        email: selectedRow.email,
        password: selectedRow.password,
        phone: selectedRow.phone,
        website: selectedRow.website,
        name: selectedRow.name,
        signature_email: selectedRow.signature_email,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        phone: "",
        website: "",
        name: "",
        signature_email: "",
      });
    }
  }, [selectedRow]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and Password are required");
      return;
    }

    if (selectedRow) {
     
      fetch(`http://localhost:8081/personalemails/${formData.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: formData.password,
          phone: formData.phone,
          website: formData.website,
          name: formData.name,
          signature_email: formData.signature_email,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Update failed");
          return res.json();
        })
        .then(() => {
          setRows(
            rows.map((row) =>
              row.email === formData.email ? { ...row, ...formData } : row
            )
          );
          onClose();
        })
        .catch(() => {
          setError("Failed to update email");
        });
    } else {
      
      fetch("http://localhost:8081/personalemails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Insert failed");
          }
          return res.json();
        })
        .then(() => {
          const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
          setRows([...rows, { id: newId, ...formData }]);
          onClose();
        })
        .catch((err) => {
          if (err.message.includes("Duplicate") || err.message.includes("UNIQUE")) {
            setError("Email already exists");
          } else {
            setError("Failed to add email");
          }
        });
    }
  };

  return (
    <>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            name="email"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={!!selectedRow}
          />
          <TextField
            name="password"
            label="Password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            name="phone"
            label="Phone"
            fullWidth
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            name="website"
            label="Website"
            fullWidth
            value={formData.website}
            onChange={handleChange}
          />
          <TextField
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            name="signature_email"
            label="Signature Email"
            fullWidth
            value={formData.signature_email}
            onChange={handleChange}
          />

          {error && (
            <Typography color="error" variant="body2">
              ❌ {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {selectedRow ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </>
  );
}
