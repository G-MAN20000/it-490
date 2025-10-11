import { Sherming } from '../entities/Sherming.ts';

export enum Abilities {
    DIG = 'Dig',
    PARACHUTE = 'Parachute'
}

export interface IAbility {
    isDoingAbility: boolean;

    execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): void;

    end(): void;

    canMove(): boolean;

    isRunning(): boolean;

    update(): void;
}

export interface AbilityContext {
    renderTexture: Phaser.GameObjects.RenderTexture;
    layer: Phaser.Tilemaps.TilemapLayer;
    bodies: MatterJS.BodyType[];
}

export abstract class AbstractAbility implements IAbility {
    isDoingAbility: boolean = false;
    intervalTimer: Phaser.Time.TimerEvent | null = null;

    public abstract execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): void;

    end(): void {
        this.isDoingAbility = false;
    }

    public canMove(): boolean {
        return true;
    }

    public update() {
    }

    public isRunning(): boolean {
        return this.isDoingAbility;
    }
}