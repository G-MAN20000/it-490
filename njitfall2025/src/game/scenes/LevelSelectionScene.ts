import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';
import Phaser from 'phaser';

export class LevelSelectionScene extends Phaser.Scene {

    private backgroundMusic?: Phaser.Sound.BaseSound;
    private hoverSound?: Phaser.Sound.BaseSound;
    private clickSound?: Phaser.Sound.BaseSound;
    private pendingUnlockHandler?: () => void;

    constructor() {
        super('LevelSelection');
    }

    preload() {
        this.load.audio('level_selection_music', new URL('../assets/music/Firstlevel.mp3', import.meta.url).href);
        this.load.audio('button_hover', new URL('../assets/sounds/selectingsound.mp3', import.meta.url).href);
        this.load.audio('button_click', new URL('../assets/sounds/Pressingbutton.mp3', import.meta.url).href);
    }

    create() {
        this.backgroundMusic = this.sound.add('level_selection_music', { loop: true, volume: 0.5 });

        if (this.sound.locked) {
            this.pendingUnlockHandler = () => {
                this.pendingUnlockHandler = undefined;
                if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
                    this.backgroundMusic.play();
                }
            };
            this.sound.once(Phaser.Sound.Events.UNLOCKED, this.pendingUnlockHandler);
        } else {
            this.backgroundMusic.play();
        }

        this.hoverSound = this.sound.add('button_hover');
        this.clickSound = this.sound.add('button_click');

        const mainMenuButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Main Menu', null, TextStyles.BUTTON_TEXT);

        this.registerButtonAudio(mainMenuButton, () => {
            this.scene.start('MainMenu');
            console.log('Switched to main menu');
        });

        const levelOneButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2 + 41, 120, 40, 'Start Level 1', null, TextStyles.BUTTON_TEXT);

        this.registerButtonAudio(levelOneButton, () => {
            this.scene.start('LevelOne');
            console.log('Switched to level One');
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupAudio());
        this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupAudio());

        this.add.existing(mainMenuButton);
        this.add.existing(levelOneButton);
    }

    private registerButtonAudio(button: TexturedButton, onClick: () => void) {
        button.backGround.on('pointerover', () => this.playHoverSound());
        button.backGround.on('pointerdown', () => {
            this.playClickSound();
            onClick();
        });
    }

    private playHoverSound() {
        if (!this.hoverSound) {
            return;
        }

        this.hoverSound.stop();
        this.hoverSound.play({ seek: 0 });
    }

    private playClickSound() {
        if (!this.clickSound) {
            return;
        }

        this.clickSound.stop();
        this.clickSound.play({ seek: 0 });
    }

    private cleanupAudio() {
        if (this.pendingUnlockHandler) {
            this.sound.off(Phaser.Sound.Events.UNLOCKED, this.pendingUnlockHandler);
            this.pendingUnlockHandler = undefined;
        }

        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
            this.backgroundMusic = undefined;
        }

        if (this.hoverSound) {
            this.hoverSound.stop();
            this.hoverSound.destroy();
            this.hoverSound = undefined;
        }

        if (this.clickSound) {
            this.clickSound.stop();
            this.clickSound.destroy();
            this.clickSound = undefined;
        }
    }

}
