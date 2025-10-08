import Phaser from 'phaser';
import { Direction, DirectionUtil } from '../../util/DirectionUtil.ts';
import { IAbilities } from '../abilities/AbstractAbility.ts';

export class Sherming extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private direction: Direction;
    private ability: IAbilities | null;

    private constructor(scene: Phaser.Scene, x: number, y: number, speed: number = 100, startingDirection: Direction = Direction.RIGHT) {
        super(scene, x, y, '');
        this.direction = startingDirection;
        this.speed = speed;
    }

    update() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (body == null) {
            return;
        }

        if (body.blocked.down || body.touching.down) {
            this.setVelocityX(this.speed * DirectionUtil.toVector(this.direction).x);
            if (!this.anims.isPlaying) this.play('sherming_walk_right', true);
        } else {
            this.anims.stop();
        }

        if (body.blocked.right || body.touching.right) {
            this.direction = Direction.LEFT;
            this.flipX = true;
        } else if (body.blocked.left || body.touching.left) {
            this.direction = Direction.RIGHT;
            this.flipX = false;
        }
    }

    public initBody() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (body == null) {
            return;
        }

        body.setSize(this.width, this.height, true);
        body.setAllowGravity(true);
        body.setFriction(1, 0);
        body.setOffset(0, 0);
        body.setBounce(0);

        this.setDepth(1000);
        this.setScale(2.0);
        this.setCollideWorldBounds(true);
    }

    public isOnGround(): boolean {
        const body = this.body as Phaser.Physics.Arcade.Body;
        return body.blocked.down || body.touching.down;
    }

    public runAbility(scene: Phaser.Scene, callback: () => void): void {
        if (this.ability != null) this.ability.run(this, scene, callback);
    }

    public setAbility(ability: IAbilities): void {
        this.ability = ability;
    }

    public setSpeed(value: number) {
        this.speed = value;
    }

    public static initDefaultAnimations(scene: Phaser.Scene) {
        const animationManager = scene.anims;
        if (!animationManager.exists('sherming_walk_right')) {
            animationManager.create({
                key: 'sherming_walk_right',
                frames: animationManager.generateFrameNames('shermie_sheet', {
                    prefix: 'BasicLR_Shermie_Sheet ',
                    suffix: '.png',
                    start: 3,
                    end: 5,
                }),
                frameRate: 24,
                repeat: -1,
            });
        }
    }

    public static create(scene: Phaser.Scene, x: number, y: number, textureKey: string | null, frameKey: string | null): Sherming {
        const sherming = new Sherming(scene, x, y, 150);
        if (textureKey != null && frameKey != null) sherming.setTexture(textureKey, frameKey);
        scene.physics.add.existing(sherming);
        sherming.initBody();
        return sherming;
    }

    public static createWithDirection(scene: Phaser.Scene, x: number, y: number, startingDirection: Direction, textureKey: string | null, frameKey: string | null): Sherming {
        const sherming = new Sherming(scene, x, y, 150, startingDirection);
        if (textureKey != null && frameKey != null) sherming.setTexture(textureKey, frameKey);
        scene.physics.add.existing(sherming);
        sherming.initBody();
        return sherming;
    }

}