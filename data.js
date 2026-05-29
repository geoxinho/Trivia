const FALLBACK_QUESTIONS = {
  history: [
    { q: "Who was the first President of the United States?", opts: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], ans: 2, emoji: "🇺🇸", cat: "history", diff: "easy" },
    { q: "In what year did World War II end?", opts: ["1941", "1945", "1950", "1939"], ans: 1, emoji: "🕊️", cat: "history", diff: "medium" },
    { q: "The ancient city of Rome was built on how many hills?", opts: ["Five", "Seven", "Nine", "Three"], ans: 1, emoji: "🏛️", cat: "history", diff: "medium" },
    { q: "Who was the first Emperor of China?", opts: ["Sun Yat-sen", "Qin Shi Huang", "Wu Zetian", "Kangxi"], ans: 1, emoji: "🏯", cat: "history", diff: "hard" },
    { q: "Which empire was conquered by Hernán Cortés?", opts: ["Inca", "Aztec", "Maya", "Olmec"], ans: 1, emoji: "⚔️", cat: "history", diff: "medium" },
    { q: "Who was the British Prime Minister during most of World War II?", opts: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Tony Blair"], ans: 1, emoji: "🇬🇧", cat: "history", diff: "easy" },
    { q: "The French Revolution began in which year?", opts: ["1789", "1804", "1776", "1812"], ans: 0, emoji: "🇫🇷", cat: "history", diff: "hard" },
    { q: "What was the name of the ship that brought the Pilgrims to America?", opts: ["Santa Maria", "Mayflower", "Nina", "Victoria"], ans: 1, emoji: "⛵", cat: "history", diff: "easy" },
    { q: "Who wrote the 'Communist Manifesto' alongside Karl Marx?", opts: ["Vladimir Lenin", "Friedrich Engels", "Joseph Stalin", "Leon Trotsky"], ans: 1, emoji: "📖", cat: "history", diff: "hard" },
    { q: "Which civilization built the Machu Picchu?", opts: ["Aztec", "Olmec", "Inca", "Maya"], ans: 2, emoji: "⛰️", cat: "history", diff: "medium" },
    { q: "The Cold War was primarily a geopolitical tension between which two nations?", opts: ["USA and China", "USA and USSR", "UK and Germany", "USSR and China"], ans: 1, emoji: "❄️", cat: "history", diff: "easy" },
    { q: "Who was the first female Prime Minister of the UK?", opts: ["Theresa May", "Margaret Thatcher", "Angela Merkel", "Queen Elizabeth II"], ans: 1, emoji: "👩‍💼", cat: "history", diff: "medium" },
    { q: "Which pharaoh's tomb was discovered practically intact by Howard Carter in 1922?", opts: ["Ramses II", "Cleopatra", "Tutankhamun", "Akhenaten"], ans: 2, emoji: "🏺", cat: "history", diff: "medium" },
    { q: "In what year did the Titanic sink?", opts: ["1905", "1912", "1915", "1920"], ans: 1, emoji: "🚢", cat: "history", diff: "easy" },
    { q: "Who was the first human to journey into outer space?", opts: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], ans: 2, emoji: "🚀", cat: "history", diff: "medium" },
    { q: "Which wall was torn down in 1989, symbolizing the end of the Cold War?", opts: ["Great Wall of China", "Berlin Wall", "Hadrian's Wall", "Western Wall"], ans: 1, emoji: "🧱", cat: "history", diff: "easy" },
    { q: "Who was the longest-reigning British monarch before Queen Elizabeth II?", opts: ["Queen Victoria", "King George III", "King Henry VIII", "Queen Mary I"], ans: 0, emoji: "👑", cat: "history", diff: "hard" },
    { q: "The Magna Carta was signed by which English King?", opts: ["King Arthur", "King Richard I", "King John", "King Henry II"], ans: 2, emoji: "📜", cat: "history", diff: "medium" },
    { q: "What conflict is known as the 'Great War'?", opts: ["World War I", "World War II", "The Cold War", "The Vietnam War"], ans: 0, emoji: "🎖️", cat: "history", diff: "easy" },
    { q: "Who was the founder of the Mongol Empire?", opts: ["Kublai Khan", "Genghis Khan", "Attila the Hun", "Timur"], ans: 1, emoji: "🐎", cat: "history", diff: "medium" }
  ],
  science: [
    { q: "What is the chemical symbol for Gold?", opts: ["Ag", "Go", "Au", "Gd"], ans: 2, emoji: "🏅", cat: "science", diff: "easy" },
    { q: "What planet is known as the Red Planet?", opts: ["Venus", "Jupiter", "Saturn", "Mars"], ans: 3, emoji: "🪐", cat: "science", diff: "easy" },
    { q: "What is the hardest natural substance on Earth?", opts: ["Gold", "Iron", "Diamond", "Platinum"], ans: 2, emoji: "💎", cat: "science", diff: "easy" },
    { q: "Who developed the theory of relativity?", opts: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"], ans: 1, emoji: "🧠", cat: "science", diff: "easy" },
    { q: "What gas do plants absorb from the atmosphere?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: 2, emoji: "🌿", cat: "science", diff: "medium" },
    { q: "What is the powerhouse of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"], ans: 2, emoji: "🔬", cat: "science", diff: "medium" },
    { q: "Which element has the atomic number 1?", opts: ["Helium", "Oxygen", "Carbon", "Hydrogen"], ans: 3, emoji: "⚛️", cat: "science", diff: "medium" },
    { q: "What is the most abundant gas in the Earth's atmosphere?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], ans: 2, emoji: "☁️", cat: "science", diff: "hard" },
    { q: "Who proposed the theory of evolution by natural selection?", opts: ["Gregor Mendel", "Charles Darwin", "Louis Pasteur", "Alexander Fleming"], ans: 1, emoji: "🦍", cat: "science", diff: "medium" },
    { q: "What is the speed of light in a vacuum?", opts: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], ans: 0, emoji: "⚡", cat: "science", diff: "hard" },
    { q: "Which subatomic particle has a negative charge?", opts: ["Proton", "Neutron", "Electron", "Positron"], ans: 2, emoji: "➖", cat: "science", diff: "easy" },
    { q: "What is the process by which liquid water turns into vapor?", opts: ["Condensation", "Sublimation", "Evaporation", "Precipitation"], ans: 2, emoji: "💧", cat: "science", diff: "easy" },
    { q: "Which organ in the human body produces insulin?", opts: ["Liver", "Pancreas", "Kidney", "Stomach"], ans: 1, emoji: "🩸", cat: "science", diff: "medium" },
    { q: "What is the nearest star to Earth after the Sun?", opts: ["Sirius", "Proxima Centauri", "Betelgeuse", "Alpha Centauri A"], ans: 1, emoji: "⭐", cat: "science", diff: "hard" },
    { q: "What type of electromagnetic radiation has the longest wavelength?", opts: ["X-rays", "Gamma rays", "Visible light", "Radio waves"], ans: 3, emoji: "📻", cat: "science", diff: "hard" },
    { q: "Who invented the telephone?", opts: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], ans: 1, emoji: "📞", cat: "science", diff: "easy" },
    { q: "What is the study of mushrooms called?", opts: ["Botany", "Mycology", "Zoology", "Ecology"], ans: 1, emoji: "🍄", cat: "science", diff: "hard" },
    { q: "Which of these planets has no solid surface?", opts: ["Mars", "Venus", "Mercury", "Jupiter"], ans: 3, emoji: "🪐", cat: "science", diff: "medium" },
    { q: "What part of the brain controls balance and coordination?", opts: ["Cerebrum", "Cerebellum", "Brainstem", "Thalamus"], ans: 1, emoji: "🧠", cat: "science", diff: "hard" },
    { q: "What is the main metal in the Earth's core?", opts: ["Copper", "Aluminum", "Iron", "Gold"], ans: 2, emoji: "🌍", cat: "science", diff: "medium" }
  ],
  culture: [
    { q: "Which country is the birthplace of the Renaissance?", opts: ["France", "Spain", "Italy", "Greece"], ans: 2, emoji: "🎨", cat: "culture", diff: "easy" },
    { q: "What language has the most native speakers?", opts: ["English", "Spanish", "Mandarin Chinese", "Hindi"], ans: 2, emoji: "🗣️", cat: "culture", diff: "medium" },
    { q: "Which religion's holy book is the Quran?", opts: ["Christianity", "Judaism", "Islam", "Hinduism"], ans: 2, emoji: "🕌", cat: "culture", diff: "easy" },
    { q: "Sushi is a traditional dish from which country?", opts: ["China", "South Korea", "Japan", "Thailand"], ans: 2, emoji: "🍣", cat: "culture", diff: "easy" },
    { q: "Which ancient civilization built the pyramids at Giza?", opts: ["Romans", "Greeks", "Egyptians", "Persians"], ans: 2, emoji: "🔺", cat: "culture", diff: "easy" },
    { q: "What is the traditional garment worn by women in India?", opts: ["Kimono", "Sari", "Hanbok", "Cheongsam"], ans: 1, emoji: "👗", cat: "culture", diff: "medium" },
    { q: "Who painted the Mona Lisa?", opts: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], ans: 2, emoji: "🖼️", cat: "culture", diff: "easy" },
    { q: "Which festival is known as the 'Festival of Colors'?", opts: ["Diwali", "Holi", "Eid", "Navrati"], ans: 1, emoji: "🎨", cat: "culture", diff: "medium" },
    { q: "Flamenco is a traditional dance from which country?", opts: ["Mexico", "Argentina", "Spain", "Brazil"], ans: 2, emoji: "💃", cat: "culture", diff: "medium" },
    { q: "In which mythology does Thor, the god of thunder, originate?", opts: ["Greek", "Roman", "Norse", "Egyptian"], ans: 2, emoji: "⚡", cat: "culture", diff: "easy" },
    { q: "Which of these is the largest film industry in the world by number of feature films produced?", opts: ["Hollywood", "Bollywood", "Nollywood", "Tollywood"], ans: 1, emoji: "🎬", cat: "culture", diff: "hard" },
    { q: "What is the national sport of Japan?", opts: ["Judo", "Karate", "Sumo Wrestling", "Baseball"], ans: 2, emoji: "🤼", cat: "culture", diff: "medium" },
    { q: "Which country is famous for the tango dance?", opts: ["Spain", "Argentina", "Cuba", "Brazil"], ans: 1, emoji: "💃", cat: "culture", diff: "medium" },
    { q: "What is the main ingredient in traditional guacamole?", opts: ["Tomato", "Onion", "Avocado", "Lime"], ans: 2, emoji: "🥑", cat: "culture", diff: "easy" },
    { q: "Which instrument is often associated with Scottish culture?", opts: ["Guitar", "Bagpipes", "Harp", "Flute"], ans: 1, emoji: "🎶", cat: "culture", diff: "easy" },
    { q: "Which classical composer went deaf later in life?", opts: ["Mozart", "Bach", "Beethoven", "Chopin"], ans: 2, emoji: "🎹", cat: "culture", diff: "medium" },
    { q: "Matryoshka dolls are traditional nesting dolls from which country?", opts: ["Ukraine", "Poland", "Russia", "Czech Republic"], ans: 2, emoji: "🪆", cat: "culture", diff: "hard" },
    { q: "What does the word 'karaoke' mean in Japanese?", opts: ["Singing together", "Empty orchestra", "Drunken voice", "Happy song"], ans: 1, emoji: "🎤", cat: "culture", diff: "hard" },
    { q: "In Greek mythology, who is the king of the gods?", opts: ["Hades", "Poseidon", "Ares", "Zeus"], ans: 3, emoji: "⚡", cat: "culture", diff: "easy" },
    { q: "Which of these holidays is traditionally celebrated on October 31st?", opts: ["Thanksgiving", "Valentine's Day", "Halloween", "St. Patrick's Day"], ans: 2, emoji: "🎃", cat: "culture", diff: "easy" }
  ],
  geography: [
    { q: "What is the largest continent on Earth?", opts: ["Africa", "North America", "Asia", "Europe"], ans: 2, emoji: "🌍", cat: "geography", diff: "easy" },
    { q: "Which is the longest river in the world?", opts: ["Amazon", "Nile", "Yangtze", "Mississippi"], ans: 1, emoji: "🌊", cat: "geography", diff: "medium" },
    { q: "What is the capital of Australia?", opts: ["Sydney", "Melbourne", "Canberra", "Brisbane"], ans: 2, emoji: "🦘", cat: "geography", diff: "medium" },
    { q: "Which country has the largest land area?", opts: ["Canada", "China", "United States", "Russia"], ans: 3, emoji: "🗺️", cat: "geography", diff: "easy" },
    { q: "Mount Everest is located in which mountain range?", opts: ["Alps", "Andes", "Rockies", "Himalayas"], ans: 3, emoji: "⛰️", cat: "geography", diff: "easy" },
    { q: "What is the smallest independent country in the world?", opts: ["Monaco", "Nauru", "Vatican City", "San Marino"], ans: 2, emoji: "⛪", cat: "geography", diff: "medium" },
    { q: "Which desert is the largest hot desert in the world?", opts: ["Gobi", "Kalahari", "Sahara", "Arabian"], ans: 2, emoji: "🐪", cat: "geography", diff: "easy" },
    { q: "The Great Barrier Reef is located off the coast of which country?", opts: ["Indonesia", "Australia", "Philippines", "Papua New Guinea"], ans: 1, emoji: "🪸", cat: "geography", diff: "easy" },
    { q: "Which ocean is the largest by surface area?", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3, emoji: "🌊", cat: "geography", diff: "easy" },
    { q: "What is the capital city of Japan?", opts: ["Kyoto", "Osaka", "Tokyo", "Seoul"], ans: 2, emoji: "🗼", cat: "geography", diff: "easy" },
    { q: "Which river flows through Paris?", opts: ["Thames", "Rhine", "Seine", "Danube"], ans: 2, emoji: "🌉", cat: "geography", diff: "medium" },
    { q: "Which continent has the most countries?", opts: ["Asia", "Africa", "Europe", "South America"], ans: 1, emoji: "🌍", cat: "geography", diff: "hard" },
    { q: "What is the longest mountain range in the world?", opts: ["Himalayas", "Rockies", "Alps", "Andes"], ans: 3, emoji: "⛰️", cat: "geography", diff: "hard" },
    { q: "Which two countries share the longest international border?", opts: ["USA and Canada", "Russia and China", "India and Pakistan", "Brazil and Argentina"], ans: 0, emoji: "🗺️", cat: "geography", diff: "medium" },
    { q: "In which country would you find the city of Timbuktu?", opts: ["Nigeria", "Mali", "Senegal", "Chad"], ans: 1, emoji: "🏜️", cat: "geography", diff: "hard" },
    { q: "Which sea separates Europe from Africa?", opts: ["Red Sea", "Caribbean Sea", "Black Sea", "Mediterranean Sea"], ans: 3, emoji: "🌊", cat: "geography", diff: "medium" },
    { q: "What is the capital of Canada?", opts: ["Toronto", "Vancouver", "Montreal", "Ottawa"], ans: 3, emoji: "🍁", cat: "geography", diff: "medium" },
    { q: "The Panama Canal connects the Atlantic Ocean to which other ocean?", opts: ["Indian Ocean", "Arctic Ocean", "Pacific Ocean", "Southern Ocean"], ans: 2, emoji: "🚢", cat: "geography", diff: "easy" },
    { q: "Which country is both an island and a continent?", opts: ["Greenland", "Madagascar", "Australia", "Antarctica"], ans: 2, emoji: "🦘", cat: "geography", diff: "easy" },
    { q: "What is the southernmost continent?", opts: ["South America", "Africa", "Australia", "Antarctica"], ans: 3, emoji: "🐧", cat: "geography", diff: "easy" }
  ]
};

function getFallbackQuestions(category) {
  let selected = [];
  if (category === 'all') {
    // Pick 5 from each category to make 20
    const cats = Object.keys(FALLBACK_QUESTIONS);
    cats.forEach(c => {
      const shuffled = [...FALLBACK_QUESTIONS[c]].sort(() => 0.5 - Math.random());
      selected.push(...shuffled.slice(0, 5));
    });
  } else {
    // Pick 20 from the selected category
    const catArray = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS['history'];
    selected = [...catArray].sort(() => 0.5 - Math.random()).slice(0, 20);
  }
  return selected.sort(() => 0.5 - Math.random()); // Final shuffle
}
