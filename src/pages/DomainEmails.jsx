import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";

export default function DomainEmails() {
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editedEmails, setEditedEmails] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const API_URL = "http://localhost:8081/domainemails";

  const fetchRows = () => {
    axios.get(API_URL).then((res) => {
      const formatted = res.data.map((item) => ({
        id: item.id,
        domain: item.domain,
        emails: item.emails,
        status: item.status || "Pending",
      }));
      setRows(formatted);
    });
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const grouped = {};

      data.forEach((row) => {
        row.forEach((email) => {
          const domain = email.split("@")[1];
          if (domain) {
            if (!grouped[domain]) grouped[domain] = [];
            grouped[domain].push(email);
          }
        });
      });

      Object.entries(grouped).forEach(([domain, emails]) => {
        axios
          .post(API_URL, {
            domain,
            emails: emails.join(", "),
            status: "Pending",
          })
          .then((res) => {
            if (res.data.id) {
              setRows((prev) => [
                ...prev,
                {
                  id: res.data.id,
                  domain,
                  emails: emails.join(", "),
                  status: "Pending",
                },
              ]);
            } else {
              fetchRows(); 
            }
          })
          .catch(() => {
            fetchRows(); 
          });
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const domain = email.split("@")[1];
    if (!email || !domain) return;

    axios
      .post(API_URL, {
        domain,
        emails: email,
        status: "Pending",
      })
      .then((res) => {
        if (res.data.id) {
          setRows((prev) => [
            ...prev,
            { id: res.data.id, domain, emails: email, status: "Pending" },
          ]);
        } else {
          fetchRows(); 
        }
        form.reset();
      })
      .catch(() => {
        fetchRows(); 
      });
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setEditedEmails(row.emails.split(", ").join("\n"));
    setOpenDialog(true);
  };

  const handleDialogSave = () => {
    const updatedEmails = editedEmails
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email.includes("@"))
      .join(", ");

    axios
      .put(`${API_URL}/${editingRow.id}`, {
        domain: editingRow.domain,
        emails: updatedEmails,
        status: editingRow.status,
      })
      .then(() => {
        setRows((prev) =>
          prev.map((row) =>
            row.id === editingRow.id
              ? { ...row, emails: updatedEmails }
              : row
          )
        );
        setOpenDialog(false);
        setEditingRow(null);
        setEditedEmails("");
      });
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => {
      setRows((prev) => prev.filter((row) => row.id !== id));
    });
  };

  const confirmDelete = () => {
    if (rowToDelete) {
      handleDelete(rowToDelete.id);
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  };

  const columns = [
    { field: "domain", headerName: "Domain", width: 200 },
    { field: "emails", headerName: "Emails", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const color =
          params.value === "Sent"
            ? "green"
            : params.value === "Failed"
            ? "red"
            : "orange";
        return (
          <span style={{ color, fontWeight: "bold" }}>{params.value}</span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => handleEdit(params.row)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            color="black"
          >
            Edit
          </Button>
          <Button
            onClick={() => {
              setRowToDelete(params.row);
              setDeleteDialogOpen(true);
            }}
            variant="outlined"
            size="small"
            color="error"
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Domain-Based Emails
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" component="label">
          Upload Excel
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleUpload}
          />
        </Button>

        <form
          onSubmit={handleManualAdd}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <TextField name="email" label="Add Email Manually" size="small" />
          <Button type="submit" variant="contained">
            Add
          </Button>
        </form>
      </Box>

      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 50]}
        sx={{ backgroundColor: "white", boxShadow: 1 }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Edit Emails for: {editingRow?.domain}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            minRows={6}
            value={editedEmails}
            onChange={(e) => setEditedEmails(e.target.value)}
            placeholder="Enter one email per line"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete domain:{" "}
          <strong>{rowToDelete?.domain}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
