// Typing prompts organized by difficulty and type

export const homeRowPrompts = [
  "asdf jkl; asdf jkl;",
  "asd jkl asd jkl asd",
  "fall sad flask",
  "ask dad salad",
  "lads fall fast",
  "half dash flask",
  "ask a lad",
  "dad had a salad",
  "a sad lad falls fast",
  "ask dad for a flask",
];

export const beginnerPrompts = [
  "the cat sat on a mat",
  "a dog ran in the park",
  "she likes to read books",
  "the sun is very bright",
  "i can run very fast",
  "we play games together",
  "my friend is very kind",
  "birds fly in the sky",
  "the fish swims in water",
  "i love my family",
];

export const intermediatePrompts = [
  "typing is a useful skill to learn",
  "practice makes perfect every day",
  "computers help us do many things",
  "the quick brown fox jumps over the lazy dog",
  "learning to type fast is really fun",
  "i enjoy playing video games with friends",
  "reading books helps you learn new words",
  "the weather is nice and sunny today",
  "my favorite color is blue and green",
  "we went to the beach last summer",
];

export const advancedPrompts = [
  "the quick brown fox jumps over the lazy dog near the riverbank",
  "programming requires patience and careful attention to detail",
  "technology continues to change how we communicate with each other",
  "science and mathematics are fundamental subjects for students",
  "creative writing helps express thoughts and feelings clearly",
  "exercising regularly keeps your body healthy and strong",
  "music and art bring joy and inspiration to many people",
  "exploring nature teaches us about the world around us",
  "teamwork and collaboration lead to amazing achievements",
  "curiosity drives innovation and new discoveries every day",
];

export const punctuationPrompts = [
  "hello! how are you today?",
  "wow, that is amazing!",
  "can you help me, please?",
  "yes, i can do it!",
  "where is the library?",
  "look out! it is coming fast!",
  "she said, 'hello there!'",
  "wait... i need to think.",
  "ready? set! go!",
  "great job, keep it up!",
];

export const numberPrompts = [
  "i have 5 apples",
  "there are 12 months",
  "she is 11 years old",
  "the year is 2024",
  "add 3 plus 7 equals 10",
  "my address is 42 main street",
  "the score is 100 points",
  "chapter 8 starts on page 95",
  "i need 20 more minutes",
  "the train leaves at 3:45",
];

// Single letter targets for Alien Defense game
export const homeRowLetters = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];
export const topRowLetters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
export const bottomRowLetters = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

// Short words for Alien Defense game
export const easyWords = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
];

export const mediumWords = [
  "about", "after", "again", "being", "could", "every", "first", "found",
  "great", "house", "large", "little", "never", "other", "place", "right",
  "small", "still", "their", "there", "these", "thing", "think", "three",
  "water", "where", "which", "world", "would", "write", "years", "young",
];

export function getRandomPrompt(category: "home_row" | "beginner" | "intermediate" | "advanced" | "punctuation" | "numbers"): string {
  let prompts: string[];
  
  switch (category) {
    case "home_row":
      prompts = homeRowPrompts;
      break;
    case "beginner":
      prompts = beginnerPrompts;
      break;
    case "intermediate":
      prompts = intermediatePrompts;
      break;
    case "advanced":
      prompts = advancedPrompts;
      break;
    case "punctuation":
      prompts = punctuationPrompts;
      break;
    case "numbers":
      prompts = numberPrompts;
      break;
    default:
      prompts = beginnerPrompts;
  }
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getRandomWord(difficulty: "easy" | "medium"): string {
  const words = difficulty === "easy" ? easyWords : mediumWords;
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomLetter(row: "home" | "top" | "bottom" | "all"): string {
  let letters: string[];
  
  switch (row) {
    case "home":
      letters = homeRowLetters;
      break;
    case "top":
      letters = topRowLetters;
      break;
    case "bottom":
      letters = bottomRowLetters;
      break;
    case "all":
      letters = [...homeRowLetters, ...topRowLetters, ...bottomRowLetters];
      break;
    default:
      letters = homeRowLetters;
  }
  
  return letters[Math.floor(Math.random() * letters.length)];
}
