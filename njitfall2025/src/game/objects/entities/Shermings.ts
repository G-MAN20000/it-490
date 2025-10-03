import Phaser from 'phaser';

export class Shermings extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private direction: number;
  private hasTouchedGround = false; // start walking after first landing

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number = 100) {
      super(scene, x, y, '');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = speed;
    this.direction = 1;

    this.setDepth(1000);
    this.setCollideWorldBounds(true);
    this.setBounce(0); // Lemmings don't bounce
    this.setFriction?.(1, 0); // (no-op in arcade; safe if extended)

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      // REMOVE per-sprite gravity; we’ll use world gravity
      // body.setGravityY(250);
      body.setSize(this.width, this.height, true);
      body.setOffset(0, 0);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
  }

  public syncBodyToDisplay() {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    body.setSize(this.width, this.height, true);
    body.setOffset(0, 0);
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    // Mark when we’ve landed once
    if (body.blocked.down || body.touching.down) {
      this.hasTouchedGround = true;
    }

    // Walk only when grounded; while falling, keep horizontal speed but you can also pause it if preferred
      if (this.hasTouchedGround) {
          this.setVelocityX(this.speed * this.direction);
          if (!this.anims.isPlaying) this.play('sherming_walk_right', true);
      } else {
          this.anims.stop();
      }

    // Flip direction when hitting walls (true Lemmings behavior)
    if (body.blocked.right || body.touching.right) {
      this.direction = -1;
      this.flipX = true;
    } else if (body.blocked.left || body.touching.left) {
      this.direction = 1;
      this.flipX = false;
    }
  }
}
