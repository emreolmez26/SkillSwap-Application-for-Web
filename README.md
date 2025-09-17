# SkillSwap - Beceri Değişim Platformu 🔄

**SkillSwap**, kullanıcıların sahip oldukları becerileri öğretip, öğrenmek istedikleri becerileri başka kullanıcılardan öğrenebilecekleri sosyal öğrenme platformudur. Karşılıklı bilgi alışverişi ile herkesin hem öğretmen hem öğrenci olabileceği modern bir eğitim uygulamasıdır.

## 🎯 Proje Vizyonu

Bu platform, geleneksel eğitim modellerini tersine çevirerek:
- **Herkesin bir beceriye sahip olduğu** ve öğretebileceği
- **Herkesin yeni şeyler öğrenmek istediği** 
- **Karşılıklı öğrenmenin en etkili yol** olduğu

felsefesiyle tasarlanmıştır.

## 🌟 Temel Özellikler

### 👤 Kullanıcı Yönetimi
- **Güvenli Kayıt & Giriş**: JWT tabanlı authentication sistemi
- **Profil Yönetimi**: Kişisel bilgiler, bio, konum bilgileri
- **Üyelik Geçmişi**: Platforma katılım tarihi ve istatistikler

### 🎯 Beceri Yönetimi
- **Öğretebileceğim Beceriler**: Sahip olduğunuz ve paylaşmak istediğiniz yetenekler
- **Öğrenmek İstediğim Beceriler**: Geliştirmek istediğiniz alan ve konular
- **Dinamik Ekleme/Çıkarma**: Kolayca beceri listelerinizi güncelleyin
- **Kategorilendirme**: Teknoloji, sanat, dil, müzik, spor ve daha fazlası

### 🤝 Eşleşme Sistemi
- **Akıllı Algoritma**: Öğretmek istediğiniz ile başkalarının öğrenmek istedikleri eşleşir
- **Karşılıklı İlgi**: Her iki tarafın da faydalanabileceği eşleşmeler
- **Match Requests**: Diğer kullanıcılara eşleşme talebi gönderin/alın

### 💬 İletişim Sistemi
- **Gerçek Zamanlı Mesajlaşma**: Eşleştiğiniz kullanıcılarla anlık iletişim
- **Güvenli Chat**: Sadece eşleşmiş kullanıcılar arasında mesajlaşma
- **Dosya Paylaşımı**: Öğrenme materyalleri ve kaynakları paylaşın

### 📊 Kişisel Dashboard
- **İstatistikler**: Öğrettiğiniz ve öğrendiğiniz beceri sayıları
- **Aktif Eşleşmeler**: Devam eden öğrenme süreçleri
- **Son Aktiviteler**: Platform üzerindeki son hareketleriniz

## 🛠️ Teknoloji Stack

### 🔧 Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (MongoDB Atlas cloud)
- **Mongoose** - MongoDB object modeling
- **JWT (JsonWebToken)** - Secure authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### 🎨 Frontend Technologies
- **React.js** - User interface library
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling and animations

### 🔗 Integration & Architecture
- **RESTful API** - Backend-frontend communication
- **JWT Authentication** - Secure user sessions
- **Responsive Design** - Mobile-first approach
- **Component-based Architecture** - Modular and reusable code

## 📱 Uygulama Ekran Görüntüleri

### 🏠 Ana Sayfa & Dashboard
- Modern ve kullanıcı dostu arayüz
- Kişisel istatistik kartları
- Hızlı navigasyon menüsü

### 🎯 Beceri Yönetimi
- İki sütunlu beceri organizasyonu
- Kolay ekleme/çıkarma işlemleri
- Gerçek zamanlı güncellemeler

### 👥 Kullanıcı Keşfi
- Filtrelenebilir kullanıcı listesi
- Beceri bazlı arama
- Eşleşme talebi gönderimi

## 🚀 Kurulum ve Çalıştırma

### ⚡ Hızlı Başlangıç

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/emreolmez26/SkillSwap-Application-for-Web.git
cd SkillSwap-Application-for-Web
```

2. **Backend kurulumu:**
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını kendi bilgilerinizle doldurun
npm start
```

3. **Frontend kurulumu:**
```bash
cd ../frontend
npm install
npm run dev
```

