const wisdom: Record<string, string[]> = {
  general: [
    'Sometimes the best way to solve your own problems is to help someone else.',
    'It is important to draw wisdom from many different places. If you take it from only one place, it becomes rigid and stale.',
    'Life happens wherever you are, whether you make it or not.',
    'You must never give in to despair. Allow yourself to slip down that road, and you surrender to your lowest instincts.',
    'Pride is not the opposite of shame, but its source. True humility is the only antidote to shame.',
    'Failure is only the opportunity to begin again. Only this time, more wisely.',
    'In the darkest times, hope is something you give yourself. That is the meaning of inner strength.',
    'Protection and power are overrated. I think you are very wise to choose happiness and love.',
    'While it is always best to believe in oneself, a little help from others can be a great blessing.',
    'You are not the man you used to be. You are stronger, wiser, and freer than you have ever been. And now you have come to the crossroads of your destiny.',
    "Sometimes life is like this dark tunnel. You can't always see the light at the end of the tunnel, but if you just keep moving... you will come to a better place.",
    'Who you are in the dark defines who you are in the light.',
    'There is nothing wrong with a life of peace and prosperity. I suggest you think about what it is that you want from your life, and why.',
    'Good times become good memories, but bad times make good lessons.',
    'You must look within yourself to save yourself from your other self. Only then will your true self reveal itself.',
    'A man needs his rest.',
    "Sharing tea with a fascinating stranger is one of life's true delights.",
    'Be careful what you wish for. History is not always kind to its subjects.',
    'Destiny is a funny thing. You never know how things are going to work out.',
    'It is usually best to admit mistakes when they occur, and to seek to restore honor.',
  ],

  fire: [
    'Fire is the element of power. The people of the Fire Nation have desire and will, and the energy to drive and achieve what they want.',
    'Lightning is a pure expression of firebending, without aggression. It requires peace of mind.',
    'You must not let your anger consume you. Fire that burns without control destroys everything in its path.',
    'The true heart of firebending is not destruction — it is life and energy.',
    'A flame that burns too brightly risks consuming itself. Control is the mark of a true firebender.',
    'Even the smallest spark can ignite a great change. Never underestimate your inner fire.',
    'Rage is a wildfire — powerful but blind. Channel your passion with purpose.',
    'The sun does not burn with fury. It shines with warmth. Be like the sun.',
  ],

  water: [
    'Water is the element of change. The people of the Water Tribe are capable of adapting to many things.',
    'Be like water — flow around obstacles rather than crashing against them.',
    'The moon pushes and pulls the tides. Even the greatest forces follow a gentle rhythm.',
    'Water teaches us that softness can overcome the hardest stone, given time and patience.',
    'A river cuts through rock not because of its power, but its persistence.',
    'Healing is the highest form of waterbending. To mend what is broken takes more strength than to destroy.',
    'The ocean is vast and deep, just as your potential is limitless if you allow yourself to flow.',
    'Ice is just water that chose to stand still. Never let fear freeze your spirit.',
  ],

  earth: [
    'Earth is the element of substance. The people of the Earth Kingdom are diverse and strong.',
    'You must be rooted like a mountain — unmovable, enduring, steady.',
    "Patience is the earthbender's greatest weapon. The mountain does not rush, yet it shapes the world.",
    'True strength is not in force, but in standing firm when others would fall.',
    'Even the tallest mountain began as a single stone. Growth takes time.',
    'The earth remembers everything. Build your foundation on truth and it will hold forever.',
    'A wall can protect, but it can also imprison. Know when to stand firm and when to open the path.',
    'Crystals form under immense pressure. Your hardships are shaping you into something beautiful.',
  ],

  air: [
    'Air is the element of freedom. The Air Nomads detached themselves from worldly concerns and found peace and freedom.',
    'Let go of your earthly attachments and enter the void. Empty, and become wind.',
    'The wind does not fight — it simply changes direction. Flexibility is true strength.',
    'You cannot hold the wind, just as you cannot hold onto anger forever. Let it pass through you.',
    'Freedom is not the absence of responsibility, but the choice of which path to walk.',
    'A leaf in the wind does not struggle — it trusts the journey. Have faith in where life carries you.',
    'Stillness of mind is the foundation of airbending. In silence, you will hear the answers you seek.',
    'The sky has no walls. Do not build them in your mind.',
  ],
};

export function getWisdom(element: string | null = null): string {
  let pool: string[];
  if (element && wisdom[element]) {
    pool = Math.random() < 0.6 ? wisdom[element] : wisdom.general;
  } else {
    pool = wisdom.general;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

const greetings = [
  'Ah, welcome! Would you like some tea? I find jasmine to be most calming.',
  'Hello, my friend. Come, sit. Let us share a moment of peace together.',
  'It is good to see you. Remember — every day is a new chance to grow.',
  'Welcome, young one. The journey of a thousand miles begins with a single step... and perhaps a cup of tea.',
];

export function getGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)];
}
