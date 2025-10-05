# Scripture Mastery - Bible Memorization App 📖

A gamified Bible memorization app inspired by Duolingo, designed to make memorizing scripture addictive and fun!

## ✨ Features

### 🎮 Gamification
- **XP & Levels:** Earn experience points and level up as you practice
- **Daily Streaks:** Maintain streaks to stay motivated (with freeze days)
- **Achievements:** Unlock badges for milestones
- **Progress Tracking:** Detailed analytics and statistics

### 📚 Smart Learning
- **Spaced Repetition:** Intelligent algorithm schedules optimal review times
- **Mastery Levels:** Track progress from "New" to "Perfect" (0-5 levels)
- **Multiple Practice Modes:**
  - Fill in the Blank
  - Multiple Choice
  - Typing Practice
  - Audio Recitation (coming soon)

### 🎯 Practice Features
- **Randomized Reviews:** 10 verses per session
- **Adaptive Difficulty:** Questions adjust based on mastery level
- **Instant Feedback:** See correct answers and earn XP immediately
- **Progress Visualization:** Real-time stats during practice

### 📊 Analytics
- Accuracy tracking
- Total practices count
- Mastered verses overview
- Streak statistics
- Upcoming milestones

## 🚀 Getting Started

### Quick Start
1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Scan QR code with Expo Go app on your Android phone

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📱 Tech Stack

- **Framework:** React Native with Expo
- **UI Library:** React Native Paper
- **Navigation:** React Navigation
- **Database:** SQLite (expo-sqlite)
- **State Management:** React Context API
- **Animations:** React Native Reanimated

## 🎨 App Structure

```
src/
├── context/
│   └── AppContext.js        # Global state management
├── screens/
│   ├── HomeScreen.js        # Dashboard with stats & quick actions
│   ├── PracticeScreen.js    # Practice sessions with multiple modes
│   ├── LibraryScreen.js     # Verse library & management
│   ├── ProgressScreen.js    # Detailed progress tracking
│   └── AchievementsScreen.js # Achievement system
└── services/
    └── database.js          # SQLite database operations
```

## 🎯 How to Use

1. **Add Verses:** Go to "My Verses" tab and tap + to add verses (start with Romans!)
2. **Daily Practice:** Tap "Start Daily Practice" on the home screen
3. **Complete Exercises:** Answer fill-in-blank, multiple choice, or typing questions
4. **Earn Rewards:** Gain XP, level up, and unlock achievements
5. **Track Progress:** View detailed analytics in the Progress tab

## 🏆 Achievement System

- **First Steps:** Complete your first practice session
- **Week Warrior:** Maintain a 7-day streak
- **Memory Master:** Reach mastery level 5 on any verse
- **Romans Scholar:** Complete all of Romans
- **Centurion:** Practice 100 verses

## 📖 Database Schema

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete schema details.

## 🔮 Future Enhancements

- Bible API integration for easy verse import
- Speech recognition for audio recitation
- Social features (leaderboards, challenges)
- Dark mode
- Custom verse collections
- Weekly/monthly goals
- Verse memorization challenges

## 📄 License

Open source - available for personal use

---

**Happy memorizing! 🎉**