### � Detaylı Kurulum

### Backend Kurulumu

1. Backend klasörüne gidin:
```bash
cd backend
```

2. Dependencies'leri yükleyin:
```bash
npm install
```

3. Environment dosyasını oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını kendi bilgilerinizle doldurun:
- MongoDB bağlantı string'inizi ekleyin
- JWT secret key oluşturun
- Port numarasını belirleyin

5. Backend'i başlatın:
```bash
npm start
```

### Frontend Kurulumu

1. Frontend klasörüne gidin:
```bash
cd frontend
```

2. Dependencies'leri yükleyin:
```bash
npm install
```

3. Development server'ı başlatın:
```bash
npm run dev
```

## 🔧 Geliştirme Rehberi

### 📋 Backend API Endpoints

#### 🔐 Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

#### 🎯 Skills Management
- `POST /api/skills` - Yeni beceri oluşturma
- `POST /api/skills/add-to-user` - Kullanıcıya beceri ekleme
- `DELETE /api/skills/remove-from-user` - Kullanıcıdan beceri çıkarma
- `GET /api/skills` - Tüm becerileri listele

#### 👥 User Management
- `GET /api/users` - Kullanıcı listesi (filtrelenebilir)
- `PUT /api/auth/update` - Profil güncelleme

#### 🤝 Matching System
- `POST /api/matches` - Eşleşme talebi gönder
- `GET /api/matches` - Eşleşmeleri listele
- `PUT /api/matches/respond` - Eşleşme talebini yanıtla

#### 💬 Messaging
- `GET /api/messages` - Mesaj geçmişi
- `POST /api/messages` - Yeni mesaj gönder

### 🏗️ Proje Yapısı

```
SkillSwapApp/
├── 📁 backend/
│   ├── 📁 models/              # MongoDB veri modelleri
│   │   ├── user.js            # Kullanıcı şeması
│   │   ├── skill.js           # Beceri şeması
│   │   ├── match.js           # Eşleşme şeması
│   │   └── message.js         # Mesaj şeması
│   ├── 📁 routes/              # API route'ları
│   │   ├── auth.js            # Authentication işlemleri
│   │   ├── skills.js          # Beceri yönetimi
│   │   ├── users.js           # Kullanıcı işlemleri
│   │   ├── matches.js         # Eşleşme sistemi
│   │   └── messages.js        # Mesajlaşma
│   ├── .env.example           # Environment template
│   ├── .gitignore             # Git ignore kuralları
│   ├── package.json           # Backend dependencies
│   └── index.js               # Ana server dosyası
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/     # Yeniden kullanılabilir componentler
│   │   │   ├── Sidebar.jsx    # Navigasyon menüsü
│   │   │   ├── OverviewCard.jsx # Dashboard kartları
│   │   │   └── RecentMatches.jsx # Son eşleşmeler
│   │   ├── 📁 pages/          # Sayfa componentleri
│   │   │   ├── Login.jsx      # Giriş sayfası
│   │   │   ├── Register.jsx   # Kayıt sayfası
│   │   │   ├── Dashboard.jsx  # Ana panel
│   │   │   ├── Skills.jsx     # Beceri yönetimi
│   │   │   ├── Profile.jsx    # Profil sayfası
│   │   │   ├── Matching.jsx   # Eşleşme sayfası
│   │   │   └── Chat.jsx       # Mesajlaşma
│   │   ├── App.jsx            # Ana uygulama
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── .gitignore             # Frontend ignore kuralları
├── README.md                  # Proje dokümantasyonu
└── .gitignore                 # Genel ignore kuralları
```

## 🔐 Güvenlik ve Yapılandırma

### 🛡️ Güvenlik Özellikleri
- **JWT Authentication**: Güvenli oturum yönetimi
- **Password Hashing**: bcrypt ile şifre koruması
- **Environment Variables**: Hassas bilgilerin korunması
- **CORS Configuration**: Cross-origin güvenliği
- **Input Validation**: Girdi doğrulama ve sanitizasyon

### ⚙️ Environment Variables (.env)
```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string
DB_NAME=skillswapp
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
```

### 📝 Önemli Notlar
- ⚠️ `.env` dosyası asla git'e commit edilmemelidir
- 🔑 Production'da güçlü JWT secret kullanın
- 🔒 MongoDB Atlas'ta IP whitelist'i ayarlayın
- 🚀 Production deployment için environment-specific konfigürasyonlar yapın

