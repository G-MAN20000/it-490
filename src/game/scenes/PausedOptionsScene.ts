import { TexturedButton } from '../objects/ui/TexturedButton.ts';
import { TextStyles } from '../objects/ui/TextStyles.ts';

export class PausedOptionsScene extends Phaser.Scene {

    private resumeCallback: (() => void) | undefined;
    private stopCallback: (() => void) | undefined;

    constructor() {
        super('PausedOptions');
    }

    init(data: { stopCallback: (() => void) | null, resumeCallback: (() => void) | null }) {
        if (data.resumeCallback != null) this.resumeCallback = data.resumeCallback;
        if (data.stopCallback != null) this.stopCallback = data.stopCallback;
    }

    create() {
        const mainMenuButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2, 120, 40, 'Main Menu', null, TextStyles.BUTTON_TEXT);
        const resumeButton = new TexturedButton(this, this.scale.width / 2, this.scale.height / 2 + 41, 120, 40, 'Resume', null, TextStyles.BUTTON_TEXT);

        mainMenuButton.backGround.on('pointerdown', () => {
            if (this.stopCallback != null) this.stopCallback();
            this.scene.start('MainMenu');
        }, this);

        resumeButton.backGround.on('pointerdown', () => {
            this.resume();
        }, this);

        const keyboardInput = this.input.keyboard;
        if (keyboardInput != null) {
            keyboardInput.on('keydown-ESC', () => {
                this.resume();
            }, this);
        }
    }

    private resume() {
        this.scene.stop();
        if (this.resumeCallback != null) {
            this.resumeCallback();
        }
    }

}