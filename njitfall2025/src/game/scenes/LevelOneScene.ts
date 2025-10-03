import { Shermings } from '../objects/entities/Shermings.ts';

export class LevelOneScene extends Phaser.Scene {
    private shermingsGroup!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private spawnTimer?: Phaser.Time.TimerEvent;


    constructor() {
        super('LevelOne');
    }

    preload() {
        this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
        this.load.image('first_level_bg', new URL('../assets/first_level.png', import.meta.url).href);
        this.load.atlas('shermie_sheet', new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href, new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href);
        this.load.audio('level1_music', new URL('../assets/music/Mainmenuv2.mp3', import.meta.url).href);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.image(W / 2, H / 2, 'first_level_bg').setDisplaySize(W, H).setDepth(-50);

        this.cameras.main.backgroundColor.setTo(128, 128, 128, 128)
        
        //start background music
        this.backgroundMusic = this.sound.add('level1_music', { loop: true, volume: 0.5});
        this.backgroundMusic.play();
    
        // Keep the world == camera so nothing “walks off-camera”
        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);
        this.cameras.main.setRoundPixels(true); // prevents subpixel flicker

        // Walls / platforms shaped after the level art
        this.walls = this.physics.add.staticGroup();

        const createPlatform = (x: number, y: number, width: number, height: number) => {
            const platform = this.walls.get(x, y, 'box') as Phaser.Physics.Arcade.Image;
            platform.setActive(true);
            platform.setVisible(false);
            platform.setDisplaySize(width, height);
            platform.refreshBody();
            return platform;
        };

        // Top-left ground near the barn (no collider for the barn itself)
        createPlatform(260, 250, 520, 60);

        // Right-hand ledge exiting the upper cavern
        createPlatform(760, 320, 280, 50);

        // Central mid-level walkway
        createPlatform(520, 430, 780, 55);

        // Support lip that keeps Shermies from falling into the void below the mid level
        createPlatform(900, 505, 180, 50);

        // Lower ground path leading to the doorway
        createPlatform(520, 640, 860, 70);

        // Small landing immediately in front of the door for reliable spawning
        createPlatform(790, 600, 200, 40);

        // Global gravity
        this.physics.world.gravity.y = 900;

        // Pool (no auto-recycling)
        this.shermingsGroup = this.physics.add.group({
            classType: Shermings,
            maxSize: 10,
            runChildUpdate: true
        });

        // Spawn one every 3 seconds until there are 10
        const doorSpawnY = 560;
        const doorSpawnXs = [760, 790, 820, 850];
        let spawnIndex = 0;

        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                const activeCount = this.shermingsGroup.countActive(true);
                if (activeCount >= 10) {
                    this.spawnTimer?.remove(false);
                    return;
                }

                const x = doorSpawnXs[spawnIndex % doorSpawnXs.length];
                spawnIndex += 1;

                this.spawnShermingExplicit(x, doorSpawnY);
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