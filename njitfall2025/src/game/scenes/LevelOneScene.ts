import { Sherming } from '../objects/entities/Sherming.ts';
import { HUDScene } from '../objects/ui/Hud.ts';

export class LevelOneScene extends Phaser.Scene {

    private static readonly SPAWN_DELAY = 500;

    private shermingsGroup!: Phaser.Physics.Arcade.Group;
<<<<<<< HEAD
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private spawnTimer?: Phaser.Time.TimerEvent;
    private backgroundMusic?: Phaser.Sound.BaseSound;

=======
    private groundLayer!: Phaser.Tilemaps.TilemapLayer;
    private tilemap!: Phaser.Tilemaps.Tilemap;
>>>>>>> 6e26cfc9b7c109d788e04ac7acb1c083b74ad10b

    constructor() {
        super('LevelOne');
    }

    preload() {
        this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
<<<<<<< HEAD
        this.load.image('level1_background', new URL('../assets/level1.png', import.meta.url).href);
        this.load.atlas('shermie_sheet', new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href, new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href);
        this.load.audio('level1_music', new URL('../assets/music/Mainmenuv2.mp3', import.meta.url).href);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        const background = this.add.image(0, 0, 'level1_background').setOrigin(0, 0);
        background.setDisplaySize(W, H);
        background.setDepth(-10);

        //start background music
        this.backgroundMusic = this.sound.add('level1_music', { loop: true, volume: 0.5});
        this.backgroundMusic.play();
    
        // Keep the world == camera so nothing “walks off-camera”
        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);
        this.cameras.main.setRoundPixels(true); // prevents subpixel flicker

        // Walls / platforms
        this.walls = this.physics.add.staticGroup();

        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 450;
        const defaultThickness = Math.max(H * 0.04, 16);

        const createStaticRect = (centerX: number, centerY: number, width: number, height: number) => {
            const rect = this.walls.create(centerX, centerY, 'box');
            rect.setDisplaySize(width, height);
            rect.refreshBody();
            rect.setVisible(false);
            rect.setActive(true);
            return rect;
        };

        const createPlatform = (startPx: number, endPx: number, surfaceYPx: number, thicknessPx = defaultThickness) => {
            if (endPx <= startPx) return;
            const width = ((endPx - startPx) / BASE_WIDTH) * W;
            if (width <= 0) return;
            const centerX = ((startPx + endPx) * 0.5 / BASE_WIDTH) * W;
            const thickness = Math.max(thicknessPx, Math.max(H * 0.02, 12));
            const topY = (surfaceYPx / BASE_HEIGHT) * H;
            const centerY = topY + thickness * 0.5;
            createStaticRect(centerX, centerY, width, thickness);
        };

        const platformSegments = [
            { start: 1, end: 39, surfaceY: 217 },
            { start: 54, end: 79, surfaceY: 217 },
            { start: 107, end: 119, surfaceY: 411 },
            { start: 120, end: 159, surfaceY: 359 },
            { start: 160, end: 199, surfaceY: 89, thickness: defaultThickness * 0.8 },
            { start: 240, end: 266, surfaceY: 359 },
            { start: 267, end: 279, surfaceY: 217 },
            { start: 280, end: 319, surfaceY: 411 },
            { start: 320, end: 372, surfaceY: 359 },
            { start: 400, end: 426, surfaceY: 411 },
            { start: 427, end: 479, surfaceY: 217 },
            { start: 480, end: 532, surfaceY: 411 },
            { start: 533, end: 585, surfaceY: 217 },
            { start: 600, end: 639, surfaceY: 411 },
            { start: 640, end: 692, surfaceY: 217 },
            { start: 693, end: 745, surfaceY: 359 },
            { start: 746, end: 759, surfaceY: 269 },
            { start: 760, end: 799, surfaceY: 217 },
        ];

        for (const segment of platformSegments) {
            createPlatform(segment.start, segment.end, segment.surfaceY, segment.thickness ?? defaultThickness);
        }

