import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

function Matching() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState("Any");

  // API'den kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // LocalStorage'dan giriş yapan kullanıcının bilgisini al
        const currentUserData = localStorage.getItem('currentUser');
        let currentUserId = null;
        
        if (currentUserData) {
          try {
            const userData = JSON.parse(currentUserData);
            currentUserId = userData._id || userData.id;
          } catch (error) {
            console.error('Error parsing current user data:', error);
          }
        }
        
        // API çağrısı - backend'de filtreleme yap
        let apiUrl = 'http://localhost:3000/api/users';
        if (currentUserId) {
          apiUrl += `?excludeUserId=${currentUserId}`;
        }
        
        const response = await axios.get(apiUrl);
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Kullanıcılar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Konuşma başlat fonksiyonu
  const startConversation = async (otherUserId) => {
    try {
      const currentUserData = localStorage.getItem('currentUser');
      if (!currentUserData) {
        setError('Please login first');
        return;
      }

      const userData = JSON.parse(currentUserData);
      const currentUserId = userData._id || userData.id;

      console.log('Starting conversation between:', currentUserId, 'and', otherUserId);

      // Yeni konuşma oluştur
      const response = await axios.post('http://localhost:3000/api/conversations', {
        participants: [currentUserId, otherUserId]
      });

      console.log('Conversation created:', response.data);

      // Chat sayfasına yönlendir
      navigate('/chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
      
      // Daha detaylı hata mesajı
      if (error.response) {
        setError(`Failed to start conversation: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        setError('Failed to start conversation: No response from server');
      } else {
        setError(`Failed to start conversation: ${error.message}`);
      }
    }
  }; 
   
  return (
    <Box sx={{ display: "flex", p: 4, gap: 4 }}>
      {/* Sol taraf: Filtreler */}
      <Card sx={{ width: 250, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        {/* Availability Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Availability</InputLabel>
          <Select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <MenuItem value="Any">Any</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="Offline">Offline</MenuItem>
          </Select>
        </FormControl>

        {/* Location Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Location</InputLabel>
          <Select value="Anywhere">
            <MenuItem value="Anywhere">Anywhere</MenuItem>
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="Europe">Europe</MenuItem>
          </Select>
        </FormControl>

        {/* Skills Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Skills</InputLabel>
          <Select value="Any Skill">
            <MenuItem value="Any Skill">Any Skill</MenuItem>
            <MenuItem value="React">React</MenuItem>
            <MenuItem value="SEO">SEO</MenuItem>
          </Select>
        </FormControl>

        {/* Languages Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Languages</InputLabel>
          <Select value="Any Language">
            <MenuItem value="Any Language">Any Language</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Spanish">Spanish</MenuItem>
          </Select>
        </FormControl>

        {/* Apply Filters Button */}
        <Button variant="contained" fullWidth>
          Apply Filters
        </Button>
      </Card>

      {/* Sağ taraf: Kullanıcı Kartları */}
      <Box sx={{ flex: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Showing {users.length} results
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {users.map((user) => (
                <Card key={user._id} sx={{ width: 300 }}>
                  <CardContent>
                    {/* Kullanıcı Avatar */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ width: 50, height: 50, mr: 2 }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.bio || "No bio available"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Location */}
                    {user.location && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        📍 {user.location}
                      </Typography>
                    )}

                    {/* Teaches */}
                    <Typography variant="subtitle2">Teaches</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                        user.skillsToTeach.map((skill) => (
                          <Chip 
                            key={skill._id} 
                            label={skill.name} 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No skills to teach
                        </Typography>
                      )}
                    </Box>

                    {/* Wants to Learn */}
                    <Typography variant="subtitle2">Wants to Learn</Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                        user.skillsToLearn.map((skill) => (
                          <Chip 
                            key={skill._id} 
                            label={skill.name} 
                            color="success" 
                            variant="outlined" 
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No skills to learn
                        </Typography>
                      )}
                    </Box>

                    {/* Buttons */}
                    <Button variant="contained" fullWidth sx={{ mb: 1 }}>
                      Send Match Request
                    </Button>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ mb: 1 }}
                      onClick={() => startConversation(user._id)}
                    >
                      Send Message
                    </Button>
                    <Button variant="text" fullWidth>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Matching