# Scripture Mastery - Android Deployment Guide

## Prerequisites

Before deploying to your Android phone, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **npm** or **yarn** package manager
3. **Expo CLI** - Install globally: `npm install -g expo-cli`
4. **Expo Go app** on your Android phone - [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Setup Instructions

### Step 1: Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd BibleMemorisation
npm install
```

### Step 2: Start the Development Server

Start the Expo development server:

```bash
npm start
# or
expo start
```

This will open the Expo DevTools in your browser and display a QR code.

### Step 3: Run on Your Android Phone

#### Option A: Using Expo Go (Recommended for Testing)

1. Open the **Expo Go** app on your Android phone
2. Scan the QR code displayed in the terminal or browser
3. The app will download and launch on your phone

**Note:** Make sure your phone and computer are on the same Wi-Fi network.

#### Option B: Build APK for Production

For a standalone APK that doesn't require Expo Go:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Download and Install:**
   - Once the build completes, you'll receive a download link
   - Download the APK to your phone
   - Enable "Install from Unknown Sources" in your Android settings
   - Install the APK

## Initial Data Setup

The app starts with an empty database. To add verses:

### Method 1: Manual Entry (via the app)

1. Open the app
2. Navigate to "My Verses" tab
3. Tap the **+** button
4. Enter verse details:
   - Book: Romans
   - Chapter: 1
   - Verse: 16
   - Text: "For I am not ashamed of the gospel of Christ..."

### Method 2: Bulk Import (recommended for Romans)

Create a seed data file to import multiple verses at once:

1. Create `src/data/romans.js`:

```javascript
export const romansVerses = [
  { book: 'Romans', chapter: 1, verse: 1, text: 'Paul, a bondservant of Jesus Christ...' },
  { book: 'Romans', chapter: 1, verse: 2, text: 'which He promised before through His prophets...' },
  // Add more verses...
];
```

2. Create an import function in your database service
3. Call it on first app launch

## Features Overview

### 1. **Home Dashboard**
- View your level, XP, and current streak
- Quick access to daily practice
- Statistics overview

### 2. **Daily Practice**
- Randomized practice modes:
  - **Fill in the Blank** - Complete missing words
  - **Multiple Choice** - Select correct words
  - **Typing Practice** - Type entire verses from memory
- Spaced repetition algorithm automatically schedules reviews
- Earn XP and level up

### 3. **My Verses**
- Add new verses manually
- View mastery levels for each verse
- Filter by book or search
- Track practice count

### 4. **Progress Tracking**
- Level and XP progress
- Streak statistics (current & longest)
- Mastery overview
- Performance metrics
- Upcoming milestones

### 5. **Achievements**
- Unlock achievements by:
  - Completing practices
  - Maintaining streaks
  - Mastering verses
  - Reaching milestones

## Gamification Features

### XP & Levels
- Earn 10-35 XP per correct answer (based on mastery level)
- Earn 5 XP for incorrect answers
- 100 XP = 1 Level

### Streaks
- Practice daily to build your streak
- Freeze days protect your streak (coming soon: earn via achievements)

### Mastery Levels (0-5)
- **0 - New:** Just added
- **1 - Learning:** 3+ correct in a row
- **2 - Familiar:** 6+ correct in a row
- **3 - Known:** 9+ correct in a row
- **4 - Mastered:** 12+ correct in a row
- **5 - Perfect:** 15+ correct in a row

### Spaced Repetition Schedule
- Level 0: Review immediately
- Level 1: Review in 1 day
- Level 2: Review in 3 days
- Level 3: Review in 7 days
- Level 4: Review in 14 days
- Level 5: Review in 30 days

## Tips for Best Experience

1. **Daily Consistency:** Practice every day to maintain your streak
2. **Start Small:** Begin with 5-10 verses, then gradually add more
3. **Focus on Quality:** Take time to understand each verse, not just memorize
4. **Use Different Modes:** Each practice mode strengthens memory differently
5. **Review Regularly:** Trust the spaced repetition algorithm

## Troubleshooting

### App Won't Load
- Ensure you're on the same Wi-Fi network
- Restart the Expo server
- Clear Expo cache: `expo start -c`

### Database Issues
- Uninstall and reinstall the app
- This will reset the database

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Update Expo: `expo upgrade`

## Future Enhancements

- [ ] Import verses from Bible API
- [ ] Audio recitation mode with speech recognition
- [ ] Social features (share progress, compete with friends)
- [ ] Custom verse collections
- [ ] Dark mode
- [ ] Offline Bible reference
- [ ] Verse memorization challenges
- [ ] Weekly/Monthly goals

## Support

For issues or feature requests, create an issue in the GitHub repository.

## License

This project is open source and available for personal use.
