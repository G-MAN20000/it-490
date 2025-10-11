import Phaser from 'phaser';
import { Direction, DirectionUtil } from '../../util/DirectionUtil.ts';
import { IAbility } from '../abilities/AbstractAbility.ts';

export class Sherming extends Phaser.Physics.Matter.Sprite {
    private speed: number;
    direction: Direction;
    ability: IAbility | null;
    private shermingScale: number;
    private lastGroundY: number = 0;
    private fallDamageThreshold: number;
    private groundTouchCount: number = 0;
    private touchingGround: boolean = false;
    private fallStartY: number | null = null;
    private readonly debugText: Phaser.GameObjects.Text | null = null;

    private constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        shermingScale: number,
        speed: number = 1.5,
        startingDirection: Direction = Direction.RIGHT,
    ) {
        super(scene.matter.world, x, y, '');
        this.shermingScale = shermingScale;
        this.direction = startingDirection;
        this.speed = speed;
        this.ability = null;
        scene.add.existing(this);
        if (scene.matter.world.debugGraphic) {
            this.debugText = scene.add.text(0, 0, '', {
                fontSize: '14px',
                color: '#00FF00',
                backgroundColor: '#000000',
            });
            this.debugText.setDepth(10000);
        }
    }

    update() {
        const onGround = this.onGround();

        if (onGround && this.fallStartY !== null) {
            if (this.y - this.fallStartY > this.fallDamageThreshold) {
                // hurt
            }
            this.fallStartY = null;
            this.lastGroundY = this.y;
        } else if (this.fallStartY === null && this.getVelocity().y > 0.5) {
            this.fallStartY = this.lastGroundY;
        }

        if (this.debugText) {
            this.debugText.setText(`G: ${this.touchingGround.toString().toUpperCase()} \nD: ${Direction[this.direction]} \nF: ${this.getFallDistance().toFixed(0)}`);
            this.debugText.setPosition(this.x - this.debugText.displayWidth / 2, this.y - this.debugText.displayHeight - (this.height * this.shermingScale / 2) - 4);
        }

        if (this.ability !== null && this.ability.isRunning()) {
            this.ability.update();
            if (!this.ability.canMove()) {
                this.setVelocityX(0);
                return;
            }
        }

        this.setVelocityX(onGround ? this.speed * DirectionUtil.toVector(this.direction).x : this.speed * DirectionUtil.toVector(this.direction).x * 0.25);
        if (onGround) {
            this.play({ key: 'sherming_walk_right', timeScale: this.scene.time.timeScale }, true);
        }

        this.flipX = this.direction === Direction.LEFT;
    }

    public initBody() {
        const x = this.x;
        const y = this.y;

        const mainBody = this.scene.matter.bodies.rectangle(
            0, 0,
            this.width * this.shermingScale,
            this.height * this.shermingScale,
            { chamfer: { radius: 2 } },
        );

        const leftSensor = this.scene.matter.bodies.rectangle(
            -this.width * this.shermingScale / 2, 0, 5, this.height * this.shermingScale / 2,
            { isSensor: true, label: 'leftSensor' },
        );

        const rightSensor = this.scene.matter.bodies.rectangle(
            this.width * this.shermingScale / 2, 0, 5, this.height * this.shermingScale / 2,
            { isSensor: true, label: 'rightSensor' },
        );

        const bottomSensor = this.scene.matter.bodies.rectangle(
            0, this.height * this.shermingScale / 2, this.width * this.shermingScale * 0.8, 5,
            { isSensor: true, label: 'bottomSensor' },
        );

        const compoundBody = this.scene.matter.body.create({
            parts: [mainBody, leftSensor, rightSensor, bottomSensor],
            friction: 0.1,
            frictionAir: 0.05,
            frictionStatic: 0,
            restitution: 0,
            mass: 1,
        });

        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.setDepth(1000);
        this.setScale(this.shermingScale);
        this.setPosition(x, y);
        this.setOrigin(0.5, 0.5);
        this.touchingGround = true;
        this.fallDamageThreshold = this.height * this.shermingScale * 8;

        this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            this.handleCollision(event, true);
        });

        this.scene.matter.world.on('collisionend', (event: Phaser.Physics.Matter.Events.CollisionEndEvent) => {
            this.handleCollision(event, false);
        });
    }

    private handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent | Phaser.Physics.Matter.Events.CollisionEndEvent, collisionStart: boolean) {
        if (!this.body) return;
        for (const pair of event.pairs) {
            let part: MatterJS.BodyType;
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            let collidedBody = null;

            if (bodyA.parent === (this.body as MatterJS.BodyType).parent) {
                part = bodyA;
                collidedBody = bodyB;
            } else if (bodyB.parent === (this.body as MatterJS.BodyType).parent) {
                part = bodyB;
                collidedBody = bodyA;
            } else {
                continue;
            }

            if (part.label === 'leftSensor' && collisionStart) {
                this.direction = Direction.RIGHT;
            } else if (part.label === 'rightSensor' && collisionStart) {
                this.direction = Direction.LEFT;
            } else if (part.label === 'bottomSensor' && collidedBody.isStatic) {
                this.groundTouchCount = collisionStart ? ++this.groundTouchCount : Math.max(0, this.groundTouchCount - 1);
                this.touchingGround = this.groundTouchCount > 0;
            }
        }
    }

    public onGround(): boolean {
        return this.touchingGround;
    }

    public setAbility(ability: IAbility): void {
        this.ability = ability;
    }

    public setSpeed(value: number) {
        this.speed = value;
    }

    public setShermingScale(value: number) {
        this.shermingScale = value;
        this.initBody();
    }

    public getFallDistance(): number {
        return this.fallStartY !== null ? this.y - this.fallStartY : 0;
    }

    public static initDefaultAnimations(scene: Phaser.Scene) {
        const animationManager = scene.anims;

        if (!scene.textures.exists('walking_sherming_sheet')) {
            console.error('walking_sherming_sheet atlas not loaded!');
            return;
        }

        if (!scene.textures.exists('digging_sherming_sheet')) {
            console.error('digging_sherming_sheet atlas not loaded!');
            return;
        }

        if (!animationManager.exists('sherming_walk_right')) {
            animationManager.create({
                key: 'sherming_walk_right',
                frames: animationManager.generateFrameNames('walking_sherming_sheet', {
                    prefix: 'Walking_Sherming_Sheet ',
                    suffix: '.png',
                    start: 3,
                    end: 5,
                }),
                frameRate: 24,
                repeat: -1,
            });
        }

        if (!animationManager.exists('sherming_digging')) {
            animationManager.create({
                key: 'sherming_digging',
                frames: animationManager.generateFrameNames('digging_sherming_sheet', {
                    prefix: 'Digging_Sherming_Sheet ',
                    suffix: '.png',
                    start: 0,
                    end: 3,
                }),
                frameRate: 24,
                repeat: -1,
            });
        }
    }

    public static create(scene: Phaser.Scene, x: number, y: number, scale: number, textureKey: string | null, frameKey: string | null): Sherming {
        const sherming = new Sherming(scene, x, y, scale);
        if (textureKey !== null && frameKey !== null) sherming.setTexture(textureKey, frameKey);
        sherming.initBody();
        return sherming;
    }

    public static createWithDirection(scene: Phaser.Scene, x: number, y: number, scale: number, startingDirection: Direction, textureKey: string | null, frameKey: string | null): Sherming {
        const sherming = new Sherming(scene, x, y, scale, 100, startingDirection);
        if (textureKey !== null && frameKey !== null) sherming.setTexture(textureKey, frameKey);
        sherming.initBody();
        return sherming;
    }
}