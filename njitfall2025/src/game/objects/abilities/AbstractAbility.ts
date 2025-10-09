import { Sherming } from '../entities/Sherming.ts';

export enum Abilities {
    DIG = 'Dig',
    PARACHUTE = 'Parachute'
}

export interface IAbility {
    isDoingAbility: boolean;
    endTimer: Phaser.Time.TimerEvent | null;
    intervalTimer: Phaser.Time.TimerEvent | null;
    execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): boolean;
    end(): void;
    isRunning(): boolean;
}

export interface AbilityContext {
    tileMap: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;
}

export abstract class AbstractAbility implements IAbility {
    isDoingAbility: boolean = false;
    endTimer: Phaser.Time.TimerEvent | null = null;
    intervalTimer: Phaser.Time.TimerEvent | null = null;

    abstract execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): boolean;

    end(): void {
        if (this.endTimer) {
            this.endTimer.remove();
            this.endTimer = null;
        }
        if (this.intervalTimer) {
            this.intervalTimer.remove();
            this.intervalTimer = null;
        }
        this.isDoingAbility = false;
    }

    isRunning(): boolean {
        return this.isDoingAbility;
    }
}