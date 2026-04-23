# Firebase Kurulum Rehberi (ingilizceokulu-e2771)

Bu proje artik `ingilizceokulu-e2771` Firebase projesine baglanacak sekilde hazirlandi.

## 1) Firebase Console ayarlari

1. Firebase Console'da `ingilizceokulu-e2771` projesini ac.
2. **Authentication**:
   - Sign-in method: `Email/Password` aktif et.
   - Sign-in method: `Google` aktif et.
   - Authorized domains: kullandigin hostu ekle.
     - Gecici: `nrhtdmn.github.io`
     - Sonra domain alinca: `www.ingilizceokulu.com`
3. **Firestore Database**:
   - Database olustur (Production veya test modunda baslayabilirsin).
4. **Project settings > General > Your apps**:
   - Web app olustur.
   - Verilen config degerlerini kopyala.

## 2) Projedeki Firebase config'i doldur

`js/utils/api.js` dosyasinda su alanlari doldur:

- `apiKey`
- `messagingSenderId`
- `appId`

Su alanlar proje adina gore zaten `ingilizceokulu-e2771` olarak ayarlandi:

- `authDomain`
- `projectId`
- `storageBucket`

Istersen config'i global olarak da verebilirsin:

```html
<script>
  window.FIREBASE_CONFIG = {
    apiKey: "...",
    authDomain: "ingilizceokulu-e2771.firebaseapp.com",
    projectId: "ingilizceokulu-e2771",
    storageBucket: "ingilizceokulu-e2771.firebasestorage.app",
    messagingSenderId: "...",
    appId: "..."
  };
</script>
```

Bu script `js/utils/api.js` yuklenmeden once calismalidir.

## 3) Firestore rules deploy

Bu projede `firestore.rules` dosyasi kullaniliyor.

Terminal:

```bash
firebase login
firebase use ingilizceokulu-e2771
firebase deploy --only firestore:rules
```

## 4) Functions (duyuru e-postalari) deploy

Terminal:

```bash
firebase use ingilizceokulu-e2771
firebase functions:config:set smtp.user="gonderici@gmail.com" smtp.pass="APP_PASSWORD" smtp.from="Ingilizce Okulu <gonderici@gmail.com>"
firebase deploy --only functions
```

## 5) Hosting deploy

Bu repo `firebase.json` ile hazir:

```bash
firebase use ingilizceokulu-e2771
firebase deploy --only hosting
### GitHub Pages kullaniyorsan

Eger uygulamayi `https://nrhtdmn.github.io/ingilizce-okulu/` uzerinden yayinlayacaksan:

- Firebase Hosting deploy zorunlu degil.
- Yalnizca Firestore rules (ve gerekiyorsa functions) deploy etmen yeterli.
- En kritik nokta: Firebase Auth > Settings > Authorized domains icine `nrhtdmn.github.io` eklemek.

```

## 6) Domain baglama (opsiyonel)

- `CNAME` dosyasi: `www.ingilizceokulu.com`
- Firebase Hosting > Custom domain:
  - `www.ingilizceokulu.com` ekle
  - Verilen DNS kayitlarini domain saglayicinda tanimla

## 7) Ilk test checklist

1. Kayit ol (Email/Password)
2. Google ile giris dene
3. Firestore'da `global/users` ve `global/userdata` belgeleri olusuyor mu kontrol et
4. Duyuru gonderip Functions loglarini kontrol et

