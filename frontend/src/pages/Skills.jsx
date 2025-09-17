// ========================================
// SKILLS MANAGEMENT SAYFASI
// ========================================
// Amaç: Kullanıcının öğretebileceği ve öğrenmek istediği becerileri yönetmesi
// Özellikler: Skill ekleme, silme, listeleme, backend entegrasyonu
// API'ler: /api/skills (oluştur), /api/skills/add-to-user (ekle), /api/skills/remove-from-user (sil)

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";

export default function ManageSkills() {
  // ========================================
  // STATE YÖNETİMİ
  // ========================================
  
  // SKILL LİSTELERİ - Object array formatında {_id, name}
  const [teachSkills, setTeachSkills] = useState([]);      // Öğretebileceğim beceriler
  const [learnSkills, setLearnSkills] = useState([]);      // Öğrenmek istediğim beceriler
  
  // FORM INPUT'LARI - Yeni skill ekleme için
  const [newTeachSkill, setNewTeachSkill] = useState("");  // Teach skill input değeri
  const [newLearnSkill, setNewLearnSkill] = useState("");  // Learn skill input değeri
  
  // LOADING VE ERROR STATE'LERİ - UX için
  const [loading, setLoading] = useState(true);            // Sayfa ilk yüklenirken
  const [actionLoading, setActionLoading] = useState(false); // API işlemleri sırasında
  const [error, setError] = useState('');                  // Hata mesajları
  const [success, setSuccess] = useState('');              // Başarı mesajları

  // ========================================
  // COMPONENT LIFECYCLE
  // ========================================
  
  // Component mount olduğunda kullanıcının mevcut skills'lerini çek
  useEffect(() => {
    fetchUserSkills(); // Sayfa açılır açılmaz çalışır
  }, []); // Boş dependency array = sadece bir kez çalışır

  // ========================================
  // API ÇAĞRILARI
  // ========================================
  
  // KULLANICI SKILLS'LERİNİ BACKEND'DEN ÇEK
  // Amaç: Kullanıcının mevcut skillsToTeach ve skillsToLearn listelerini al
  // API: GET /api/auth/me
  const fetchUserSkills = async () => {
    try {
      // JWT token'ı localStorage'dan al (authentication için)
      const token = localStorage.getItem('skillswap_token');
      
      // Backend'den kullanıcı bilgilerini çek
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}` // Token'ı header'da gönder
        }
      });

      if (response.data.success) {
        // Skills'leri object array olarak store et (name ve id ile)
        // Backend'den gelen format: [{_id: "123", name: "JavaScript"}, ...]
        const teachSkillsWithIds = response.data.user.skillsToTeach || [];
        const learnSkillsWithIds = response.data.user.skillsToLearn || [];
        
        setTeachSkills(teachSkillsWithIds); // State'i güncelle
        setLearnSkills(learnSkillsWithIds);
      }
    } catch (error) {
      console.error('Skills fetch error:', error);
      setError('Skills yüklenemedi'); // Hata durumunda kullanıcıya bildir
    } finally {
      setLoading(false); // Loading state'ini bitir (başarı/hata fark etmez)
    }
  };

  // ========================================
  // SKILL EKLEME FONKSİYONLARI
  // ========================================
  
  // ÖĞRETEBİLECEĞİM SKILL EKLEME
  // İşlem Adımları: 1) Skill oluştur 2) Kullanıcıya ekle 3) UI güncelle
  const handleAddTeachSkill = async () => {
    // ADIM 1: VALIDATION - Boş ve tekrar kontrolü
    const skillName = newTeachSkill.trim(); // Başındaki/sonundaki boşlukları temizle
    const skillExists = teachSkills.some(skill => 
      skill.name && skill.name.toLowerCase() === skillName.toLowerCase()
    ); // Büyük/küçük harf duyarsız arama
    
    if (skillName !== "" && !skillExists) { // Boş değil ve tekrar değilse devam et
      setActionLoading(true); // Butonu disable et, loading göster
      try {
        const token = localStorage.getItem('skillswap_token');
        
        // ADIM 2: SKİLL OLUŞTUR
        // API: POST /api/skills - Skill veritabanında yoksa oluştur
        let createResponse;
        try {
          createResponse = await axios.post('http://localhost:3000/api/skills', {
            name: skillName // Sadece skill adını gönder
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (skillCreateError) {
          // 400 hatası = skill zaten var, response'u al
          if (skillCreateError.response?.status === 400) {
            createResponse = skillCreateError.response;
          } else {
            throw skillCreateError; // Başka hata varsa yukarı fırlat
          }
        }

        let skillId; // Skill'in veritabanındaki ID'si
        if (createResponse.data.success) {
          // Yeni skill oluşturuldu
          skillId = createResponse.data.skill._id;
        } else {
          // Skill zaten varsa, mevcut skill'in ID'sini al
          const existingSkill = createResponse.data.existingSkill;
          if (existingSkill) {
            skillId = existingSkill._id;
            console.log('Mevcut skill kullanılıyor:', existingSkill.name);
          } else {
            throw new Error('Skill oluşturulamadı');
          }
        }

        // ADIM 3: SKİLL'İ KULLANICIYA EKLE
        // API: POST /api/skills/add-to-user - Skill'i kullanıcının teach listesine ekle
        const addResponse = await axios.post('http://localhost:3000/api/skills/add-to-user', {
          skillId: skillId,  // Skill'in veritabanındaki ID'si
          type: 'teach'      // "teach" listesine ekle
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (addResponse.data.success) {
          // ADIM 4: UI'I GÜNCELLE
          // Yeni skill'i local state'e ekle (sayfa yenilemeye gerek yok)
          const newSkillObj = { _id: skillId, name: skillName };
          setTeachSkills([...teachSkills, newSkillObj]); // Mevcut listeye ekle
          setNewTeachSkill(""); // Input'u temizle
          setSuccess('Skill başarıyla eklendi!'); // Success notification göster
        }
      } catch (error) {
        // HATA YÖNETİMİ - Detaylı hata mesajı
        console.error('Add teach skill error:', error);
        console.error('Error response:', error.response?.data);
        
        // Hangi adımda hata oluştu?
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Bu skill zaten mevcut')) {
          setError('Bu skill zaten listende var!');
        } else {
          setError('Skill eklenemedi: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setActionLoading(false); // Loading'i bitir (başarı/hata fark etmez)
      }
    }
  };

  // ========================================
  // SKILL SİLME FONKSİYONLARI
  // ========================================
  
  // ÖĞRETEBİLECEĞİM SKILL SİLME
  // API: DELETE /api/skills/remove-from-user
  const handleDeleteTeachSkill = async (skillObj) => {
    setActionLoading(true); // Loading başlat
    try {
      const token = localStorage.getItem('skillswap_token');
      
      // Backend'e silme isteği gönder
      const response = await axios.delete('http://localhost:3000/api/skills/remove-from-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          skillId: skillObj._id, // Skill'in veritabanındaki ID'si
          type: 'teach'          // "teach" listesinden sil
        }
      });

      if (response.data.success) {
        // Backend'den başarı gelirse: Local state'i güncelle (UI'dan skill'i kaldır)
        setTeachSkills(teachSkills.filter((s) => s._id !== skillObj._id));
        setSuccess('Skill başarıyla silindi!'); // Success notification göster
      }
    } catch (error) {
      console.error('Delete teach skill error:', error);
      setError('Skill silinemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false); // Loading'i bitir (başarı/hata fark etmez)
    }
  };

  // ========================================
  // ÖĞRENMEK İSTEDİĞİM SKILL EKLEME
  // ========================================
  // Aynı mantık: 1) Skill oluştur 2) Kullanıcıya ekle 3) UI güncelle
  const handleAddLearnSkill = async () => {
    // ADIM 1: VALIDATION - Boş ve tekrar kontrolü
    const skillName = newLearnSkill.trim(); // Başındaki/sonundaki boşlukları temizle
    const skillExists = learnSkills.some(skill => 
      skill.name && skill.name.toLowerCase() === skillName.toLowerCase()
    ); // Büyük/küçük harf duyarsız arama
    
    if (skillName !== "" && !skillExists) {
      setActionLoading(true); // Butonu disable et, loading göster
      try {
        const token = localStorage.getItem('skillswap_token');
        
        // ADIM 2: SKİLL OLUŞTUR
        // API: POST /api/skills - Skill veritabanında yoksa oluştur
        let createResponse;
        try {
          createResponse = await axios.post('http://localhost:3000/api/skills', {
            name: skillName // Sadece skill adını gönder
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (skillCreateError) {
          // 400 hatası = skill zaten var, response'u al
          if (skillCreateError.response?.status === 400) {
            createResponse = skillCreateError.response;
          } else {
            throw skillCreateError; // Başka hata varsa yukarı fırlat
          }
        }

        let skillId; // Skill'in veritabanındaki ID'si
        if (createResponse.data.success) {
          // Yeni skill oluşturuldu
          skillId = createResponse.data.skill._id;
        } else {
          // Skill zaten varsa, mevcut skill'in ID'sini al
          const existingSkill = createResponse.data.existingSkill;
          if (existingSkill) {
            skillId = existingSkill._id;
            console.log('Mevcut skill kullanılıyor:', existingSkill.name);
          } else {
            throw new Error('Skill oluşturulamadı');
          }
        }

        // ADIM 3: SKİLL'İ KULLANICIYA EKLE
        // API: POST /api/skills/add-to-user - Skill'i kullanıcının learn listesine ekle
        const addResponse = await axios.post('http://localhost:3000/api/skills/add-to-user', {
          skillId: skillId,  // Skill'in veritabanındaki ID'si
          type: 'learn'      // "learn" listesine ekle
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (addResponse.data.success) {
          // ADIM 4: UI'I GÜNCELLE
          // Yeni skill'i local state'e ekle (sayfa yenilemeye gerek yok)
          const newSkillObj = { _id: skillId, name: newLearnSkill.trim() };
          setLearnSkills([...learnSkills, newSkillObj]); // Mevcut listeye ekle
          setNewLearnSkill(""); // Input'u temizle
          setSuccess('Skill başarıyla eklendi!'); // Success notification göster
        }
      } catch (error) {
        // HATA YÖNETİMİ - Detaylı hata mesajı
        console.error('Add learn skill error:', error);
        console.error('Error response:', error.response?.data);
        
        // Hangi adımda hata oluştu?
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Bu skill zaten mevcut')) {
          setError('Bu skill zaten listende var!');
        } else {
          setError('Skill eklenemedi: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setActionLoading(false); // Loading'i bitir (başarı/hata fark etmez)
      }
    }
  };

  // ========================================
  // ÖĞRENMEK İSTEDİĞİM SKILL SİLME
  // ========================================
  // API: DELETE /api/skills/remove-from-user
  const handleDeleteLearnSkill = async (skillObj) => {
    setActionLoading(true); // Loading başlat
    try {
      const token = localStorage.getItem('skillswap_token');
      
      // Backend'e silme isteği gönder
      const response = await axios.delete('http://localhost:3000/api/skills/remove-from-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          skillId: skillObj._id, // Skill'in veritabanındaki ID'si
          type: 'learn'          // "learn" listesinden sil
        }
      });

      if (response.data.success) {
        // Backend'den başarı gelirse: Local state'i güncelle (UI'dan skill'i kaldır)
        setLearnSkills(learnSkills.filter((s) => s._id !== skillObj._id));
        setSuccess('Skill başarıyla silindi!'); // Success notification göster
      }
    } catch (error) {
      console.error('Delete learn skill error:', error);
      setError('Skill silinemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false); // Loading'i bitir (başarı/hata fark etmez)
    }
  };

  // ========================================
  // YARDIMCI FONKSİYONLAR
  // ========================================
  
  // ENTER TUŞU İLE SKILL EKLEME
  // Amaç: UX iyileştirmesi - Kullanıcı Enter'a basınca buton tıklamış gibi davranır
  const handleKeyPress = (event, type) => {
    if (event.key === 'Enter') {
      if (type === 'teach') {
        handleAddTeachSkill(); // Teach skill ekleme fonksiyonunu çalıştır
      } else {
        handleAddLearnSkill(); // Learn skill ekleme fonksiyonunu çalıştır
      }
    }
  };

  // ========================================
  // CONDITIONAL RENDERING - LOADING STATE
  // ========================================
  
  // Sayfa ilk yüklenirken spinner göster
  // Bu loading, fetchUserSkills() API çağrısı için
  if (loading) {
    return (
      <Box 
        display="flex"         // Flex container
        justifyContent="center" // Yatayda ortala
        alignItems="center"     // Dikeyde ortala
        minHeight="400px"       // Minimum yükseklik
      >
        <CircularProgress />    {/* Material-UI loading spinner */}
      </Box>
    );
  }

  return (
    <>
      {/* ========================================
          ANA LAYOUT - İKİ SÜTUN DÜZENİ
          ======================================== */}
      <Box sx={{ display: "flex", gap: 4, p: 4 }}> 
        
        {/* ========================================
            SOL SÜTUN - ÖĞRETEBİLECEĞİM SKİLLS
            ======================================== */}
        <Card elevation={3} sx={{ flex: 1, p: 3 }}> 
          {/* Bölüm Başlığı */}
          <Typography variant="h6" gutterBottom>
            Skills I Can Teach
          </Typography>
          
          {/* Yeni Skill Ekleme Formu */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="e.g. Python Programming"      // Placeholder text
              value={newTeachSkill}               // Input değeri state'den gelir
              onChange={(e) => setNewTeachSkill(e.target.value)}  // Her karakter yazıldığında state güncelle
              onKeyPress={(e) => handleKeyPress(e, 'teach')}      // Enter tuşuna basıldığında skill ekle
              fullWidth                           // Input'u tam genişlikte yap
              disabled={actionLoading}            // API işlemi sırasında disable et
            />
            <Button 
              variant="contained"                 // Dolu mavi buton stili
              onClick={handleAddTeachSkill}       // Tıklandığında skill ekleme fonksiyonunu çalıştır
              disabled={actionLoading || !newTeachSkill.trim()}  // Loading sırasında veya input boşsa disable
            >
              {/* Buton içeriği: Loading sırasında spinner, normal zamanda text */}
              {actionLoading ? <CircularProgress size={20} /> : '+ Add'}
            </Button>
          </Box>
          
          {/* Skills Listesi veya Empty State */}
          {teachSkills.length === 0 ? (
            // Hiç skill yoksa gösterilecek mesaj
            <Typography variant="body2" color="text.secondary">
              No teaching skills yet. Add skills you can teach to help others learn.
            </Typography>
          ) : (
            // Skills varsa chip'ler halinde göster
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {teachSkills.map((skill, index) => (
                <Chip
                  key={skill._id || index}        // Unique key (ID varsa ID, yoksa index)
                  label={skill.name || skill}     // Chip üzerinde gösterilecek text
                  onDelete={() => handleDeleteTeachSkill(skill)}  // X butonuna tıklandığında sil
                  color="primary"                 // Mavi renk teması
                  variant="outlined"              // Outlined stil (içi boş, kenarlıklı)
                  disabled={actionLoading}        // API işlemi sırasında disable
                />
              ))}
            </Box>
          )}
        </Card>
        {/* ========================================
            SAĞ SÜTUN - ÖĞRENMEK İSTEDİĞİM SKİLLS
            ======================================== */}
        <Card elevation={3} sx={{ flex: 1, p: 3 }}>
          {/* Bölüm Başlığı */}
          <Typography variant="h6" gutterBottom>
            Skills I Want to Learn
          </Typography>
          
          {/* Yeni Skill Ekleme Formu */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="e.g. Data Science"           // Placeholder text
              value={newLearnSkill}               // Input değeri state'den gelir
              onChange={(e) => setNewLearnSkill(e.target.value)}  // Her karakter yazıldığında state güncelle
              onKeyPress={(e) => handleKeyPress(e, 'learn')}      // Enter tuşuna basıldığında skill ekle
              fullWidth                           // Input'u tam genişlikte yap
              disabled={actionLoading}            // API işlemi sırasında disable et
            />
            <Button 
              variant="contained"                 // Dolu buton stili
              color="success"                     // Yeşil renk teması (learn için)
              onClick={handleAddLearnSkill}       // Tıklandığında skill ekleme fonksiyonunu çalıştır
              disabled={actionLoading || !newLearnSkill.trim()}  // Loading sırasında veya input boşsa disable
            >
              {/* Buton içeriği: Loading sırasında spinner, normal zamanda text */}
              {actionLoading ? <CircularProgress size={20} /> : '+ Add'}
            </Button>
          </Box>
          
          {/* Skills Listesi veya Empty State */}
          {learnSkills.length === 0 ? (
            // Hiç skill yoksa gösterilecek mesaj
            <Typography variant="body2" color="text.secondary">
              No skills to learn yet. Add skills you want to learn to connect with experts.
            </Typography>
          ) : (
            // Skills varsa chip'ler halinde göster
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {learnSkills.map((skill, index) => (
                <Chip
                  key={skill._id || index}        // Unique key (ID varsa ID, yoksa index)
                  label={skill.name || skill}     // Chip üzerinde gösterilecek text
                  onDelete={() => handleDeleteLearnSkill(skill)}  // X butonuna tıklandığında sil
                  color="success"                 // Yeşil renk teması (learn için)
                  variant="outlined"              // Outlined stil (içi boş, kenarlıklı)
                  disabled={actionLoading}        // API işlemi sırasında disable
                />
              ))}
            </Box>
          )}
        </Card>
      </Box>

      {/* ========================================
          NOTIFICATION COMPONENTS (SNACKBAR + ALERT)
          ========================================== */}
      
      {/* Success Notification - Başarılı işlemler için yeşil bildirim */}
      <Snackbar 
        open={!!success}                          // success state'i truthy olduğunda göster (!! ile boolean'a çevir)
        autoHideDuration={3000}                   // 3 saniye sonra otomatik kapan
        onClose={() => setSuccess('')}            // Kapanırken success state'ini temizle
      >
        <Alert 
          severity="success"                      // Yeşil success icon'u
          onClose={() => setSuccess('')}          // X butonuna tıklandığında success state'ini temizle
        >
          {success}                               {/* Success state'inde tutulan mesaj */}
        </Alert>
      </Snackbar>

      {/* Error Notification - Hatalı işlemler için kırmızı bildirim */}
      <Snackbar 
        open={!!error}                            // error state'i truthy olduğunda göster (!! ile boolean'a çevir)
        autoHideDuration={3000}                   // 3 saniye sonra otomatik kapan
        onClose={() => setError('')}              // Kapanırken error state'ini temizle
      >
        <Alert 
          severity="error"                        // Kırmızı error icon'u
          onClose={() => setError('')}            // X butonuna tıklandığında error state'ini temizle
        >
          {error}                                 {/* Error state'inde tutulan mesaj */}
        </Alert>
      </Snackbar>
    </>
  );
}
