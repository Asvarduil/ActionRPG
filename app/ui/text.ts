namespace Main.UI {
    export type INamedPhaserTextStyle = Phaser.PhaserTextStyle & INamed;
    export type INamedPhaserText = Phaser.Text & INamed;

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
            name: string,
            x: number, 
            y: number, 
            text: string,
            style?: string
        ): INamedPhaserText {
            let styleData: INamedPhaserTextStyle;
            if (!style) {
                styleData = JSON.parse(JSON.stringify(this.styles[0]));
            } else {
                styleData = JSON.parse(JSON.stringify(this.styles.getByName(style)));  
            }
  
            const newText: INamedPhaserText = game.add.text(x, y, text, styleData);
            newText.name = name;

            this.setSecondaryStyleData(<Phaser.Text>newText, styleData);
            return newText;
        }

        private setSecondaryStyleData(text: Phaser.Text, style: any): void {
            if (style["alpha"]) {
                const alpha: number = style["alpha"];
                text.alpha = alpha;
            }
        }
    }
}