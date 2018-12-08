namespace Main.UI {
    export type INamedPhaserTextStyle = Phaser.PhaserTextStyle & INamed;

    export class TextFactory {
        public styles: INamedPhaserTextStyle[] = [];

        public constructor() {
        }

        public initialize(): void {
            const data = game.cache.getJSON('ui-styles');
            const styleData = data['text'];

            for (let current of styleData) {
                this.styles.push(current);
            }
        }

        public create(
            x: number, 
            y: number, 
            text: string,
            style?: string
        ): Phaser.Text {
            let styleData: INamedPhaserTextStyle;
            if (!style) {
                styleData = JSON.parse(JSON.stringify(this.styles[0]));
            } else {
                styleData = JSON.parse(JSON.stringify(this.styles.getByName(style)));  
            }
  
            const newText = game.add.text(x, y, text, styleData);
            return newText;
        }
    }
}