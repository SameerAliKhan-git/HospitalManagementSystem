import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';

// Mock data - Replace with API call later
const mockDoctors = [
  {
    id: 1,
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    image: 'https://via.placeholder.com/300',
    experience: '15 years',
  },
  {
    id: 2,
    name: 'Dr. Sarah Johnson',
    specialty: 'Pediatrics',
    image: 'https://via.placeholder.com/300',
    experience: '10 years',
  },
  // Add more mock doctors as needed
];

function Doctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSpecialtyChange = (event: any) => {
    setSpecialty(event.target.value);
  };

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !specialty || doctor.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Our Doctors
        </Typography>
        
        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Search doctors"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={specialty}
                  label="Specialty"
                  onChange={handleSpecialtyChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Cardiology">Cardiology</MenuItem>
                  <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                  {/* Add more specialties */}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Doctors Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
          {filteredDoctors.map((doctor) => (
            <Box key={doctor.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardMedia
                    component="img"
                    height="300"
                    image={doctor.image}
                    alt={doctor.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {doctor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Specialty: {doctor.specialty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {doctor.experience}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export default Doctors;
