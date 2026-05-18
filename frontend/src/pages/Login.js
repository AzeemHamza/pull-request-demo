import React, { useState, useContext } from 'react';
import { Container, Box, TextField, Button, Typography, Paper, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // error toast shown by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Welcome Back
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, py: 1.5 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>
          <Typography variant="body2" textAlign="center" mt={2}>
            Don't have an account? <Link component={RouterLink} to="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;