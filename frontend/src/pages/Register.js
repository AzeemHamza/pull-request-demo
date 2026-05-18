import React, { useState, useContext } from 'react';
import { Container, Box, TextField, Button, Typography, Paper, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      // toast handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Create Account
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, py: 1.5 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>
          <Typography variant="body2" textAlign="center" mt={2}>
            Already have an account? <Link component={RouterLink} to="/login">Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;