import { Shermings } from '../objects/entities/Shermings.ts';

export class LevelOneScene extends Phaser.Scene {
    private shermingsGroup!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private spawnTimer?: Phaser.Time.TimerEvent;
    private backgroundMusic?: Phaser.Sound.BaseSound;


    constructor() {
        super('LevelOne');
    }

    preload() {
        if (!this.textures.exists('box')) {
            this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
        }
        if (!this.textures.exists('level1_background')) {
            this.load.image('level1_background', new URL('../assets/level1.png', import.meta.url).href);
        }
        this.load.atlas('shermie_sheet', new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href, new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href);
        this.load.audio('level1_music', new URL('../assets/music/Mainmenuv2.mp3', import.meta.url).href);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        const background = this.add.image(0, 0, 'level1_background').setOrigin(0, 0);
        background.setDisplaySize(W, H);
        background.setDepth(-10);
        background.setScrollFactor(0);

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
            rect.setAlpha(0);
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
        this.physics.world.gravity.y = 900;

        // Pool (no auto-recycling)
        this.shermingsGroup = this.physics.add.group({
            classType: Shermings,
            maxSize: 10,
            runChildUpdate: true
        });

        // Spawn one every 3 seconds until there are 10
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                const activeCount = this.shermingsGroup.countActive(true);
                if (activeCount >= 10) {
                    this.spawnTimer?.remove(false);
                    return;
                }

                const marginX = 50;
                const x = Phaser.Math.Between(marginX, W - marginX);
                const y = Phaser.Math.Between(60, 100); // near top so gravity drops them

                this.spawnShermingExplicit(x, y);
            }
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.spawnTimer?.remove(false);
            //STOP music when scene shuts down 
            if  (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
        });

        if (!this.anims.exists('sherming_walk_right')) {
            this.anims.create({
                key: 'sherming_walk_right',
                frames: this.anims.generateFrameNames('shermie_sheet', {
                    prefix: 'BasicLR_Shermie_Sheet ',
                    suffix: '.png',
                    start: 3,
                    end: 5 
                }),
                frameRate: 24,
                repeat: -1
            });
        }

        const keyboardInput = this.input.keyboard;
        if (keyboardInput != null) {
            keyboardInput.on('keydown-ESC', () => {
                this.scene.pause();
                this.scene.launch('PausedOptions', { lastScene: this.scene.key });
            }, this);
        }
    }

    update() {
        // Not strictly needed thanks to runChildUpdate:true,
        // but keep for custom per-frame logic later.
        this.shermingsGroup.children.iterate(child => {
            const s = child as Shermings;
            if (s && s.active && s.visible) {
                s.update();

                // Clamp X inside the camera so it never leaves view
                const minX = s.displayWidth * 0.5;
                const maxX = this.scale.width - s.displayWidth * 0.5;
                if (s.x < minX) s.x = minX;
                if (s.x > maxX) s.x = maxX;
            }
            return null;
        });
    }

    /**
     * Create a NEW Shermings (no group.get reuse), add it, wire physics, and keep it in front.
     */
    private spawnShermingExplicit(x: number, y: number) {
        if (this.shermingsGroup.countActive(true) >= 10) return;

        const s = new Shermings(this, x, y, 150);
        s.setTexture('shermie_sheet', 'BasicLR_Shermie_Sheet 9.png'); // ensure correct texture even if classType changes later
        s.setScale(2.0);
        s.syncBodyToDisplay(); // keep physics body in sync with scaled sprite
        s.setDepth(1000);          // render above walls

        // Make sure physics body exists & matches the scaled sprite
        const body = s.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setAllowGravity(true);
            // Optionally tighten the body to the visible sprite bounds:
            body.setSize(s.width, s.height, true);
            body.setOffset(0, 0);
        }

        // Add to group AFTER configuring to avoid any transient active/visible flips
        this.shermingsGroup.add(s, true); // add & makeActive

        // Collide with walls
        this.physics.add.collider(s, this.walls);
    }
}