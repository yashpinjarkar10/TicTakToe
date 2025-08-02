# Mega Tic-Tac-Toe Mobile App

A strategic twist on the classic Tic-Tac-Toe game featuring 9 interconnected mini-boards. Built as a Progressive Web App (PWA) for mobile devices with touch-optimized controls.

## Game Rules

### Objective
Win three mini-boards in a row (horizontal, vertical, or diagonal) on the mega-board to claim victory!

### How to Play
1. **First Move**: Player X can place their mark in any of the 81 cells
2. **Directed Play**: After the first move, where you play determines which mini-board your opponent must play in next
3. **Free Choice**: If the target mini-board is already won or completely full, you get free choice of any available mini-board
4. **Winning a Mini-Board**: Get three of your marks in a row within a mini-board to claim it
5. **Victory Condition**: First player to claim three mini-boards in a row on the mega-board wins!

### Visual Indicators
- **Active Mini-Board**: Highlighted with green border and glow effect
- **Won Mini-Boards**: Display the winner's symbol (X or O) as an overlay
- **Current Player**: Shown in the header with clear visual feedback
- **Game Status**: Real-time updates on moves and game state

## Features

- **Mobile-Optimized**: Touch-friendly interface designed for smartphones and tablets
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Progressive Web App**: Can be installed on mobile devices for native-like experience
- **Offline Support**: Service Worker enables gameplay without internet connection
- **Touch Feedback**: Visual and haptic feedback for enhanced mobile experience
- **Rules Modal**: Built-in rules reference accessible anytime
- **New Game**: Quick reset functionality to start fresh matches

## Technical Features

- **Pure JavaScript**: No external dependencies for fast loading
- **CSS Grid**: Modern layout system for perfect board alignment
- **Service Worker**: Offline caching for improved performance
- **Web App Manifest**: PWA capabilities for installation
- **Touch Optimization**: Prevents zoom and enables smooth touch interactions
- **Accessibility**: Keyboard navigation and screen reader friendly

## Installation & Setup

### Running Locally
1. Clone or download this repository
2. Open `index.html` in a web browser
3. For mobile testing, use your browser's device simulation mode

### Mobile Installation
1. Open the app in a mobile browser (Chrome, Safari, etc.)
2. Look for "Add to Home Screen" option in browser menu
3. Install as a PWA for native app experience

### Development Server (Optional)
For advanced development or testing features like Service Worker:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server

# Then visit http://localhost:8000
```

## Project Structure

```
TicTakTo_MEGA/
├── index.html          # Main HTML structure
├── styles.css          # Mobile-optimized styling
├── script.js           # Game logic and interactions
├── manifest.json       # PWA configuration
├── sw.js              # Service Worker for offline support
└── README.md          # This file
```

## Browser Compatibility

- **Chrome/Chromium**: Full support including PWA features
- **Safari**: Full support with PWA installation on iOS
- **Firefox**: Game functionality (limited PWA support)
- **Edge**: Full support including PWA features

## Development Notes

### Game Logic Implementation
- `MegaTicTacToe` class handles all game state and logic
- Modular design with separate methods for each game phase
- Event-driven architecture for responsive user interactions

### Mobile Optimizations
- `touch-action: manipulation` prevents unwanted gestures
- Viewport meta tag prevents zooming
- CSS transforms for smooth visual feedback
- Optimized touch targets (minimum 44px as per accessibility guidelines)

### PWA Features
- Web App Manifest for installation prompts
- Service Worker for offline functionality
- Appropriate meta tags for mobile browsers
- Icon placeholders (add your own 192x192 and 512x512 PNG icons)

## Customization

### Styling
- Modify `styles.css` for different color schemes or layouts
- CSS custom properties can be added for theme switching
- Grid gaps and board sizing can be adjusted for different devices

### Game Rules
- Edit `script.js` to implement rule variations
- Add new win conditions or board sizes
- Implement timer-based gameplay or scoring systems

### Features to Add
- Player statistics tracking
- Sound effects and animations
- AI opponent with difficulty levels
- Online multiplayer capabilities
- Tournament mode with multiple games

## Contributing

Feel free to fork this project and submit improvements! Some areas for enhancement:
- Better animations and visual effects
- Sound design and haptic feedback
- AI player implementation
- Multiplayer networking
- Advanced PWA features

## License

This project is open source and available under the MIT License.

---

**Happy Gaming! 🎮**

Enjoy your strategic battles in Mega Tic-Tac-Toe!
