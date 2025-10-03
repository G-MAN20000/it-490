import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';

export class PausedOptionsScene extends Phaser.Scene {

    private lastScene: string | undefined;

    constructor() {
        super('PausedOptions');
    }

    init(data: { lastScene?: string }) {
        this.lastScene = data.lastScene;
    }

    create() {
        const mainMenuButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Main Menu', null, TextStyles.BUTTON_TEXT);
        const resumeButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2 + 41, 120, 40, 'Resume', null, TextStyles.BUTTON_TEXT);

        mainMenuButton.backGround.on('pointerdown', () => {
            if (this.lastScene != null) this.scene.stop(this.lastScene);
            this.scene.start('MainMenu');
        }, this);

        resumeButton.backGround.on('pointerdown', () => {
            if (this.lastScene != null) {
                this.scene.stop();
                this.scene.resume(this.lastScene);
            }
        }, this);

        const keyboardInput = this.input.keyboard;
        if (keyboardInput != null && this.lastScene != null) {
            keyboardInput.on('keydown-ESC', () => {
                if (this.lastScene) {
                    this.scene.stop();
                    this.scene.resume(this.lastScene);
                }
            }, this);
        }
    }

}