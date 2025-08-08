import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function CustomEmails() {
  const [personalEmails, setPersonalEmails] = useState([]);
  const [domainOptions, setDomainOptions] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedSignature, setSelectedSignature] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/customemail/senders")
      .then((res) => res.json())
      .then(setPersonalEmails)
      .catch((err) => console.error("Failed to fetch personal emails", err));

    fetch("http://localhost:8081/customemail/domains")
      .then((res) => res.json())
      .then(setDomainOptions)
      .catch((err) => console.error("Failed to fetch domains", err));
  }, []);

  const handleSend = () => {
    if (!selectedEmail) return alert("Select sender email");
    if (!selectedDomain) return alert("Select domain");

    fetch("http://localhost:8081/customemail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromEmail: selectedEmail,
        subject,
        message,
        domain: selectedDomain,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Email sent successfully!");

          
          fetch(`http://localhost:8081/domainemails/update-status/${selectedDomain}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Sent" }),
          })
            .then((res) => res.json())
            .then((resp) => {
              console.log("Status updated:", resp);
            })
            .catch((err) => console.error("Status update failed", err));
        } else {
          alert("Failed to send email: " + (data.error || "Unknown Error"));
        }
      })
      .catch((err) => {
        console.error("Send Error", err);
        alert("Error sending email.");
      });
  };

  return (
    <Box sx={{ backgroundColor: "#e6f2ff", minHeight: "100vh", padding: "30px" }}>
      <Typography variant="h5" gutterBottom>
        Custom Email
      </Typography>

      <Box mb={3}>
        <TextField
          label="Subject"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </Box>

      <Box mb={3}>
        <TextField
          label="Message"
          fullWidth
          multiline
          rows={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Box>

      <Box mb={3}>
        <FormControl fullWidth>
          <InputLabel>Select Domain</InputLabel>
          <Select
            value={selectedDomain}
            label="Select Domain"
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            {domainOptions.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box mb={2}>
        <FormControl fullWidth>
          <InputLabel>Select Sender Email</InputLabel>
          <Select
            value={selectedEmail}
            label="Select Sender Email"
            onChange={(e) => {
              const selected = personalEmails.find((item) => item.email === e.target.value);
              setSelectedEmail(selected.email);
              setSelectedSignature(selected.signature);
            }}
          >
            {personalEmails.map((item) => (
              <MenuItem key={item.id} value={item.email}>
                {item.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedSignature && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Signature Preview:
          </Typography>
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
            }}
          >
            {selectedSignature}
          </Box>
        </Box>
      )}

      <Button variant="contained" color="primary" onClick={handleSend}>
        Send
      </Button>
    </Box>
  );
}
