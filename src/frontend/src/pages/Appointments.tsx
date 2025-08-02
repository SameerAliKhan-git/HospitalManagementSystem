import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';

// Mock data - Replace with API call later
const mockAppointments = [
  {
    id: 1,
    doctorName: 'Dr. John Smith',
    date: '2024-02-20',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: 2,
    doctorName: 'Dr. Sarah Johnson',
    date: '2024-02-22',
    time: '2:30 PM',
    status: 'Completed',
  },
];

function Appointments() {
  const [openDialog, setOpenDialog] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    date: '',
    time: '',
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement appointment booking logic
    console.log('Appointment form:', appointmentForm);
    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h3" component="h1">
              My Appointments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
            >
              Book New Appointment
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.doctorName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.status}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Box>

      {/* Book Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                name="doctorId"
                value={appointmentForm.doctorId}
                label="Select Doctor"
                onChange={handleFormChange as any}
              >
                <MenuItem value="1">Dr. John Smith</MenuItem>
                <MenuItem value="2">Dr. Sarah Johnson</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={appointmentForm.date}
              onChange={handleFormChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Time"
              name="time"
              type="time"
              value={appointmentForm.time}
              onChange={handleFormChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Book Appointment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Appointments;
