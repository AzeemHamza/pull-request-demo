import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Divider } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleProfile = async () => {
    await updateProfile({ username, email });
  };

  const handlePassword = async () => {
    await changePassword(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Profile Settings</Typography>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleProfile}>Update Profile</Button>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
        <TextField label="Current Password" type="password" fullWidth margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <TextField label="New Password" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handlePassword}>Change Password</Button>
      </Paper>
    </Container>
  );
};

export default Profile;