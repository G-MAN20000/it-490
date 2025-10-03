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
        this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
        this.load.atlas('shermie_sheet', new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href, new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href);
        this.load.audio('level1_music', new URL('../assets/music/Fristleve.mp3', import.meta.url).href);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        
        this.cameras.main.backgroundColor.setTo(128, 128, 128, 128)
        
        //start background music
        this.sound.stopAll();

        this.backgroundMusic = this.sound.add('level1_music', { loop: true, volume: 0.5});
        this.backgroundMusic.play();
    
        // Keep the world == camera so nothing “walks off-camera”
        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);
        this.cameras.main.setRoundPixels(true); // prevents subpixel flicker

        // Walls / platforms
        this.walls = this.physics.add.staticGroup();
        // Floor
        this.walls.create(W / 2, H - 25, 'box').setScale(Math.max(W / 160, 5), 0.5).refreshBody();
        // Sides
        this.walls.create(25, H / 2, 'box').setScale(0.5, Math.max(H / 100, 6)).refreshBody();
        this.walls.create(W - 25, H / 2, 'box').setScale(0.5, Math.max(H / 100, 6)).refreshBody();

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

        const stopMusic = () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                this.backgroundMusic.destroy();
                this.backgroundMusic = undefined;
            }
        };

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.spawnTimer?.remove(false);
            stopMusic();
        });

        this.events.once(Phaser.Scenes.Events.DESTROY, stopMusic);

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
