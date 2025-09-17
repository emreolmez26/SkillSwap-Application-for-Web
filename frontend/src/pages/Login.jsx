import React, { useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';  
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  // State tanımlamaları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation hook
  const navigate = useNavigate();

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend'e login request gönder
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });

      // Başarılı response kontrolü
      if (response.data.success) {
        // JWT token'ı localStorage'a kaydet
        localStorage.setItem('skillswap_token', response.data.token);
        
        // Dashboard'a yönlendir
        navigate('/dashboard');
      }
    } catch (error) {
      // Hata handling
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Giriş başarısız!');
      } else {
        setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ backgroundColor: '#f5f5f5' }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', margin: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Welcome Back
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Login in to continue your skill-sharing journey
          </Typography>
          
          {/* Error mesajı gösterimi */}
          {error && (
            <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}> {/* spacing={2} ekledim - alanlar arası boşluk */}
              <FormControl variant="outlined">
                <OutlinedInput
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FormHelperText>Email</FormHelperText>
              </FormControl>
              <FormControl variant="outlined">
                <OutlinedInput
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FormHelperText>Password</FormHelperText>
              </FormControl>
              
              {/* Remember me checkbox ve Forgot password link'i yan yana */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  } 
                label="Remember me" 
              />
              <Link 
                href="#" 
                variant="body2" 
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot your password?
              </Link>
            </Box>
            <Button 
              type="submit"
              variant="contained" 
              disabled={loading}
              fullWidth
            >
              {loading ? 'Giriş yapılıyor...' : 'LOGIN'}
            </Button>
          </Stack>
        </form>
        
        <Typography variant="body2" component="p" align="center" color="text.secondary" sx={{ mt: 2 }}>
          Dont have an account? <Link href="/register" variant='body2' color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign Up</Link>
        </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
