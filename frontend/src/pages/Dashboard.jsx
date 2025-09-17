import React, { useState, useEffect } from 'react'
import { Box, Grid, Container, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import SideBar from '../components/Sidebar'
import OverviewCards from '../components/OverwievCard';
import RecentMatches from '../components/RecentMatches';

function Dashboard() {
  console.log('Token:', localStorage.getItem('skillswap_token'));  // State tanımlamaları
  const [userData, setUserData] = useState(null);
  const [matchesData, setMatchesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Component mount olduğunda kullanıcı verilerini çek
  useEffect(() => {
    fetchUserData();
    fetchMatchesData();
  }, []);

  // Kullanıcı profil bilgilerini backend'den çek
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('skillswap_token');
      
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('User data fetch error:', error);
      setError('Kullanıcı bilgileri alınamadı');
    }
  };

  // Kullanıcının eşleşmelerini backend'den çek
  const fetchMatchesData = async () => {
    try {
      const token = localStorage.getItem('skillswap_token');
      
      const response = await axios.get('http://localhost:3000/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Son 3 eşleşmeyi al (received matches)
        const recentMatches = response.data.received.slice(0, 3);
        setMatchesData(recentMatches);
      }
    } catch (error) {
      console.error('Matches data fetch error:', error);
      setError('Eşleşme bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error durumu
  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    // ANA CONTAINER - Dashboard'ın tüm içeriği
    <Box sx={{ 
      display: 'flex',           // Flexbox kullan (yan yana dizim için)
      minHeight: '100vh',        // Minimum tam ekran yükseklik
      bgcolor: '#f8f9fa'         // Açık gri arka plan rengi
    }}>
      
      {/* SOL TARAF - SİDEBAR ALANI */}
      <Box sx={{ 
        width: 250,              // Sabit genişlik 250px (responsive değil)
        flexShrink: 0            // Ekran küçüldüğünde sidebar küçülmesin
      }}>
        {/* Sidebar component'i - Navigation menüsü */}
        {/* userData prop'unu Sidebar'a gönder */}
        <SideBar userData={userData} />
      </Box>
      
      {/* SAĞ TARAF - ANA İÇERİK ALANI */}
      <Box 
        component="main"         // Semantic HTML - main element'i
        sx={{ 
          flexGrow: 1,           // Kalan tüm alanı kapla (sidebar hariç)
          p: 3,                  // 24px padding (üst, alt, sol, sağ)
          bgcolor: '#f8f9fa'     // Ana içerik arka plan rengi
        }}
      >
        {/* ÜST KISIM - Overview kartları */}
        {/* Skills Shared, Skills Learned, Matches sayıları */}
        {/* userData prop'unu OverviewCards'a gönder */}
        <OverviewCards userData={userData} />
        
        {/* ALT KISIM - Recent Matches listesi */}
        <Box sx={{ 
          mt: 4                  // margin-top: 32px (OverviewCards'dan boşluk)
        }}>
          {/* Son eşleşmeler listesi - Backend'den gelen gerçek veri */}
          {/* matchesData prop'unu RecentMatches'e gönder */}
          <RecentMatches matchesData={matchesData} />
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard