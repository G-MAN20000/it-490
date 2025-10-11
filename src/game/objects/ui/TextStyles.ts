export class TextStyles {
    public static readonly BUTTON_TEXT: Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 1,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#DDDDDD',
            stroke: false,
            fill: false,
        }
    };

    public static readonly HUD_TEXT: Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 1,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            stroke: false,
            fill: true,
        }
    };
}