import { AbilityContext, AbstractAbility } from './AbstractAbility.ts';
import { Sherming } from '../entities/Sherming.ts';
import Phaser from 'phaser';
import { Direction, DirectionUtil } from '../../util/DirectionUtil.ts';

export class DigAbility extends AbstractAbility {
    private readonly radius: number;
    private readonly digInterval: number;
    private readonly dirtParticleAmount: number;

    constructor(radius: number = 32, digInterval: number = 250, dirtParticleAmount: number = 100) {
        super();
        this.radius = radius;
        this.digInterval = digInterval;
        this.dirtParticleAmount = dirtParticleAmount;
    }

    public execute(scene: Phaser.Scene, sherming: Sherming, context: AbilityContext): void {
        if (this.isRunning()) return;

        this.isDoingAbility = true;
        sherming.play('sherming_digging', true);

        this.intervalTimer = scene.time.addEvent({
            delay: this.digInterval,
            loop: true,
            callback: () => {
                sherming.play('sherming_digging', true);
                const directionVector = DirectionUtil.toVector(Direction.DOWN);
                const digX = sherming.x + directionVector.x * this.radius;
                const digY = sherming.y + directionVector.y * this.radius;

                const tileWidth = context.layer.tilemap.tileWidth;
                const tileHeight = context.layer.tilemap.tileHeight;
                const tileX = Math.floor(digX / tileWidth);
                const tileY = Math.floor(digY / tileHeight);
                for (let dy = -this.radius / tileHeight; dy <= this.radius / tileHeight; dy++) {
                    for (let dx = -this.radius / tileWidth; dx <= this.radius / tileWidth; dx++) {
                        const tile = context.layer.tilemap.getTileAt(tileX + dx, tileY + dy);
                        if (tile != null && tile.properties != null && tile.properties.notDiggable) {
                            this.endDigging(sherming);
                            return;
                        }
                    }
                }

                this.dig(scene, context.renderTexture, digX, digY);
                this.clearMatterBodies(scene, context.bodies, digX, digY);

                if (!sherming.onGround() && sherming.getVelocity().y > 4) {
                    this.endDigging(sherming);
                    return;
                }

                for (let i = 0; i < this.dirtParticleAmount; i++) {
                    const particle = scene.add.image(digX, digY, 'box')
                        .setTint(0xC4A484)
                        .setScale(Phaser.Math.FloatBetween(0.01, 0.02))
                        .setAlpha(Phaser.Math.FloatBetween(0.25, 0.5));
                    scene.tweens.add({
                        targets: particle,
                        x: particle.x + Phaser.Math.Between(-this.radius, this.radius),
                        y: particle.y + Phaser.Math.Between(-this.radius, this.radius),
                        duration: Phaser.Math.Between(150, 300),
                        ease: 'Bounce.easeInOut',
                        onComplete: () => particle.destroy(),
                    });
                }
            },
        });
    }

    endDigging(sherming: Sherming): void {
        this.end();
        sherming.anims.stop();
        this.intervalTimer!.remove();
    }

    private dig(scene: Phaser.Scene, renderTexture: Phaser.GameObjects.RenderTexture, x: number, y: number): void {
        const eraser = scene.add.graphics();
        eraser.fillStyle(0xFFFFFF);
        eraser.fillCircle(0, 0, this.radius);
        renderTexture.erase(eraser, x, y);
        eraser.destroy();
    }

    private clearMatterBodies(scene: Phaser.Scene, bodies: MatterJS.BodyType[], digX: number, digY: number): void {
        const radiusSq = this.radius * this.radius;
        for (let i = bodies.length - 1; i >= 0; i--) {
            const body = bodies[i];
            const bodyX = body.position.x;
            const bodyY = body.position.y;
            const dx = bodyX - digX;
            const dy = bodyY - digY;
            if (dx * dx + dy * dy <= radiusSq) {
                scene.matter.world.remove(body);
                bodies.splice(i, 1);
            }
        }
    }

    canMove(): boolean {
        return false;
    }
}