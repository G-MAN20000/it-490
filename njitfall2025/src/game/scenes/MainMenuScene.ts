import { Scene } from 'phaser';
import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';
export class MainMenuScene extends Scene {

    constructor() {
        super('MainMenu');
    }

    preload() {
    }
    
    create() {
        const playButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Play', null, TextStyles.BUTTON_TEXT);
        
        playButton.backGround.on('pointerdown', () => {
            this.scene.switch('LevelSelection')
            console.log('Switched to level selection');
        });

        this.add.existing(playButton);
    }
  
}