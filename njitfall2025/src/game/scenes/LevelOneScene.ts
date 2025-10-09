import { Sherming } from '../objects/entities/Sherming.ts';
import { HUDScene } from '../objects/ui/Hud.ts';
import { DigAbility } from '../objects/abilities/DigAbility.ts';

export class LevelOneScene extends Phaser.Scene {

  private static readonly SPAWN_DELAY = 500; // ms between spawns

  private shermingsGroup!: Phaser.Physics.Arcade.Group;
  private levelLayer!: Phaser.Tilemaps.TilemapLayer;
  private tilemap!: Phaser.Tilemaps.Tilemap;

  // scoring & markers
  private totalToSpawn = 10;
  private saved = 0;
  private requiredToPass = 4;
  private startPoint = new Phaser.Math.Vector2(150, 180);

  // goal
  private goalZone!: Phaser.GameObjects.Zone;
  private goalDebugRect?: Phaser.GameObjects.Rectangle; // <-- ADDED

  // HUD
  private hud!: HUDScene;

  // invisible map-edge barriers
  private edgeBarriers!: Phaser.Physics.Arcade.StaticGroup;

  private backgroundMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super('LevelOne');
  }

  preload() {
    // CSV tilemap + tileset image
    this.load.tilemapCSV('testMap', new URL('../assets/maps/testMap.csv', import.meta.url).href);
    this.load.image('testTile', new URL('../assets/tilemaps/test.png', import.meta.url).href);
    this.load.image('box', new URL('../assets/box.png', import.meta.url).href);


    this.load.atlas(
      'shermie_sheet',
      new URL('../assets/atlas/BasicLR_Shermie_Sheet.png', import.meta.url).href,
      new URL('../assets/atlas/BasicLR_Shermie_Sheet.json', import.meta.url).href,
    );

    if (!this.cache.audio.exists('level_one_music')) {
      this.load.audio('level_one_music', new URL('../assets/music/Firstlevel.mp3', import.meta.url).href);
    }
  }

  create() {
    const { width: w, height: h } = this.scale;

    
    const viewportHeight = h - HUDScene.HUD_HEIGHT;
    this.cameras.main.backgroundColor.setTo(128, 128, 128, 128);
    this.cameras.main.setViewport(0, 0, w, viewportHeight);

    // Build tilemap
    this.createTilemap(w, viewportHeight);

    const mapWidth = this.tilemap.widthInPixels;
    const mapHeight = this.tilemap.heightInPixels;

    // Camera & world
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.centerToBounds();

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.physics.world.gravity.y = 900;

    // Shermings group
    this.shermingsGroup = this.physics.add.group({
      classType: Sherming,
      runChildUpdate: true,
      maxSize: this.totalToSpawn,
    });

    // Collide with tile layer
    this.physics.add.collider(this.shermingsGroup, this.levelLayer);

    if ((Sherming as any).initDefaultAnimations) {
      Sherming.initDefaultAnimations(this);
    }

    // Create invisible edge barriers & collide with Shermings
    this.createEdgeBarriers(mapWidth, mapHeight);
    this.physics.add.collider(this.shermingsGroup, this.edgeBarriers);

    // Goal zone 
    this.createGoalZone();

    // Compute scale from a known frame
    const shermieTextureKey = 'shermie_sheet';
    const shermieDefaultFrame = 'BasicLR_Shermie_Sheet 9.png';
    const shermieFrame = this.textures.getFrame(shermieTextureKey, shermieDefaultFrame);
    const shermingScale = (this.tilemap.tileWidth * 2) / shermieFrame.width;

    // Spawn planned total at Start
    for (let i = 0; i < this.totalToSpawn; i++) {
      this.time.delayedCall(LevelOneScene.SPAWN_DELAY * i, () => {
        this.spawnSherming(this.startPoint.x, this.startPoint.y, shermingScale, shermieTextureKey, shermieDefaultFrame);
      });
    }

    // HUD
    this.scene.launch('HUD', { time: 120, score: 0, remaining: this.totalToSpawn, needed: this.requiredToPass });
    this.hud = this.scene.get('HUD') as HUDScene;
    this.updateHud();

    this.backgroundMusic = this.sound.add('level_one_music', { loop: true, volume: 0.5 });

    const playMusic = () => {
      if (!this.backgroundMusic?.isPlaying) {
        this.backgroundMusic?.play();
      }
    };

    const soundManager = this.sound;
    const unlockedEvent = Phaser.Sound?.Events?.UNLOCKED ?? 'unlocked';

    if (soundManager.locked) {
      if (typeof soundManager.once === 'function') {
        soundManager.once(unlockedEvent, playMusic);
      } else {
        this.events.once(Phaser.Scenes.Events.POST_UPDATE, playMusic);
      }
    } else {
      playMusic();
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (typeof soundManager.off === 'function') {
        soundManager.off(unlockedEvent, playMusic);
      } else if (typeof (soundManager as Phaser.Events.EventEmitter).removeListener === 'function') {
        (soundManager as Phaser.Events.EventEmitter).removeListener(unlockedEvent, playMusic);
      }
      this.backgroundMusic?.stop();
      this.backgroundMusic?.destroy();
      this.backgroundMusic = undefined;
    });
  }

  update() {
    // not needed thanks to runChildUpdate:true
  }

 

  private createTilemap(w: number, h: number, tileSize: number = 16) {
    void w; void h;

    this.tilemap = this.make.tilemap({
      key: 'testMap',
      tileWidth: tileSize,
      tileHeight: tileSize,
    });

    const tiles = this.tilemap.addTilesetImage('testTile');
    if (!tiles) return;

    this.levelLayer = this.tilemap.createLayer(0, tiles)!.setCollisionByExclusion([-1]);
  }

  private createEdgeBarriers(mapWidth: number, mapHeight: number) {
    this.edgeBarriers = this.physics.add.staticGroup();
    const thickness = 16;

    // Left wall
    const left = this.edgeBarriers.create(0, mapHeight / 2, 'box')
      .setOrigin(0, 0.5)
      .setAlpha(0)
      .setDisplaySize(thickness, mapHeight) as Phaser.Physics.Arcade.Sprite;
    left.refreshBody();

    // Right wall
    const right = this.edgeBarriers.create(mapWidth, mapHeight / 2, 'box')
      .setOrigin(1, 0.5)
      .setAlpha(0)
      .setDisplaySize(thickness, mapHeight) as Phaser.Physics.Arcade.Sprite;
    right.refreshBody();

    // Top
    const top = this.edgeBarriers.create(mapWidth / 2, 0, 'box')
      .setOrigin(0.5, 0)
      .setAlpha(0)
      .setDisplaySize(mapWidth, thickness) as Phaser.Physics.Arcade.Sprite;
    top.refreshBody();

    // Bottom
    const bottom = this.edgeBarriers.create(mapWidth / 2, mapHeight, 'box')
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setDisplaySize(mapWidth, thickness) as Phaser.Physics.Arcade.Sprite;
    bottom.refreshBody();
  }

  // End-goal zone (moved up & inset so it’s reachable)
  private createGoalZone() {
    const tileW = this.tilemap.tileWidth;
    const tileH = this.tilemap.tileHeight;

    const zoneTilesWide = 3;   // width in tiles
    const zoneTilesHigh = 4;   // height in tiles
    const insetRightTiles = 3; // push left from right edge
    const raiseUpTiles = 20;    // raise above floor

    const zoneWidth  = tileW * zoneTilesWide;
    const zoneHeight = tileH * zoneTilesHigh;

    const goalX = this.tilemap.widthInPixels  - zoneWidth  - (tileW * insetRightTiles);
    const goalY = this.tilemap.heightInPixels - zoneHeight - (tileH * raiseUpTiles);

    this.goalZone = this.add.zone(
      goalX + zoneWidth / 2,
      goalY + zoneHeight / 2,
      zoneWidth,
      zoneHeight
    );
    this.physics.add.existing(this.goalZone, true);

    // DEBUG rect 
    if (this.goalDebugRect) this.goalDebugRect.destroy();
    this.goalDebugRect = this.add
      .rectangle(this.goalZone.x, this.goalZone.y, zoneWidth, zoneHeight, 0x00ff00, 0.25)
      .setDepth(10_000);

    // Overlap: when a Sherming touches the goal, count it
    this.physics.add.overlap(
        this.shermingsGroup,this.goalZone,this.handleGoalOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,undefined,this
);

  }

