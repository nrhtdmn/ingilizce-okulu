// --- KÜRESEL (GLOBAL) DEĞİŞKENLER ---
let dbUsers;
try { dbUsers = JSON.parse(localStorage.getItem('y_users_db')) || {}; } catch(e) { dbUsers = {}; localStorage.removeItem('y_users_db'); }
dbUsers['nurhat'] = { password: 'Deniz28', role: 'admin', status: 'approved', isPremium: true, credits: 999999 };
window.dbUsers = dbUsers; // window.dbUsers ile let dbUsers her zaman aynı objeyi gösterir

let dbUserData;
try { dbUserData = JSON.parse(localStorage.getItem('y_userdata_db')) || {}; } catch(e) { dbUserData = {}; localStorage.removeItem('y_userdata_db'); }
window.dbUserData = dbUserData; // window.dbUserData ile let dbUserData her zaman aynı objeyi gösterir

let dbAnnouncements;
try { dbAnnouncements = JSON.parse(localStorage.getItem('y_announcements_db')) || []; } catch(e) { dbAnnouncements = []; localStorage.removeItem('y_announcements_db'); }

// YENİ EKLENEN SATIR: Referansın kaybolmaması için window objesine bağladık
window.dbAnnouncements = dbAnnouncements;


let useFirebase = false;
let db = null;
let currentUser = null;
let currentUsername = localStorage.getItem('y_currentUser') || null;

let userDecks = { "Genel Kelimeler": [] };
let userCustomDict = new Map();
let lastActiveDeck = "Genel Kelimeler";
let isLoginMode = true;

// TTS / Medya Oynatıcı Değişkenleri
let ttsSupported = false, ttsVoice = null, isPaused = false, globalTextForTTS = "", allWordSpans = []; 
let currentSpeakingToken = null, isSpeakingManually = false, currentManualIndex = 0, manualTimer = null;
let ytPlayer = null, ytSubtitles = [], videoSyncInterval = null, currentActiveSubIndex = -1, hlsInstance = null;

// Sözlük ve Test Değişkenleri
let activeWordString = "", activeContextSentence = "", activeTokenElement = null;
let currentQuizPool = [], currentQuizIndex = 0, currentQuizQuestion = null, quizMistakes = [], correctCount = 0, totalInitialWords = 0, isQuestionActive = false;
let currentDictMode = 'en-tr';

// Sınav (e-YDS) Değişkenleri
let GLOBAL_SORU_BANKASI = [], examSession = [], currentQIndex = 0, examState = {}, examTimerInterval = null, examToolMode = 'dict', clockInterval = null, examStartTime = null;

// --- KATALOGLAR VE VERİLER ---
// Okuma paneli: yalnizca ornek-metinler/ icindeki dosyalar (okuma_metni_*.txt)
const LEVELS = ["Read At Work - 1"];
let currentTextCategory = "Tümü";
let currentVideoCategory = "Tümü";

const ORNEK_METIN_NUMARALARI = [
  3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
];

const METIN_KATALOGU = ORNEK_METIN_NUMARALARI.map((n) => ({
  id: `okuma_metni_${n}`,
  title: `Okuma Metni (${n})`,
  level: "Read At Work - 1",
  category: "",
}));


const VIDEO_KATALOGU = [
  { id: "0HbdNP29F-o", title: " İşte kolay hamurla mükemmel morina balığı nasıl yapılır – Patatesli veya ekmekli kolay Skordalia", level: "A2 - B1", category: "🎬 Yemek Tarifleri" },
  { id: "FY-oS0pGm1s", title: "Dil - Tekrar: Yazma ve Okuma - 1. Sınıf Seviye 16", level: "A1", category: "📚 Yunanca" },
  { id: "Ydbk96cqtvQ", title: "Matematik - 50'ye Kadar Sayılar, Onlar ve Birler Basamağı, Toplama - 1. Sınıf Seviye 22", level: "A1", category: "📚 Yunanca" }
];

