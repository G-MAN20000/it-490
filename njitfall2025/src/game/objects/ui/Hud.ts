import Phaser from 'phaser';
import { TextStyles } from './TextStyles.ts';

interface HudConfig {
    score: number | null;
    remaining: number | null;
    needed: number | null;
}

export class HUDScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private neededText!: Phaser.GameObjects.Text;
    private remainingText!: Phaser.GameObjects.Text;

    public abilityIcons: Phaser.GameObjects.Image[] = [];
    public levelTimerPaused: boolean = false;
    private neededShermings: number = 4;
    private levelTimer: number = 120;

    constructor() {
        super('HUD');
    }

    init(data: HudConfig) {
        if (data.score != null && this.scoreText != null) this.setScore(data.score);
        if (data.remaining != null && this.remainingText != null) this.setRemaining(data.remaining);
        if (data.needed != null && this.neededText != null) this.setNeeded(data.needed);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Bottom Bar
        const bar = this.add.rectangle(0, H - 100, W, 100, 0x222222, 0.9)
            .setOrigin(0)
            .setStrokeStyle(2, 0xffffff);
        bar.setScrollFactor(0);

        // Text Elements
        this.scoreText = this.add.text(20, H - 85, 'Score: 0', TextStyles.HUD_TEXT).setScrollFactor(0);
        this.remainingText = this.add.text(20, H - 55, 'Shermings Left: 10', TextStyles.HUD_TEXT).setScrollFactor(0);
        this.neededText = this.add.text(20, H - 30, `Needed to Pass: ${this.neededShermings}`, TextStyles.HUD_TEXT).setScrollFactor(0);
        this.timerText = this.add.text(W - 180, H - 70, 'Time: 2:00', TextStyles.HUD_TEXT).setScrollFactor(0);

        // Ability Icons 
        const abilityNames = ['Block', 'Dig', 'Climb', 'Build'];
        const iconSize = 60; // size of each icon
        for (let i = 0; i < abilityNames.length; i++) {
            const iconX = 300 + i * 70;
            const iconY = H - 50;

            const icon = this.add.image(iconX, iconY, 'box')
                .setDisplaySize(iconSize, iconSize)
                .setTint(0xaaaaaa)
                .setInteractive()
                .setScrollFactor(0);

            icon.on('pointerdown', () => {
                this.abilityIcons.forEach(i => i.clearTint());
                icon.setTint(0xFFFF00);
            });

            this.abilityIcons.push(icon);
        }

    }

    update(_time: number, delta: number) {
        if (this.levelTimerPaused) return;

        this.levelTimer -= delta / 1000;
        if (this.levelTimer < 0) this.levelTimer = 0;

        const minutes = Math.floor(this.levelTimer / 60);
        const seconds = Math.floor(this.levelTimer % 60);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText('Time: ' + formattedTime);
    }

    public setScore(value: number) {
        this.scoreText.setText('Score: ' + value);
    }

    public setRemaining(value: number) {
        this.remainingText.setText('Shermings Left: ' + value);
    }

    public setNeeded(value: number) {
        this.neededShermings = value;
        this.neededText.setText('Needed to Pass: ' + value);
    }
}