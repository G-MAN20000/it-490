import { Sherming } from '../entities/Sherming.ts';
import { AbilityBase } from './AbstractAbility.ts';

export class DigAbility extends AbilityBase{

    run(sherming: Sherming, scene: Phaser.Scene, callback: () => void): boolean {
        if (this.isDoingAbility) return false;

        void scene;
        void callback();
        void sherming;

        return this.isDoingAbility = true;
    }

}