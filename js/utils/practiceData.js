// --- VARSAYILAN ALIŞTIRMALAR ---
const DEFAULT_PRACTICES = [
  {
    id: "prac-1",
    title: "Kostas's Breakfast",
    level: "A1",
    category: "☕ Daily Life",
    text: "Kostas wakes up at seven every morning. He goes to the kitchen and makes coffee. He does not like tea. He usually eats bread with honey and an apple. Today he has no honey, so he only eats one egg. After breakfast, he reads the newspaper and leaves for work.",
    questions: [
      { id: "q1", type: "tf", question: "Kostas wakes up at eight.", answer: "false" },
      { id: "q2", type: "tf", question: "Kostas likes coffee very much.", answer: "true" },
      { id: "q3", type: "mc", question: "What does Kostas usually eat?", options: ["Bread with cheese", "Bread with honey", "Only fruit"], answer: "1" },
      { id: "q4", type: "fill-write", before: "Kostas goes to the ", after: " and makes coffee.", answer: "kitchen" },
      { id: "q5", type: "fill-select", before: "Today Kostas eats one ", after: " because he has no honey.", options: ["apple", "egg", "bread"], answer: "egg" }
    ]
  }
];

// YENİ: Veriyi LocalStorage'dan al, yoksa varsayılanı kullan ve 'let' yap ki güncelleyebilelim.
let PRACTICE_CATALOG = JSON.parse(localStorage.getItem('y_practices_db')) || DEFAULT_PRACTICES;