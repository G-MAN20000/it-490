export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

export class DirectionUtil {
    private static readonly DIRECTION_VECTORS: Readonly<Record<Direction, Phaser.Math.Vector2>> = {
        [Direction.UP]: new Phaser.Math.Vector2(0, -1),
        [Direction.RIGHT]: new Phaser.Math.Vector2(1, 0),
        [Direction.DOWN]: new Phaser.Math.Vector2(0, 1),
        [Direction.LEFT]: new Phaser.Math.Vector2(-1, 0),
    };

    public static toVector(direction: Direction): Phaser.Math.Vector2 {
        return DirectionUtil.DIRECTION_VECTORS[direction];
    }

}