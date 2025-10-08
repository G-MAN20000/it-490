import { Sherming } from '../objects/entities/Sherming.ts';
import { HUDScene } from '../objects/ui/Hud.ts';

export class LevelOneScene extends Phaser.Scene {

    private static readonly SPAWN_DELAY = 500;

    private shermingsGroup!: Phaser.Physics.Arcade.Group;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private spawnTimer?: Phaser.Time.TimerEvent;
    private backgroundMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super('LevelOne');
    }

    preload() {
        this.load.image('box', new URL('../assets/box.png', import.meta.url).href);
        this.load.image('level1_background', new URL('../assets/level1.png', import.meta.url).href);
        this.load.atlas(
            'shermie_sheet',
            new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href,
            new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href,
        );
        this.load.audio('level1_music', new URL('../assets/music/Mainmenuv2.mp3', import.meta.url).href);
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        const background = this.add.image(0, 0, 'level1_background').setOrigin(0, 0);
        background.setDisplaySize(W, H);
        background.setDepth(-10);

        this.backgroundMusic = this.sound.add('level1_music', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);
        this.cameras.main.setRoundPixels(true);

        this.walls = this.physics.add.staticGroup();

        const showCollisionBoxes = false;
        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 450;

        const createStaticRect = (centerX: number, centerY: number, width: number, height: number) => {
            const rect = this.walls.create(centerX, centerY, 'box') as Phaser.Physics.Arcade.Sprite;
            rect.setDisplaySize(width, height);
            rect.refreshBody();
            rect.setVisible(showCollisionBoxes);
            rect.setActive(true);
            return rect;
        };

        const createStaticRectFromImageSpace = (centerX: number, centerY: number, width: number, height: number) => {
            const worldX = (centerX / BASE_WIDTH) * W;
            const worldY = (centerY / BASE_HEIGHT) * H;
            const worldWidth = (width / BASE_WIDTH) * W;
            const worldHeight = (height / BASE_HEIGHT) * H;
            return createStaticRect(worldX, worldY, worldWidth, worldHeight);
        };

        // Example collision boxes aligned with the background artwork.
        createStaticRectFromImageSpace(400, 430, 800, 40); // main ground
        createStaticRectFromImageSpace(80, 300, 120, 260); // left wall/pillar
        createStaticRectFromImageSpace(720, 300, 120, 260); // right wall/pillar

        // Keep the left/right boundaries so characters remain on-screen.
        const wallWidth = Math.max(W * 0.02, 24);
        createStaticRect(wallWidth * 0.5, H * 0.5, wallWidth, H);
        createStaticRect(W - wallWidth * 0.5, H * 0.5, wallWidth, H);

        this.physics.world.gravity.y = 900;

        this.shermingsGroup = this.physics.add.group({
            classType: Sherming,
            runChildUpdate: true,
            maxSize: 10,
        });

        this.physics.add.collider(this.shermingsGroup, this.walls);

        Sherming.initDefaultAnimations(this);

        const keyboard = this.input.keyboard;
        if (keyboard != null) {
            keyboard.on('keydown-ESC', () => {
                this.scene.pause('LevelOne');
                this.physics.world.pause();

                const hud = this.scene.get('HUD') as HUDScene;
                hud.levelTimerPaused = true;
                hud.abilityIcons.forEach((icon: Phaser.GameObjects.Image) => icon.disableInteractive());

                this.scene.launch('PausedOptions', { lastScene: 'LevelOne' });
            });
        }

        this.spawnSherming(150, 180);
        this.spawnTimer = this.time.addEvent({
            delay: LevelOneScene.SPAWN_DELAY,
            repeat: 8,
            callback: () => {
                this.spawnSherming(150, 180);
            },
        });

        this.scene.launch('HUD', { score: 0, remaining: 10, needed: 4 });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.spawnTimer?.remove(false);
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
        });
    }

    private spawnSherming(x: number, y: number) {
        this.shermingsGroup.add(
            Sherming.create(this, x, y, 'shermie_sheet', 'BasicLR_Shermie_Sheet 9.png'),
            true,
        );
    }
}