const HUGE_RAW_DICTIONARY = [
  ["ανθρώπων", "insanların"], ["αβαείο", "manastır"], ["αβαείου", "manastırın"], ["αβαία", "manastırlar"],
  ["αβαίων", "manastırların"], ["άβαχας", "abaküs"], ["άβαχα", "abaküsü"], ["άβαχες", "abaküsler"],
  ["άβαχών", "abaküslerin"], ['φιλος', 'arkadaş'], ['φιλο', 'arkadaşı'], ['φιλου', 'arkadaşın'],
  ['φιλε', 'arkadaş!'], ['φιλοι', 'arkadaşlar'], ['φιλους', 'arkadaşları'], ['φιλων', 'arkadaşların']
];
const MASTER_DICT_MAP = new Map(HUGE_RAW_DICTIONARY);

const GREEK_TV_CHANNELS = [
  { name: "Alpha TV", url: "https://alphatvlive2.siliconweb.com/alphatvlive/live_abr/playlist.m3u8" },
  { name: "SKAİ TV", url: "https://skai-live.siliconweb.com/media/cambria4/index.m3u8" },
  { name: "Action24", url: "https://actionlive.siliconweb.com/actionabr/actiontv/actionlive/actiontv_720p/chunks.m3u8" },
  { name: "BOYAH TV", url: "https://diavlos-cache.cnt.grnet.gr/parltv/webtv-1b.sdp/chunklist.m3u8" },
  { name: "Blue Sky TV", url: "https://cdn5.smart-tv-data.com/bluesky/bluesky-live/playlist.m3u8" },
  { name: "Star Int TV", url: "https://livestar.siliconweb.com/starvod/star_int/star_int.m3u8" },
  { name: "TV 100", url: "https://gwebstream.net/hls/stream_0.m3u8" },
  { name: "KRHTH TV", url: "https://cretetvlive.siliconweb.com/cretetv/liveabr/cretetv/live_source/chunks.m3u8" },
  { name: "One TV", url: "https://onechannel.siliconweb.com/one/live_abr/one/stream_720p/chunks_dvr.m3u8" },
  { name: "Epirus 1 TV", url: "https://rtmp.win:3929/live/epiruslive.m3u8" },
  { name: "Creta TV", url: "https://live.streams.ovh/tvcreta/tvcreta/chunklist_w894751242.m3u8" },
  { name: "TRT TV", url: "https://av.hellasnet.tv/rst/trt/index.m3u8" }
];

const GREEK_NEWSPAPERS = [
  { name: "Kathimerini (Καθημερινή)", desc: "Saygın günlük gazete", url: "https://www.kathimerini.gr/" },
  { name: "To Vima (Το Βήμα)", desc: "Köklü haber ve analiz", url: "https://www.tovima.gr/" },
  { name: "Ta Nea (Τα Νέα)", desc: "Popüler günlük gazete", url: "https://www.tanea.gr/" },
  { name: "Proto Thema (Πρώτο Θέμα)", desc: "Güncel ve son dakika", url: "https://www.protothema.gr/" },
  { name: "EfSyn (Εφ.Συν.)", desc: "Bağımsız gazetecilik", url: "https://www.efsyn.gr/" },
  { name: "Naftemporiki (Ναυτεμπορική)", desc: "Ekonomi ve finans", url: "https://www.naftemporiki.gr/" }
];

const GREEK_RADIO_CHANNELS = [
  { name: "Sfera 102.2", url: "https://sfera.live24.gr/sfera4132" },
  { name: "Dalkas 88.2", url: "https://n0e.radiojar.com/pr9r38w802hvv?rj-ttl=5&rj-tok=AAABnS7ljXoATDqvhxMvAiA75A" },
  { name: "Derti 98.6", url: "https://n02.radiojar.com/pr9r38w802hvv?rj-ttl=5&rj-tok=AAABnS7leDYAvFErD84b3zkuqg" }
];



let activePracticeSession = null; // Aktif alıştırma oturumunu tutar


// --- ORTAK FONKSİYONLAR ---
function showToastMessage(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg; toast.style.display = "block";
  setTimeout(() => toast.style.display="none", 3000);
}

