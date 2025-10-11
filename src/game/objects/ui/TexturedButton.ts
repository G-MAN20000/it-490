/**
 * Phaser warns against the use of containers due to nested operations; I think we'll be okay.
 * Objects are iterated through the order they were added in, use moveDown() or moveUp().
 **/
export class TexturedButton extends Phaser.GameObjects.Container {

    private static readonly POINTER_OVER_COLOR: number = 0xFF7393B3;
    private static readonly POINTER_OUT_COLOR: number = 0xFF36454F;

    public backGround: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        textureKey: string | null,
        style: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
        super(scene, x, y);

        const buttonText = new Phaser.GameObjects.Text(scene, 0, 0, text, style);
        buttonText.setOrigin(0.5, 0.5);

        if (textureKey) {
            this.backGround = new Phaser.GameObjects.Image(scene, 0, 0, textureKey);
            this.backGround.on('pointerover', () => this.pointerOver(this.backGround));
            this.backGround.on('pointerout', () => this.pointerOut(this.backGround));
        } else {
            this.backGround = new Phaser.GameObjects.Rectangle(scene, 0, 0, Math.max(width, buttonText.width), height, TexturedButton.POINTER_OUT_COLOR);
            this.backGround.on('pointerover', () => this.pointerOver(this.backGround));
            this.backGround.on('pointerout', () => this.pointerOut(this.backGround));
        }

        this.backGround.setInteractive();

        this.add(this.backGround);
        this.add(buttonText);
        scene.add.existing(this);
    }

    private pointerOver(object: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
        if (object instanceof Phaser.GameObjects.Image) {
            object.setTint(TexturedButton.POINTER_OVER_COLOR);
        } else {
            object.setFillStyle(TexturedButton.POINTER_OVER_COLOR);
        }
    }

    private pointerOut(object: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
        if (object instanceof Phaser.GameObjects.Image) {
            object.clearTint();
        } else {
            object.setFillStyle(TexturedButton.POINTER_OUT_COLOR);
        }
    }

}