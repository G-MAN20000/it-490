import { MainMenuScene } from './scenes/MainMenuScene.ts';
import { AUTO, Game, Types } from 'phaser';
import { LevelSelectionScene } from './scenes/LevelSelectionScene.ts';
import { LevelOneScene } from './scenes/LevelOneScene.ts';
import { PausedOptionsScene } from './scenes/PausedOptionsScene.ts';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [MainMenuScene, LevelSelectionScene, LevelOneScene, PausedOptionsScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
