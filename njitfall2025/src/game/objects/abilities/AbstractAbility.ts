import { Sherming } from '../entities/Sherming.ts';

export interface IAbilities {
    isDoingAbility: boolean;
    abilityTimer: Phaser.Time.TimerEvent;
    run(sherming: Sherming, scene: Phaser.Scene, callback: () => void): boolean;
}

export abstract class AbilityBase implements IAbilities {
    isDoingAbility: boolean = false;
    abilityTimer!: Phaser.Time.TimerEvent;

    abstract run(sherming: Sherming, scene: Phaser.Scene, callback: () => void): boolean;

    end(): void {
        if (this.abilityTimer) this.abilityTimer.remove();
        this.isDoingAbility = false;
    }
}