## 🤝 Katkıda Bulunma

Bu proje açık kaynak topluluğu için geliştirilmiştir. Katkılarınızı bekliyoruz!

### 🔄 Katkı Süreci
1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/YeniOzellik`)
3. **Commit** yapın (`git commit -m 'Yeni özellik: Kullanıcı filtreleme'`)
4. **Branch'i push** edin (`git push origin feature/YeniOzellik`)
5. **Pull Request** açın

### 🐛 Bug Raporlama
- Issues sekmesinden bug raporu açın
- Adım adım tekrar etme talimatları ekleyin
- Ekran görüntüleri paylaşın
- Browser ve işletim sistemi bilgilerini belirtin

### 💡 Özellik Önerileri
- Yeni özellik önerilerinizi Issues'da paylaşın
- Kullanım senaryolarını açıklayın
- Mockup'lar varsa ekleyin

## 🏆 Gelecek Planları

### 🚀 Version 2.0 Özellikleri
- [ ] **Video Chat Integration** - Sesli/görüntülü ders imkanı
- [ ] **Skill Verification** - Beceri doğrulama sistemi
- [ ] **Rating & Review** - Öğretmen/öğrenci değerlendirme
- [ ] **Learning Paths** - Organize öğrenme rotaları
- [ ] **Achievement System** - Başarı rozetleri ve gamification
- [ ] **Mobile App** - React Native ile mobil uygulama
- [ ] **AI Recommendations** - Yapay zeka destekli öneriler
- [ ] **Group Learning** - Grup eğitimleri ve workshoplar

### 🌍 Teknik İyileştirmeler
- [ ] **Socket.io Integration** - Gerçek zamanlı bildirimler
- [ ] **Redis Caching** - Performans optimizasyonu
- [ ] **Elasticsearch** - Gelişmiş arama özelliği
- [ ] **Microservices** - Modüler mimari geçişi
- [ ] **Docker Support** - Containerization
- [ ] **CI/CD Pipeline** - Otomatik deployment
- [ ] **Testing Suite** - Unit ve integration testleri

## 📊 Proje İstatistikleri

### 📈 Geliştirme Metrikleri
- **Toplam Kod Satırı**: ~5,000+ satır
- **React Componentleri**: 15+ component
- **API Endpoints**: 12+ endpoint
- **Database Collections**: 4 koleksiyon
- **Desteklenen Özellik**: 25+ özellik

### 🎯 Hedef Kullanıcılar
- **Öğrenciler** - Yeni beceriler öğrenmek isteyenler
- **Profesyoneller** - Bilgisini paylaşmak isteyenler
- **Hobiciler** - İlgi alanlarını geliştirmek isteyenler
- **Eğitmenler** - Ek gelir elde etmek isteyenler

## 📞 İletişim ve Destek

### 👨‍💻 Geliştirici İletişim
- **GitHub**: [@emreolmez26](https://github.com/emreolmez26)
- **Email**: emreolmez26@example.com
- **LinkedIn**: [Emre Ölmez](https://linkedin.com/in/emreolmez)

### 🆘 Teknik Destek
- **Issues**: GitHub Issues kullanın
- **Documentation**: README.md ve kod yorumları
- **Community**: Discussions sekmesini kullanın

### 🌟 Sosyal Medya
- Projeyi beğendiyseniz ⭐ verin
- Arkadaşlarınızla paylaşın
- Fork'layıp kendi versiyonunuzu oluşturun

## � Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.

### � Lisans Özeti
- ✅ **Ticari kullanım** serbesttir
- ✅ **Modifikasyon** yapabilirsiniz
- ✅ **Dağıtım** yapabilirsiniz
- ✅ **Özel kullanım** serbesttir
- ⚠️ **Sorumluluk** reddi geçerlidir
- ⚠️ **Garanti** verilmemektedir

---

<div align="center">

### 🚀 **SkillSwap ile Öğrenmenin Yeni Yolu!** 🚀

*"Herkes bir şey öğretebilir, herkes bir şey öğrenebilir."*

**Made with ❤️ by [Emre Ölmez](https://github.com/emreolmez26)**

</div>