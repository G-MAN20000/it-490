import Phaser from 'phaser';
import { TextStyles } from './TextStyles.ts';
import { Abilities } from '../abilities/AbstractAbility.ts';

interface HudConfig {
    time: number | null;
    score: number | null;
    remaining: number | null;
    needed: number | null;
}

export class HUDScene extends Phaser.Scene {

    public static readonly HUD_HEIGHT: number = 100;

    private scoreText!: Phaser.GameObjects.Text;
    private neededText!: Phaser.GameObjects.Text;
    private remainingText!: Phaser.GameObjects.Text;
    private levelTimeText!: Phaser.GameObjects.Text;
    public abilityIcons: Phaser.GameObjects.Image[] = [];

    private levelTime!: number;
    private remaining!: number;
    private needed!: number;
    private score!: number;

    constructor() {
        super('HUD');
    }

    init(data: HudConfig) {
        this.time.delayedCall(100, () => {
            if (data.time && this.levelTimeText != null) this.setTime(data.time);
            if (data.score != null && this.scoreText != null) this.setScore(data.score);
            if (data.remaining != null && this.remainingText != null) this.setRemaining(data.remaining);
            if (data.needed != null && this.neededText != null) this.setNeeded(data.needed);
        });
    }

    create() {
        const { width: w, height: h } = this.scale;

        this.add.rectangle(0, h - HUDScene.HUD_HEIGHT, w, HUDScene.HUD_HEIGHT, 0x222222, 0.9)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0xffffff);

        this.scoreText = this.add.text(20, h - HUDScene.HUD_HEIGHT + 15, 'Score: ', TextStyles.HUD_TEXT)
            .setScrollFactor(0);

        this.remainingText = this.add.text(20, this.scoreText.y + this.scoreText.displayHeight + 2, 'Shermings Left: ', TextStyles.HUD_TEXT)
            .setScrollFactor(0);

        this.neededText = this.add.text(20, this.remainingText.y + this.remainingText.displayHeight + 2, `Needed to Pass: `, TextStyles.HUD_TEXT)
            .setScrollFactor(0);

        this.levelTimeText = this.add.text(w - 180, this.remainingText.y, 'Time: ', TextStyles.HUD_TEXT)
            .setScrollFactor(0);

        const iconSize = 60;
        const abilities = Object.values(Abilities);

        console.log(abilities);

        for (let i = 0; i < abilities.length; i++) {
            const iconX = 300 + i * 70;
            const iconY = h - HUDScene.HUD_HEIGHT + 50;

            const icon = this.add.image(iconX, iconY, 'box')
                .setDisplaySize(iconSize, iconSize)
                .setTint(0xAAAAAA)
                .setScrollFactor(0)
                .setInteractive();

            icon.on('pointerdown', () => {
                this.abilityIcons.forEach(i => i.clearTint());
                icon.setTint(0xFFFF00);
            });

            this.abilityIcons.push(icon);
        }
    }

    update(_time: number, delta: number) {
        this.levelTime -= delta / 1000;
        if (this.levelTime < 0) this.levelTime = 0;

        const minutes = Math.floor(this.levelTime / 60);
        const seconds = Math.floor(this.levelTime % 60);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.levelTimeText.setText('Time: ' + formattedTime);
    }

    public setTime(value: number) {
        this.levelTime = value;
    }

    public setScore(value: number) {
        this.score = value;
        this.scoreText.setText('Score: ' + this.score);
    }

    public setRemaining(value: number) {
        this.remaining = value;
        this.remainingText.setText('Shermings Left: ' + this.remaining);
    }

    public setNeeded(value: number) {
        this.needed = value;
        this.neededText.setText('Needed to Pass: ' + this.needed);
    }
}