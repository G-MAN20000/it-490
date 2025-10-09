import { AbilityContext, AbstractAbility } from './AbstractAbility.ts';
import { Sherming } from '../entities/Sherming.ts';
import { DirectionUtil } from '../../util/DirectionUtil.ts';
import Phaser from 'phaser';

export class DigAbility extends AbstractAbility {
    private readonly radius: number;
    private readonly duration: number;
    private readonly digInterval: number;

    constructor(duration: number = 1000, radius: number = 1, digInterval: number = 150) {
        super();
        this.radius = radius;
        this.duration = duration;
        this.digInterval = digInterval;
    }

    public execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): boolean {
        if (this.isDoingAbility || !sherming.isOnGround()) return false;

        this.isDoingAbility = true;

        this.intervalTimer = scene.time.addEvent({
            delay: this.digInterval,
            callback: () => {
                if (sherming.isOnGround()) {
                    const directionVector = DirectionUtil.toVector(sherming.direction);
                    const digX = sherming.x + (directionVector.x * context.tileMap.tileWidth);
                    const digY = sherming.y + (directionVector.y * context.tileMap.tileHeight);
                    this.dig(digX, digY, context.tileMap, context.layer);
                }
            },
            loop: true
        });

        this.endTimer = scene.time.delayedCall(this.duration, () => {
            this.end();
        });

        return true;
    }

    private dig(x: number, y: number, tilemap: Phaser.Tilemaps.Tilemap, layer: Phaser.Tilemaps.TilemapLayer,): void {
        const tileX = Math.floor(x / tilemap.tileWidth);
        const tileY = Math.floor(y / tilemap.tileHeight);
        for (let dy = -this.radius; dy <= this.radius; dy++) {
            for (let dx = -this.radius; dx <= this.radius; dx++) {
                const tile = layer.getTileAt(tileX + dx, tileY + dy);
                if (tile != null) {
                    layer.removeTileAt(tileX + dx, tileY + dy);
                }
            }
        }
    }
}