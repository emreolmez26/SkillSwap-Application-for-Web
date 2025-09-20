import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Tab,
  Tabs,
  Divider,
  IconButton,
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // LocalStorage'dan giriş yapan kullanıcının bilgisini al
        const currentUserData = localStorage.getItem('currentUser');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          const userId = userData._id || userData.id;
          
          // API'den kullanıcı bilgilerini getir
          const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.username}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {user.bio || 'No bio available'}
              </Typography>
              {user.location && (
                <Typography variant="body1" color="text.secondary">
                  📍 {user.location}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Member since 2025
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<MessageIcon />}
                sx={{ px: 3 }}
              >
                Message
              </Button>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Skills Shared
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {user.skillsToTeach ? user.skillsToTeach.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Skills Learned
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {user.skillsToLearn ? user.skillsToLearn.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Matches
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Skills" />
            <Tab label="Interests" />
            <Tab label="Reviews" />
          </Tabs>
        </Box>

        {/* Skills Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Skills to Teach
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                  user.skillsToTeach.map((skill) => (
                    <Chip 
                      key={skill._id} 
                      label={skill.name} 
                      color="primary" 
                      variant="filled"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No skills to teach yet
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Skills to Learn
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                  user.skillsToLearn.map((skill) => (
                    <Chip 
                      key={skill._id} 
                      label={skill.name} 
                      color="success" 
                      variant="filled"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No skills to learn yet
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Interests Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Interests content will be added here...
          </Typography>
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">
            Reviews content will be added here...
          </Typography>
        </TabPanel>
      </Card>

      {/* About Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            About
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.bio || "I'm a passionate learner and teacher, excited to share my skills and learn new ones through SkillSwap. I believe in the power of community-driven learning and connecting with like-minded individuals. In my free time, I enjoy exploring new technologies and helping others grow their skills."}
          </Typography>
        </CardContent>
      </Card>

      {/* Recent Matches Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Recent Matches
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No matches yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start sharing skills to get matches!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default UserProfile;