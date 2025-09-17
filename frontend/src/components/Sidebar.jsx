import React from 'react'
import { Box, List, ListItemButton, ListItemText, Avatar, Typography } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ userData }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation fonksiyonu - hangi sayfaya gidileceğini belirler
  const handleNavigation = (text) => {
    switch(text) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Skills':
        navigate('/skills');
        break;
      case 'Matches':
        navigate('/matching');
        break;
      case 'Messages':
        navigate('/chat');
        break;
      case 'Profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  // Aktif sayfa kontrolü - hangi link'in seçili görüneceğini belirler
  const isActivePage = (text) => {
    switch(text) {
      case 'Dashboard':
        return location.pathname === '/dashboard';
      case 'Skills':
        return location.pathname === '/skills';
      case 'Matches':
        return location.pathname === '/matching';
      case 'Messages':
        return location.pathname === '/chat';
      case 'Profile':
        return location.pathname === '/profile';
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: 240, p:2, bgcolor:"#f8f9fc", height:"100vh" }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar src="/images/profile.jpg" />
        <Box>
          <Typography variant="subtitle1" >
            {userData ? userData.username : 'Loading...'}
          </Typography>
          <Typography variant="caption">
            {userData ? `Member since ${new Date(userData.createdAt).getFullYear()}` : 'Loading...'}
          </Typography>
        </Box>
      </Box>
      <List sx={{ color: 'primary.main', fontWeight: 'bold', }}>
        {["Dashboard", "Matches", "Messages", "Skills", "Profile"].map((text) => (
          <ListItemButton 
            key={text}
            onClick={() => handleNavigation(text)}
            sx={{
              bgcolor: isActivePage(text) ? 'primary.light' : 'transparent',
              color: isActivePage(text) ? 'primary.contrastText' : 'primary.main',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
          >
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

export default Sidebar