// Bu dosya en son çalışacak ve uygulamayı init (boot) edecektir.
// GitHub Pages'te eski SW cache'i bazen güncel JS'i gölgeleyebiliyor; ilk açılışta temizle.
;(function cleanupLegacyServiceWorkerCaches() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator) || typeof caches === "undefined") return;
  const cleanupKey = "y_sw_cleanup_v20260423";
  if (localStorage.getItem(cleanupKey) === "1") return;
  navigator.serviceWorker.getRegistrations()
    .then(function (regs) {
      return Promise.all((regs || []).map(function (r) {
        try { return r.unregister(); } catch (e) { return Promise.resolve(false); }
      }));
    })
    .then(function () {
      return caches.keys().then(function (keys) {
        return Promise.all((keys || []).map(function (k) {
          try { return caches.delete(k); } catch (e) { return Promise.resolve(false); }
        }));
      });
    })
    .finally(function () {
      localStorage.setItem(cleanupKey, "1");
    });
})();

// kurs.js vb. yüklendikten sonra sekme (URL / localStorage) — Kurs’ta F5 ile aynı yerde kalmak için
if (typeof window.initMainTabFromUrlOrStorage === "function") {
  try {
    window.initMainTabFromUrlOrStorage();
  } catch (e) {
    console.error("initMainTabFromUrlOrStorage", e);
  }
}
fetchFromFirebase();

/* ==================================================
   ENGLISH MODE SANITIZER
================================================== */
(function forceEnglishModeUi() {
    const TERM_REPLACEMENTS = [
        [/Greek Reading School/gi, "English Reading School"],
        [/Yunanca/gi, "İngilizce"],
        [/Yunanistan/gi, "English-speaking countries"],
        [/Yunan/gi, "English"],
        [/YDS \/ YÖKDİL/gi, "English Exam"],
        [/e-YDS/gi, "e-Exam"],
    ];

    function sanitizeTextValue(text) {
        if (!text || typeof text !== "string") return text;
        let out = text;
        TERM_REPLACEMENTS.forEach(([pattern, replacement]) => {
            out = out.replace(pattern, replacement);
        });
        if (/[\u0370-\u03FF]/.test(out)) {
            out = out.replace(/[\u0370-\u03FF]+/g, "English");
        }
        return out;
    }

    function sanitizeNode(root) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const toUpdate = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const updated = sanitizeTextValue(node.nodeValue);
            if (updated !== node.nodeValue) toUpdate.push([node, updated]);
        }
        toUpdate.forEach(([node, updated]) => {
            node.nodeValue = updated;
        });
        root.querySelectorAll?.("input[placeholder], textarea[placeholder], [title]").forEach((el) => {
            if (el.placeholder) el.placeholder = sanitizeTextValue(el.placeholder);
            if (el.title) el.title = sanitizeTextValue(el.title);
        });
        document.title = sanitizeTextValue(document.title);
    }

    document.addEventListener("DOMContentLoaded", function () {
        sanitizeNode(document.body);
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) sanitizeNode(node);
                    if (node.nodeType === 3 && node.nodeValue) {
                        node.nodeValue = sanitizeTextValue(node.nodeValue);
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();

/* ==================================================
   PWA (UYGULAMA YÜKLEME) BUTONU MANTIĞI
================================================== */
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');

// Tarayıcı "Bu site yüklenebilir bir PWA'dır" sinyalini verdiğinde çalışır
window.addEventListener('beforeinstallprompt', (e) => {
    // preventDefault: tarayıcının mini kurulum afişini kapatır; kurulum penceresi
    // "Uygulamayı Yükle" ile prompt() açılır. Chrome bazen "Banner not shown... must call prompt()"
    // yazar — beklenen bilgi; hata değil (prompt() buton tıklanınca çağrılır).
    e.preventDefault();

    // Olayı (sinyali) daha sonra butonla tetiklemek üzere değişkene kaydet
    deferredPrompt = e;
    
    // Uygulama yüklenebilir durumda, kendi şık butonumuzu görünür yap!
    if (installBtn) {
        installBtn.style.display = 'flex'; 
    }
});

// Kullanıcı bizim butonumuza tıkladığında
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Kaydettiğimiz yükleme penceresini (sistemin orijinal ekranını) çağır
            deferredPrompt.prompt();
            
            // Kullanıcının cevabını bekle (Yükle dedi mi, İptal mi etti?)
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Kullanıcı PWA yükleme istemine şu yanıtı verdi: ${outcome}`);
            
            // İstem bir kez kullanıldıktan sonra güvenlik gereği sıfırlanmalıdır
            deferredPrompt = null;
            
            // Butonu tekrar gizle
            installBtn.style.display = 'none';
        }
    });
}

// Uygulama zaten yüklendiyse (başarıyla kurulduktan sonra) çalışır
window.addEventListener('appinstalled', () => {
    console.log('PWA başarıyla cihaza yüklendi!');
    // İşlem bittiği için butonu sonsuza dek gizle
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    deferredPrompt = null;
});

/* ==================================================
   İÇERİK KORUMA (SAĞ TIK / KOPYALAMA ENGELİ)
================================================== */
(function preventContentCopying() {
    const isEditableTarget = (target) => {
        if (!target || !target.closest) return false;
        return !!target.closest("input, textarea, [contenteditable='true']");
    };

    document.addEventListener("contextmenu", function (e) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    });

    document.addEventListener("copy", function (e) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    });

    document.addEventListener("cut", function (e) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    });

    document.addEventListener("keydown", function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        if (isEditableTarget(e.target)) return;
        const key = String(e.key || "").toLowerCase();
        if (["c", "x"].includes(key)) {
            e.preventDefault();
        }
    });
})();

