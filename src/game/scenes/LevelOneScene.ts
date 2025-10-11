import { Sherming } from '../objects/entities/Sherming.ts';
import { HUDScene } from '../objects/ui/Hud.ts';
import { DigAbility } from '../objects/abilities/DigAbility.ts';
import { playBackgroundMusic } from '../util/audio.ts';

export class LevelOneScene extends Phaser.Scene {
    private static readonly SHERMIE_SPAWN_COUNT = 6;
    private static readonly SHERMIE_SPAWN_DELAY = 500;
    private static readonly START_POINT = new Phaser.Math.Vector2(0, 0);

    private renderTexture: Phaser.GameObjects.RenderTexture | null;
    private backGroundLayer: Phaser.Tilemaps.TilemapLayer | null;
    private physicalLayer: Phaser.Tilemaps.TilemapLayer | null;
    private shermingsGroup: Phaser.GameObjects.Group;
    private bodies: MatterJS.BodyType[] = [];
    private saved: number = 0;
    private hud: HUDScene;

    constructor() {
        super('LevelOne');
    }

    preload() {
        this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
        this.load.tilemapTiledJSON('map', new URL('../assets/maps/levelone/map.tmj', import.meta.url).href);
        this.load.image('tiles', new URL('../assets/maps/levelone/tilesets/tiles.png', import.meta.url).href);
        this.load.atlas(
            'walking_sherming_sheet',
            new URL('../assets/atlas/Walking_Sherming_Sheet.png', import.meta.url).href,
            new URL('../assets/atlas/Walking_Sherming_Sheet.json', import.meta.url).href,
        );
        this.load.atlas(
            'digging_sherming_sheet',
            new URL('../assets/atlas/Digging_Sherming_Sheet.png', import.meta.url).href,
            new URL('../assets/atlas/Digging_Sherming_Sheet.json', import.meta.url).href,
        );
        this.load.audio('level_one_music', new URL('../assets/music/Firstlevel.mp3', import.meta.url).href);
    }

    create() {
        const { width: w, height: h } = this.scale;

        this.shermingsGroup = this.add.group({
            classType: Sherming,
            runChildUpdate: true,
            maxSize: LevelOneScene.SHERMIE_SPAWN_COUNT,
        });

        this.createTilemap();

        if (this.physicalLayer == null || this.backGroundLayer == null) {
            console.error('Missing physical or background layer!!');
            return;
        }

        const mapWidth = Math.max(
            this.physicalLayer.tilemap.widthInPixels,
            this.backGroundLayer.tilemap.widthInPixels,
        );

        const mapHeight = Math.max(
            this.physicalLayer.tilemap.heightInPixels,
            this.backGroundLayer.tilemap.heightInPixels,
        );

        this.cameras.main.setViewport(0, 0, w, h - HUDScene.HUD_HEIGHT);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.setBackgroundColor(0x00000000);
        this.cameras.main.startFollow(this.input.activePointer, false, .085, .085, 0, 0);
        this.matter.world.setBounds(0, 0, mapWidth, mapHeight);

        this.scene.launch('HUD', { time: 120, score: 0, remaining: LevelOneScene.SHERMIE_SPAWN_COUNT, needed: 4 });
        this.hud = this.scene.get('HUD') as HUDScene;
        this.time.delayedCall(500, () => this.updateHud());

        Sherming.initDefaultAnimations(this);
        const shermieTextureKey = 'walking_sherming_sheet';
        const shermieDefaultFrame = 'Walking_Sherming_Sheet 9.png';
        const shermieFrame = this.textures.getFrame(shermieTextureKey, shermieDefaultFrame);
        const shermingScale = this.physicalLayer.tilemap.tileWidth / shermieFrame.width;

        for (let i = 0; i < LevelOneScene.SHERMIE_SPAWN_COUNT; i++) {
            this.time.delayedCall(LevelOneScene.SHERMIE_SPAWN_DELAY * i, () => {
                this.spawnSherming(LevelOneScene.START_POINT.x, LevelOneScene.START_POINT.y, shermingScale, shermieTextureKey, shermieDefaultFrame);
            });
        }

        const keyboard = this.input.keyboard;
        if (keyboard != null) {
            keyboard.on('keydown-ESC', () => {
                this.matter.world.pause();
                this.scene.pause('HUD');
                this.scene.pause(this.scene.key);
                this.cameras.main.stopFollow();
                this.scene.launch('PausedOptions', {
                    stopCallback: () => {
                        this.saved = 0;
                        this.scene.stop(this.scene.key);
                        this.scene.stop('HUD');
                    },
                    resumeCallback: () => {
                        this.scene.resume(this.scene.key);
                        this.scene.resume('HUD');
                        this.matter.world.resume();
                        this.cameras.main.startFollow(this.input.activePointer, false, .085, .085, 0, 0);
                    },
                });
            });
        }

        void this.setTimeScale;
        playBackgroundMusic(this, 'level_one_music', { loop: true, volume: 0.5 });
    }