        // Keep the left/right walls so Shermings can't leave the scene
        const wallWidth = Math.max(W * 0.02, 24);
        createStaticRect(wallWidth * 0.5, H * 0.5, wallWidth, H);
        createStaticRect(W - wallWidth * 0.5, H * 0.5, wallWidth, H);

        // Global gravity
=======
        this.load.atlas(
            'shermie_sheet',
            new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href,
            new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href,
        );
    }

    create() {
        const { width: w, height: h } = this.scale;

        this.cameras.main.backgroundColor.setTo(128, 128, 128, 128);
        this.physics.world.setBounds(0, 0, w, h);
        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.setRoundPixels(true);
>>>>>>> 6e26cfc9b7c109d788e04ac7acb1c083b74ad10b
        this.physics.world.gravity.y = 900;
        this.createTilemap(w, h);

        this.shermingsGroup = this.physics.add.group({
            classType: Sherming,
            runChildUpdate: true,
            maxSize: 10,
        });

        this.physics.add.collider(this.shermingsGroup, this.groundLayer);

        Sherming.initDefaultAnimations(this);

        const keyboard = this.input.keyboard;
        if (keyboard != null) {
            keyboard.on('keydown-ESC', () => {
                this.scene.pause('LevelOne');
                this.physics.world.pause();

<<<<<<< HEAD
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.spawnTimer?.remove(false);
            //STOP music when scene shuts down 
            if  (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
        });
=======
                const hud = this.scene.get('HUD') as HUDScene;
                hud.levelTimerPaused = true;
                hud.abilityIcons.forEach((icon: Phaser.GameObjects.Image) => icon.disableInteractive());
>>>>>>> 6e26cfc9b7c109d788e04ac7acb1c083b74ad10b

                this.scene.launch('PausedOptions', { lastScene: 'LevelOne' });
            });
        }

        for (let i = 0; i < 10; i++) {
            this.time.delayedCall(LevelOneScene.SPAWN_DELAY * i, () => {
                this.spawnSherming(150, 180);
            });
        }

        this.scene.launch('HUD', { score: 0, remaining: 10, needed: 4 });
    }

    private createTilemap(w: number, h: number, tileSize: number = 16) {
        const mapWidth = Math.ceil(w / tileSize);
        const mapHeight = Math.ceil(h / tileSize);

        this.tilemap = this.make.tilemap({
            tileWidth: tileSize,
            tileHeight: tileSize,
            width: mapWidth,
            height: mapHeight,
        });

        const tiles = this.tilemap.addTilesetImage('box');
        if (tiles == null) {
            return;
        }

        this.groundLayer = this.tilemap.createBlankLayer('Ground', tiles)!;

        // floor
        const groundStartRow = mapHeight - 5;
        for (let y = groundStartRow; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                this.groundLayer.putTileAt(0, x, y);
            }
        }

        // walls
        for (let y = 0; y < mapHeight; y++) {
            this.groundLayer.putTileAt(0, 0, y);
            this.groundLayer.putTileAt(0, mapWidth - 1, y);
        }

        this.groundLayer.setCollisionByExclusion([-1]);
    }
<<<<<<< HEAD
=======

    private spawnSherming(x: number, y: number) {
        this.shermingsGroup.add(Sherming.create(this, x, y, 'shermie_sheet', 'BasicLR_Shermie_Sheet 9.png'), true);
    }

    // update() {
    // this.shermingsGroup.children.iterate(child => {
    //     const sherming = child as Sherming;
    //     if (sherming.active && sherming.visible) {
    //         sherming.update();
    //         sherming.x = Phaser.Math.Clamp(sherming.x, sherming.displayWidth * 0.5, this.scale.width - sherming.displayWidth * 0.5);
    //     }
    //     return true;
    // });
    // }

>>>>>>> 6e26cfc9b7c109d788e04ac7acb1c083b74ad10b
}