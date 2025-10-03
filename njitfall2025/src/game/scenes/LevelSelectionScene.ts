import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';
import Phaser from 'phaser';

export class LevelSelectionScene extends Phaser.Scene {

    constructor() {
        super('LevelSelection');
    }

    create() {
        const mainMenuButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Main Menu', null, TextStyles.BUTTON_TEXT);

        mainMenuButton.backGround.on('pointerdown', () => {
            this.scene.start('MainMenu');
            console.log('Switched to main menu');
        });

        const levelOneButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2 + 41, 120, 40, 'Start Level 1', null, TextStyles.BUTTON_TEXT);

        levelOneButton.backGround.on('pointerdown', () => {
            this.scene.start('LevelOne');
            console.log('Switched to level One');
        });

        this.add.existing(mainMenuButton);
        this.add.existing(levelOneButton);
    }

}