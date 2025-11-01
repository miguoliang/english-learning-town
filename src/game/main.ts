import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Town } from './scenes/Town';
import { MainMenu } from './scenes/MainMenu';
import { Home } from './scenes/Home';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { getCurrentEnvironment } from './config/DebugConfig';

// Check if running in production
const isProduction = getCurrentEnvironment() === 'production';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 }, // No gravity for top-down view
      debug: !isProduction, // Only show physics debug in development
    },
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    Town,
    Home,
    GameOver,
  ],
};

const StartGame = (parent: string) => new Game({ ...config, parent });

export default StartGame;
