import { MainMenuScene } from './scenes/MainMenuScene.ts';
import { AUTO, Game, Types } from 'phaser';
import { LevelSelectionScene } from './scenes/LevelSelectionScene.ts';
import { LevelOneScene } from './scenes/LevelOneScene.ts';
import { PausedOptionsScene } from './scenes/PausedOptionsScene.ts';
import { HUDScene } from './objects/ui/Hud.ts';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 2560,
    height: 1440,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
        },
    },
    render: {
        antialias: true,
        antialiasGL: true,
    },
    scene: [MainMenuScene, LevelSelectionScene, LevelOneScene, PausedOptionsScene, HUDScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