function getGreekPhonetics(word) {
  const rules = [
    ['αι', 'e'], ['ει', 'i'], ['οι', 'i'], ['υι', 'i'], ['αυ', 'av/af'], ['ευ', 'ev/ef'],
    ['μπ', 'b'], ['ντ', 'd'], ['γκ', 'g'], ['γγ', 'ng'], ['τσ', 'ts'], ['τζ', 'dz'], ['ου', 'u'], ['γχ', 'nH'],
    ['α', 'a'], ['β', 'v'], ['γ', 'ğ/y'], ['δ', 'ð'], ['ε', 'e'], ['ζ', 'z'], ['η', 'i'], ['θ', 'th'], ['ι', 'i'], ['κ', 'k'],
    ['λ', 'l'], ['μ', 'm'], ['ν', 'n'], ['ξ', 'ks'], ['ο', 'o'], ['π', 'p'], ['ρ', 'r'], ['σ', 's'], ['ς', 's'], ['τ', 't'],
    ['υ', 'i'], ['φ', 'f'], ['χ', 'h/χ'], ['ψ', 'ps'], ['ω', 'o'],
    ['Α', 'a'], ['Β', 'v'], ['Γ', 'ğ/y'], ['Δ', 'ð'], ['Ε', 'e'], ['Ζ', 'z'], ['Η', 'i'], ['Θ', 'th'], ['Ι', 'i'], ['Κ', 'k'],
    ['Λ', 'l'], ['Μ', 'm'], ['Ν', 'n'], ['Ξ', 'ks'], ['Ο', 'o'], ['Π', 'p'], ['Ρ', 'r'], ['Σ', 's'], ['Τ', 't'], ['Υ', 'i'],
    ['Φ', 'f'], ['Χ', 'h/χ'], ['Ψ', 'ps'], ['Ω', 'o'],
  ];
  let cleanWord = word.replace(/[.,!?;():"""]/g, '');
  let result = ''; let i = 0; const lower = cleanWord.toLowerCase();
  while (i < lower.length) {
    let matched = false;
    for (const [gr, tr] of rules) {
      if (gr.length === 2 && lower.substring(i, i + 2) === gr) { result += tr; i += 2; matched = true; break; }
    }
    if (!matched) {
      for (const [gr, tr] of rules) {
        if (gr.length === 1 && lower[i] === gr) { result += tr; i++; matched = true; break; }
      }
    }
    if (!matched) { result += lower[i]; i++; }
  }
  return result;
}

function formatExamTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startRealClock() {
  clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('e-clock');
    if(clockEl) clockEl.textContent = now.toLocaleTimeString('tr-TR');
  }, 1000);
}

function tokenizeForExamInteractive(text) {
  let html = '';
  let safeSentence = text.replace(/'/g, "\\'").replace(/"/g, '\\"'); 
  text.split(/(\s+)/).forEach(token => {
    if (/[A-Za-z]/.test(token)) {
      let safeWord = token.replace(/'/g, "\\'").replace(/"/g, '\\"');
      html += `<span class="tok" onclick="examTokenClicked(event, '${safeWord}', '${safeSentence}')">${token}</span>`;
    } else {
      html += token;
    }
  });
  return html;
}

function tokenizePracHTML(text) {
  if (!text) return "";
  // [1], [2] gibi yapıları Kloze test için görsel dairelere çevir
  let processedText = text.replace(/\[(\d+)\]/g, '<span style="display:inline-flex; align-items:center; justify-content:center; background-color:var(--accent); color:white; width:22px; height:22px; border-radius:50%; font-size:0.85rem; font-weight:bold; margin:0 4px; vertical-align:middle; box-shadow:0 2px 4px rgba(0,0,0,0.3); pointer-events:none;">$1</span>');
  
  let html = '';
  let safeSentence = processedText.replace(/'/g, "\\'").replace(/"/g, '\\"'); 
  
  const parts = processedText.split(/(<[^>]*>|\s+)/);
  
  parts.forEach(token => {
    if (!token) return;
    if (token.startsWith('<')) {
      html += token;
    } else if (/[A-Za-z]/.test(token)) {
      let safeWord = token.replace(/'/g, "\\'").replace(/"/g, '\\"');
      html += `<span class="tok" onclick="event.stopPropagation(); triggerWordPopup(event, '${safeWord}', '${safeSentence}')">${token}</span>`;
    } else {
      html += token;
    }
  });
  return html;
}


