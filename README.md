# English Learning Town 🏫

An immersive and interactive English learning game built with Phaser 3, React, and TypeScript. Explore a charming town while mastering English through engaging activities, conversations with NPCs, and hands-on learning experiences.

## 🌐 Play Online Now!

**🎮 [Play English Learning Town](https://miguoliang.github.io/english-learning-town/)**

Experience the game immediately in your browser - no installation required! The game works on desktop computers with keyboard controls.

## 🎮 Game Features

- **Interactive Town Exploration**: Navigate through a beautifully crafted 2D town with arrow keys or WASD
- **Interactive Town**: Explore the charming English Learning Town environment
- **Comprehensive Learning Activities**:
  - 📝 Grammar lessons (Present Simple vs. Continuous, etc.)
  - 🛒 Vocabulary building (shopping, everyday items)
  - 📚 Reading comprehension exercises
  - 💬 Interactive conversations
- **Progress Tracking**: Monitor your advancement across different English skills
- **Seamless Integration**: React-based UI components blend smoothly with Phaser gameplay

### Technology Stack

Built with modern web technologies for the best learning experience:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser) - Game engine
- [React 19.0.0](https://github.com/facebook/react) - UI framework
- [Vite 6.3.1](https://github.com/vitejs/vite) - Build tool
- [TypeScript 5.7.2](https://github.com/microsoft/TypeScript) - Type safety

![screenshot](screenshot.png)

## 🎮 How to Play

### Quick Start Guide

1. **🌐 Visit the Game**: Go to [https://miguoliang.github.io/english-learning-town/](https://miguoliang.github.io/english-learning-town/)
2. **🎯 Start Playing**: Click "Start Game" when the page loads
3. **🚶 Move Around**: Use Arrow Keys or WASD to explore the town
4. **📚 Learn**: Complete activities to improve your English skills!

### Controls

- **Movement**: Use Arrow Keys or WASD to move your character around the town
- **Navigation**: Explore freely and discover learning opportunities throughout the town

### Gameplay Guide

1. **Start your Journey**: Begin in the town center and explore the different areas
2. **Complete Activities**: Engage with grammar lessons, vocabulary exercises, and reading comprehension
3. **Track Progress**: Watch your English skills improve across grammar, vocabulary, reading, and conversation

### Learning Activities

- **📝 Grammar Lessons**: Present Simple vs. Continuous and other grammar topics
- **🛒 Vocabulary Building**: Shopping and everyday item vocabulary
- **📚 Reading Comprehension**: Literature-based activities and exercises
- **💬 Interactive Conversations**: Practice conversational English skills

### System Requirements

- **For Online Play**: Any modern web browser (Chrome, Firefox, Safari, Edge)
- **Keyboard**: Required for character movement and interactions
- **Screen**: Desktop or laptop recommended for best experience

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command               | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm install`         | Install project dependencies                                                                             |
| `npm run dev`         | Launch a development web server                                                                          |
| `npm run build`       | Create a production build in the `dist` folder                                                           |
| `npm run dev-nolog`   | Launch a development web server without sending anonymous data (see "About log.js" below)                |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Vite documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## 🏗️ Project Structure

The English Learning Town game is organized with a clear separation between React UI components and Phaser game scenes:

| Path                                 | Description                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `index.html`                         | Main HTML page that hosts the game                                            |
| `src/App.tsx`                        | React component managing learning modules, progress tracking, and UI overlays |
| `src/PhaserGame.tsx`                 | Bridge component between React and Phaser, handles game initialization        |
| `src/main.tsx`                       | React application entry point                                                 |
| `src/game/main.ts`                   | Phaser game configuration and scene registration                              |
| `src/game/EventBus.ts`               | Communication system between React components and Phaser scenes               |
| **Game Scenes**                      |                                                                               |
| `src/game/scenes/Boot.ts`            | Initial loading and setup scene                                               |
| `src/game/scenes/Preloader.ts`       | Asset loading scene                                                           |
| `src/game/scenes/MainMenu.ts`        | Game start menu and introduction                                              |
| `src/game/scenes/Game.ts`            | Main town exploration scene                                                   |
| `src/game/scenes/GameOver.ts`        | End-of-session summary and progress display                                   |
| **Assets & Configuration**           |                                                                               |
| `public/assets/`                     | Game sprites, backgrounds, and visual assets                                  |
| `public/style.css`                   | CSS styling for React components and learning modules                         |

## 🔗 React-Phaser Integration

The English Learning Town seamlessly integrates React UI components with Phaser game scenes through a sophisticated event system:

### Learning Activity System

When players interact with NPCs or enter buildings, the Phaser game scenes emit events that trigger React-based learning modules:

```ts
// In Phaser scene (e.g., when talking to teacher)
EventBus.emit('enter-school', {
  activity: 'grammar-lesson',
  npc: 'teacher',
  name: 'Ms. Johnson',
});

// In React App.tsx
EventBus.on('enter-school', data => {
  setCurrentActivity(data);
  setShowLearningModule(true);
});
```

### Progress Tracking

Learning progress is managed in React state and persists across game sessions, allowing students to track their improvement in:

- Grammar understanding
- Vocabulary expansion
- Reading comprehension
- Conversation skills

## 🎓 Educational Design

English Learning Town is designed with pedagogical principles in mind:

- **Contextual Learning**: English skills are taught within meaningful scenarios (shopping, conversations, reading)
- **Progressive Difficulty**: Activities adapt to learner progress and build upon previous knowledge
- **Interactive Engagement**: Game mechanics motivate continued learning through exploration and achievement
- **Multi-Modal Learning**: Combines visual, textual, and interactive elements for different learning styles
- **Immediate Feedback**: Instant responses help reinforce correct usage and identify areas for improvement

## 🚀 Getting Started

### Option 1: Play Online (Recommended)

**🎮 [Click here to play now!](https://miguoliang.github.io/english-learning-town/)**

No installation needed - just open the link in your web browser and start learning English immediately!

### Option 2: Run Locally for Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/miguoliang/english-learning-town.git
   cd english-learning-town
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:8080` and begin your English learning adventure!

## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png';
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload();
{
  //  This is an example of an imported bundled image.
  //  Remember to import it at the top of this file
  this.load.image('logo', logoImg);

  //  This is an example of loading a static image
  //  from the public/assets folder:
  this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## 🚀 Deployment

This game is automatically deployed to GitHub Pages and available at:
**https://miguoliang.github.io/english-learning-town/**

### Automatic Deployment

The project uses GitHub Actions for continuous deployment:
- Every push to the `main` branch automatically triggers a new deployment
- The build process creates optimized production files
- The game is automatically published to GitHub Pages

### Manual Deployment (for contributors)

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

For manual deployment:
```bash
npm run deploy
```

This command builds the project and deploys it to GitHub Pages (requires appropriate repository permissions).

## Customizing the Template

### Vite

If you want to customize your build, such as adding plugin (i.e. for loading CSS or fonts), you can modify the `vite/config.*.mjs` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Vite documentation](https://vitejs.dev/) for more information.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running.

## 🌟 Contributing

English Learning Town is an educational project designed to make English learning fun and interactive. Whether you're an educator, developer, or language learning enthusiast, contributions are welcome!

### Ways to Contribute

- **Educational Content**: Add new vocabulary sets, grammar exercises, or reading materials
- **Game Features**: Implement new buildings, NPCs, or interactive elements
- **Accessibility**: Improve the game for learners with different needs
- **Localization**: Help translate the interface for international learners
- **Bug Reports**: Help us identify and fix issues

## 📚 Educational Resources

This game is built on proven language learning methodologies:

- **Task-Based Learning**: Real-world scenarios provide context for language use
- **Gamification**: Achievement systems motivate continued engagement
- **Immersive Environment**: Town exploration creates a memorable learning experience

## 🤝 Acknowledgments

Built with [Phaser 3](https://phaser.io) for robust 2D game development and [React](https://react.dev) for responsive educational interfaces.

Special thanks to educators and language learning researchers whose methodologies inspire this interactive approach to English education.

---

**English Learning Town** - Making English learning an adventure, one building at a time! 🏫✨