    private createTilemap() {
        const map = this.make.tilemap({ key: 'map' });

        if (map) {
            const tileset = map.addTilesetImage('Terrain', 'tiles');
            if (tileset) {
                this.backGroundLayer = map.createLayer('Background', tileset);
                this.physicalLayer = map.createLayer('Physical', tileset);
                if (this.physicalLayer != null) {
                    const width = this.physicalLayer.tilemap.widthInPixels;
                    const height = this.physicalLayer.tilemap.heightInPixels;
                    const tileWidth = this.physicalLayer.tilemap.tileWidth;
                    const tileHeight = this.physicalLayer.tilemap.tileHeight;

                    this.renderTexture = this.add.renderTexture(0, 0, width, height);
                    this.renderTexture.draw(this.physicalLayer, 0, 0);
                    this.renderTexture.setOrigin(0, 0);
                    this.physicalLayer.setVisible(false);

                    this.physicalLayer.forEachTile((tile) => {
                        if (tile.index != -1) {
                            const x = tile.pixelX + tileWidth / 2;
                            const y = tile.pixelY + tileHeight / 2;
                            const body = this.matter.add.rectangle(x, y, tileWidth, tileHeight, {
                                isStatic: true,
                                label: `tile_${tile.x}_${tile.y}`,
                            });
                            this.bodies.push(body);
                        }
                    });
                }
            }
        }

        const startObjectLayer = map.getObjectLayer('Start');
        const endObjectLayer = map.getObjectLayer('End');

        if (startObjectLayer && endObjectLayer) {
            const startObj = startObjectLayer.objects[0];
            if (startObj != null) {
                const x = (startObj.x ?? 0) + (startObj.width ?? 0) / 2;
                const y = (startObj.y ?? 0) + (startObj.height ?? 0) / 2;
                LevelOneScene.START_POINT.x = x;
                LevelOneScene.START_POINT.y = y;
                this.add.rectangle(x, y, startObj.width ?? 0, startObj.height ?? 0, 0x00FF00, 0.25).setDepth(10000);
            }

            const endObj = endObjectLayer.objects[0];
            if (endObj != null) {
                const x = (endObj.x ?? 0) + (endObj.width ?? 0) / 2;
                const y = (endObj.y ?? 0) + (endObj.height ?? 0) / 2;

                const endGoal = this.matter.add.rectangle(x, y, endObj.width ?? 0, endObj.height ?? 0, {
                    isStatic: true,
                    isSensor: true,
                    label: 'end',
                });

                this.add.rectangle(x, y, endObj.width ?? 0, endObj.height ?? 0, 0xFF0000, 0.25).setDepth(10000);
                this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
                    const pairs = event.pairs;
                    for (let i = 0; i < pairs.length; i++) {
                        const collisionPair = pairs[i];
                        if (collisionPair.bodyA === endGoal || collisionPair.bodyB === endGoal) {
                            const otherBody = collisionPair.bodyA === endGoal ? collisionPair.bodyB : collisionPair.bodyA;
                            const sherming = otherBody.gameObject as Sherming;
                            if (sherming) {
                                this.handleGoalOverlap(sherming);
                            }
                        }
                    }
                });
            }
        } else {
            console.error('Start or End object layer not found in level!');
        }

        return map;
    }

    private handleGoalOverlap(sherming: Sherming): void {
        if (!sherming.active || !sherming.visible) return;

        sherming.setActive(false);
        sherming.setVisible(false);

        if (sherming.body) {
            this.matter.world.remove(sherming.body);
        }

        this.shermingsGroup.remove(sherming, true);
        sherming.destroy();

        ++this.saved;
        this.updateHud();

        if (this.saved > this.hud.needed) {
            console.log('Level Complete!');
        }
    }

    private updateHud() {
        this.hud.setRemaining(LevelOneScene.SHERMIE_SPAWN_COUNT - this.saved);
        this.hud.setScore(Math.floor((this.saved / LevelOneScene.SHERMIE_SPAWN_COUNT) * 100));
        this.hud.setNeeded(Phaser.Math.Clamp(this.hud.needed - this.saved, 0, LevelOneScene.SHERMIE_SPAWN_COUNT));
    }

    private spawnSherming(x: number, y: number, scale: number, textureKey: string | null, frameKey: string | null) {
        const sherming = Sherming.create(this, x, y, scale, textureKey, frameKey);
        this.shermingsGroup.add(sherming, true);
        sherming.setInteractive();
        sherming.setAbility(new DigAbility());
        sherming.on('pointerdown', () => {
            const ability = sherming.ability;
            if (ability != null && this.renderTexture != null && this.physicalLayer != null) {
                ability.execute(this, sherming, {
                    renderTexture: this.renderTexture,
                    layer: this.physicalLayer,
                    bodies: this.bodies,
                });
            }
        });
    }

    private setTimeScale(timeScale: number): void {
        this.time.timeScale = timeScale;
        this.matter.world.getDelta = () => Math.round(1000 / 60) * timeScale;
        this.matter.world.engine.timing.timeScale = timeScale;
    }

}