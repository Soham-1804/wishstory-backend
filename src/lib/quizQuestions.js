// Master question bank — 60+ questions across 5 categories
// type: 'choice' | 'slider'
// options (for choice): [{ label, value }] — value must be consistent strings
// slider range is always 1–5

const QUESTIONS = [

  // ── LOVE LANGUAGE ────────────────────────────────────────────────────────
  {
    id: 'll-01', category: 'loveLanguage', type: 'choice',
    question: 'How do you prefer to show love most?',
    options: [
      { label: 'Kind words & compliments', value: 'words' },
      { label: 'Hugs, hand-holding & touch', value: 'touch' },
      { label: 'Thoughtful gifts', value: 'gifts' },
      { label: 'Acts of service (cooking, helping)', value: 'acts' },
    ]
  },
  {
    id: 'll-02', category: 'loveLanguage', type: 'choice',
    question: 'What matters most to you after a fight?',
    options: [
      { label: 'A heartfelt apology', value: 'apology' },
      { label: 'A long hug', value: 'hug' },
      { label: 'Some space to cool down', value: 'space' },
      { label: 'Talking it through calmly', value: 'talk' },
    ]
  },
  {
    id: 'll-03', category: 'loveLanguage', type: 'choice',
    question: 'Which gesture means the most to you?',
    options: [
      { label: '"I\'m proud of you" text out of nowhere', value: 'text' },
      { label: 'Partner surprises you with your fav food', value: 'food' },
      { label: 'A long back rub after a hard day', value: 'massage' },
      { label: 'Partner handles a task you were dreading', value: 'task' },
    ]
  },
  {
    id: 'll-04', category: 'loveLanguage', type: 'choice',
    question: 'On a tough day, what do you need from your partner?',
    options: [
      { label: 'Words of encouragement', value: 'encourage' },
      { label: 'Physical comfort (cuddle, touch)', value: 'cuddle' },
      { label: 'Them to handle something for me', value: 'help' },
      { label: 'Quality time — just be present', value: 'presence' },
    ]
  },
  {
    id: 'll-05', category: 'loveLanguage', type: 'choice',
    question: 'Ideal anniversary celebration?',
    options: [
      { label: 'Handwritten love letter + dinner', value: 'letter' },
      { label: 'A meaningful gift', value: 'gift' },
      { label: 'A trip or experience together', value: 'trip' },
      { label: 'Cooking together at home', value: 'cook' },
    ]
  },
  {
    id: 'll-06', category: 'loveLanguage', type: 'slider',
    question: 'How often do you like to say / hear "I love you"?',
    leftLabel: 'Rarely needed', rightLabel: 'Multiple times a day',
  },
  {
    id: 'll-07', category: 'loveLanguage', type: 'choice',
    question: 'You feel most appreciated when your partner…',
    options: [
      { label: 'Tells others how great you are', value: 'public_praise' },
      { label: 'Holds your hand in public', value: 'pda' },
      { label: 'Remembers small details you mentioned', value: 'memory' },
      { label: 'Clears your schedule so you have free time', value: 'time' },
    ]
  },
  {
    id: 'll-08', category: 'loveLanguage', type: 'choice',
    question: 'What\'s the most romantic thing a partner can do?',
    options: [
      { label: 'Write a poem or heartfelt message', value: 'poem' },
      { label: 'Plan a surprise date night', value: 'surprise_date' },
      { label: 'Give a meaningful piece of jewelry', value: 'jewelry' },
      { label: 'Take care of you when you\'re sick', value: 'care' },
    ]
  },

  // ── LIFESTYLE ────────────────────────────────────────────────────────────
  {
    id: 'ls-01', category: 'lifestyle', type: 'choice',
    question: 'Ideal Sunday with your partner?',
    options: [
      { label: 'Netflix marathon at home', value: 'netflix' },
      { label: 'Spontaneous road trip', value: 'roadtrip' },
      { label: 'Brunch + walk + bookshop', value: 'brunch' },
      { label: 'Active — hike, gym, sport', value: 'active' },
    ]
  },
  {
    id: 'ls-02', category: 'lifestyle', type: 'slider',
    question: 'How much of a morning person are you?',
    leftLabel: 'Night owl 🌙', rightLabel: 'Early riser ☀️',
  },
  {
    id: 'ls-03', category: 'lifestyle', type: 'choice',
    question: 'Your social battery on weekends is usually…',
    options: [
      { label: 'Full — love socialising all weekend', value: 'social' },
      { label: 'Mixed — some time out, some in', value: 'mixed' },
      { label: 'Low — I recharge alone or with partner', value: 'homebody' },
      { label: 'Depends on my mood', value: 'mood' },
    ]
  },
  {
    id: 'ls-04', category: 'lifestyle', type: 'slider',
    question: 'How often do you want to travel or go on trips?',
    leftLabel: 'Once a year is fine', rightLabel: 'Every chance we get',
  },
  {
    id: 'ls-05', category: 'lifestyle', type: 'choice',
    question: 'When it comes to spending on experiences vs things?',
    options: [
      { label: 'Experiences all the way', value: 'experiences' },
      { label: 'Balance of both', value: 'balance' },
      { label: 'I prefer quality things that last', value: 'things' },
      { label: 'Save it — both are luxuries', value: 'save' },
    ]
  },
  {
    id: 'ls-06', category: 'lifestyle', type: 'choice',
    question: 'Ideal living situation in a relationship?',
    options: [
      { label: 'Together as soon as possible', value: 'together_asap' },
      { label: 'Together after engagement/marriage', value: 'together_after' },
      { label: 'Live separately even when married', value: 'separate' },
      { label: 'No fixed view — it depends', value: 'flexible' },
    ]
  },
  {
    id: 'ls-07', category: 'lifestyle', type: 'slider',
    question: 'How much alone time do you need each week?',
    leftLabel: 'Barely any', rightLabel: 'A lot — it recharges me',
  },
  {
    id: 'ls-08', category: 'lifestyle', type: 'choice',
    question: 'Your approach to eating?',
    options: [
      { label: 'Cook at home most days', value: 'cook' },
      { label: 'Eat out often — love trying places', value: 'eatout' },
      { label: 'Mix of both', value: 'mix' },
      { label: 'Order in / delivery mostly', value: 'delivery' },
    ]
  },

  // ── FUTURE GOALS ─────────────────────────────────────────────────────────
  {
    id: 'fg-01', category: 'futureGoals', type: 'choice',
    question: 'Kids someday?',
    options: [
      { label: 'Yes, definitely', value: 'yes' },
      { label: 'Maybe — still figuring it out', value: 'maybe' },
      { label: 'No — not for me', value: 'no' },
      { label: 'Open to whatever life brings', value: 'open' },
    ]
  },
  {
    id: 'fg-02', category: 'futureGoals', type: 'choice',
    question: 'Where do you see yourself in 5 years?',
    options: [
      { label: 'Same city, building a life here', value: 'same_city' },
      { label: 'Another city in India', value: 'other_city' },
      { label: 'Living abroad', value: 'abroad' },
      { label: 'No fixed plan — wherever life leads', value: 'open' },
    ]
  },
  {
    id: 'fg-03', category: 'futureGoals', type: 'slider',
    question: 'How important is career ambition to you?',
    leftLabel: 'Work to live', rightLabel: 'Highly career-driven',
  },
  {
    id: 'fg-04', category: 'futureGoals', type: 'choice',
    question: 'Ideal long-term living situation?',
    options: [
      { label: 'Apartment in a busy city', value: 'city_apt' },
      { label: 'House in the suburbs', value: 'suburbs' },
      { label: 'A quiet town or village', value: 'village' },
      { label: 'Moving around — no fixed base', value: 'nomad' },
    ]
  },
  {
    id: 'fg-05', category: 'futureGoals', type: 'choice',
    question: 'How do you picture your financial future?',
    options: [
      { label: 'Fully joint finances when married', value: 'joint' },
      { label: 'Shared expenses, some separate savings', value: 'shared' },
      { label: 'Mostly separate finances', value: 'separate' },
      { label: 'We\'ll figure it out together', value: 'flexible' },
    ]
  },
  {
    id: 'fg-06', category: 'futureGoals', type: 'slider',
    question: 'How religious or spiritual are you?',
    leftLabel: 'Not at all', rightLabel: 'Very much so',
  },
  {
    id: 'fg-07', category: 'futureGoals', type: 'choice',
    question: 'What does success look like to you in 10 years?',
    options: [
      { label: 'A thriving career and financial security', value: 'career' },
      { label: 'A happy family and home', value: 'family' },
      { label: 'Freedom to live life on my own terms', value: 'freedom' },
      { label: 'Making a meaningful impact in the world', value: 'impact' },
    ]
  },
  {
    id: 'fg-08', category: 'futureGoals', type: 'choice',
    question: 'How do you handle big life decisions?',
    options: [
      { label: 'Research everything, make a plan', value: 'plan' },
      { label: 'Follow gut feeling', value: 'gut' },
      { label: 'Talk it through with loved ones first', value: 'discuss' },
      { label: 'Go with the flow and adapt', value: 'flow' },
    ]
  },

  // ── DAILY HABITS ─────────────────────────────────────────────────────────
  {
    id: 'dh-01', category: 'dailyHabits', type: 'slider',
    question: 'How tidy is your personal space usually?',
    leftLabel: 'Organised chaos', rightLabel: 'Spotlessly clean',
  },
  {
    id: 'dh-02', category: 'dailyHabits', type: 'choice',
    question: 'How do you handle money day-to-day?',
    options: [
      { label: 'Careful saver — budget everything', value: 'saver' },
      { label: 'Balanced spender', value: 'balanced' },
      { label: 'Spender — life is short!', value: 'spender' },
      { label: 'Impulsive but I recover', value: 'impulsive' },
    ]
  },
  {
    id: 'dh-03', category: 'dailyHabits', type: 'slider',
    question: 'How health-conscious are you?',
    leftLabel: 'I live freely', rightLabel: 'Very health-focused',
  },
  {
    id: 'dh-04', category: 'dailyHabits', type: 'choice',
    question: 'How do you unwind at the end of the day?',
    options: [
      { label: 'Scrolling phone / social media', value: 'scroll' },
      { label: 'Watching something (series/movies)', value: 'watch' },
      { label: 'Reading or journaling', value: 'read' },
      { label: 'Physical activity (gym, walk, yoga)', value: 'active' },
    ]
  },
  {
    id: 'dh-05', category: 'dailyHabits', type: 'slider',
    question: 'How punctual are you?',
    leftLabel: 'Always running late', rightLabel: 'Always early',
  },
  {
    id: 'dh-06', category: 'dailyHabits', type: 'choice',
    question: 'Your approach to household chores?',
    options: [
      { label: 'Split everything equally', value: 'equal' },
      { label: 'Based on who has more time', value: 'time' },
      { label: 'Each person has their own areas', value: 'zones' },
      { label: 'Hire help when possible', value: 'hire' },
    ]
  },
  {
    id: 'dh-07', category: 'dailyHabits', type: 'slider',
    question: 'How much do you use your phone when with your partner?',
    leftLabel: 'Almost never', rightLabel: 'Constantly',
  },
  {
    id: 'dh-08', category: 'dailyHabits', type: 'choice',
    question: 'Your relationship with sleep?',
    options: [
      { label: '8+ hours — non-negotiable', value: 'lots' },
      { label: '6-7 hours, mostly consistent', value: 'moderate' },
      { label: 'Irregular — depends on the day', value: 'irregular' },
      { label: 'Night owl, sleep when I can', value: 'nightowl' },
    ]
  },

  // ── PERSONALITY ──────────────────────────────────────────────────────────
  {
    id: 'pe-01', category: 'personality', type: 'choice',
    question: 'When you\'re stressed, you tend to…',
    options: [
      { label: 'Talk about it immediately', value: 'talk' },
      { label: 'Withdraw and process alone', value: 'withdraw' },
      { label: 'Distract myself with activity', value: 'distract' },
      { label: 'Overthink quietly then explode', value: 'overthink' },
    ]
  },
  {
    id: 'pe-02', category: 'personality', type: 'slider',
    question: 'How emotionally expressive are you?',
    leftLabel: 'Very reserved', rightLabel: 'Open book',
  },
  {
    id: 'pe-03', category: 'personality', type: 'choice',
    question: 'In a conflict with your partner, you usually…',
    options: [
      { label: 'Want to resolve it right now', value: 'resolve_now' },
      { label: 'Need time to calm down first', value: 'calm_first' },
      { label: 'Avoid conflict — hate fighting', value: 'avoid' },
      { label: 'Stand firm on my point', value: 'stand_firm' },
    ]
  },
  {
    id: 'pe-04', category: 'personality', type: 'choice',
    question: 'How do you feel about your partner having close friends of the opposite gender?',
    options: [
      { label: 'Totally fine — trust is everything', value: 'fine' },
      { label: 'Fine, but I like to know about them', value: 'aware' },
      { label: 'A bit uncomfortable, I\'ll admit', value: 'uncomfortable' },
      { label: 'Prefer if they kept it minimal', value: 'prefer_less' },
    ]
  },
  {
    id: 'pe-05', category: 'personality', type: 'slider',
    question: 'How jealous do you tend to get?',
    leftLabel: 'Not at all', rightLabel: 'Quite a lot',
  },
  {
    id: 'pe-06', category: 'personality', type: 'choice',
    question: 'When making plans, you prefer…',
    options: [
      { label: 'Detailed plans made in advance', value: 'planned' },
      { label: 'Loose plans with flexibility', value: 'loose' },
      { label: 'Total spontaneity', value: 'spontaneous' },
      { label: 'Let the other person decide', value: 'defer' },
    ]
  },
  {
    id: 'pe-07', category: 'personality', type: 'choice',
    question: 'Which best describes your sense of humour?',
    options: [
      { label: 'Dry and sarcastic', value: 'dry' },
      { label: 'Goofy and silly', value: 'goofy' },
      { label: 'Witty and quick', value: 'witty' },
      { label: 'Sweet and wholesome', value: 'wholesome' },
    ]
  },
  {
    id: 'pe-08', category: 'personality', type: 'slider',
    question: 'How important is alone time (away from your partner) to you?',
    leftLabel: 'I want to be together always', rightLabel: 'Very — I need it regularly',
  },
]

module.exports = { QUESTIONS }
