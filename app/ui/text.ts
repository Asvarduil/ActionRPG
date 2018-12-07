namespace Main.UI {
    export class TextFactory {
        public textStyle: Phaser.PhaserTextStyle = null;

        public constructor() {
        }

        public initialize(): void {
            const data = game.cache.getJSON('ui-styles');
            this.textStyle = data['text']['default'];
        }

        public create(
            x: number, 
            y: number, 
            text: string
        ): Phaser.Text {
            const newText = game.add.text(x, y, text, this.textStyle);
            return newText;
        }
    }
}