private handleGoalOverlap(
  object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
): void {

  const isZone1 = (object1 as any) === this.goalZone;
  const isZone2 = (object2 as any) === this.goalZone;

  // Ignore tile overlaps
  if ((object1 as any).constructor?.name === 'Tile' || (object2 as any).constructor?.name === 'Tile') {
    return;
  }


  const go = (isZone1 ? (object2 as any) : (object1 as any)) as Phaser.GameObjects.GameObject;

  // Not a gameobject or doesn’t have a body? bail.
  const body = (go as any).body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | undefined;
  if (!go || !body) return;

// Not active/visible? Already scored, ignore.
  const sherming = go as unknown as Sherming;

  // Prevent double-count
  if (!sherming.active || !sherming.visible) return;

  
  if (typeof (sherming as any).disableBody === 'function') {
    (sherming as any).disableBody(true, true);
  } else {
    sherming.setActive(false).setVisible(false);
  }

  // Score and HUD
  this.saved += 1;
  this.updateHud();

  // Optional: win condition
  if (this.saved >= this.requiredToPass) {
    // TODO: win UI / next level
  }
}



  private updateHud() {
    const percent = Math.floor((this.saved / this.totalToSpawn) * 100);
    if (this.hud) {
      this.hud.setScore(percent);                           // "Score: <percent>"
      this.hud.setRemaining(this.totalToSpawn - this.saved);
      this.hud.setNeeded(this.requiredToPass);
    }
  }

  private spawnSherming(x: number, y: number, scale: number, textureKey: string | null, frameKey: string | null) {
    const sherming = Sherming.create(this, x, y, scale, textureKey, frameKey);
    this.shermingsGroup.add(sherming, true);
    sherming.setInteractive();
    sherming.setAbility(new DigAbility());
    sherming.on('pointerdown', () => {
      const ability = sherming.ability;
      if (ability != null) {
        ability.execute(this, sherming, { tileMap: this.tilemap, layer: this.levelLayer });
      }
    });
  }
}