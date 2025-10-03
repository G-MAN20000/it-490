import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';
import Phaser from 'phaser';

export class LevelSelectionScene extends Phaser.Scene {

    private backgroundMusic?: Phaser.Sound.BaseSound;

    preload() {
        this.load.audio('level_selection_music', new URL('../assets/music/Mainmenuv2.mp3', import.meta.url).href);
        this.load.audio('button_hover_sound', new URL('../assets/sounds/selectingsound.mp3', import.meta.url).href);
        this.load.audio('button_click_sound', new URL('../assets/sounds/Pressingbutton.mp3', import.meta.url).href);
    }

    constructor() {
        super('LevelSelection');
    }

    create() {
        this.backgroundMusic = this.sound.add('level_selection_music', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

        const stopMusic = () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                this.backgroundMusic.destroy();
                this.backgroundMusic = undefined;
            }
        };

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, stopMusic);
        this.events.once(Phaser.Scenes.Events.DESTROY, stopMusic);

        const playHoverSound = () => this.sound.play('button_hover_sound');
        const playClickSound = () => this.sound.play('button_click_sound');

        const mainMenuButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Main Menu', null, TextStyles.BUTTON_TEXT);

        mainMenuButton.backGround.on('pointerover', playHoverSound);
        mainMenuButton.backGround.on('pointerdown', () => {
            playClickSound();
            stopMusic();
            this.scene.start('MainMenu');
            console.log('Switched to main menu');
        });

        const levelOneButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2 + 41, 120, 40, 'Start Level 1', null, TextStyles.BUTTON_TEXT);

        levelOneButton.backGround.on('pointerover', playHoverSound);
        levelOneButton.backGround.on('pointerdown', () => {
            playClickSound();
            stopMusic();
            this.scene.start('LevelOne');
            console.log('Switched to level One');
        });

        this.add.existing(mainMenuButton);
        this.add.existing(levelOneButton);
    }

}