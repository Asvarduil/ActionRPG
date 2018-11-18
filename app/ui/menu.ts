namespace Main.UI {
    export class MenuData {
        public constructor(
            public options: MenuOptionData[],
            public defaultOption: number
        ) {
        }
    }

    export class MenuOptionData {
        public constructor(
            public optionText: string = '',
            public screenX: number = 0,
            public screenY: number = 0,
            public onSelection: () => void,
            public otherData?: Object
        ) {
        }
    }

    export class Menu {
        public isActive: boolean = true;
        public currentOption: number = 0;
        public constructor(
            public data: MenuData,
            public labels: Phaser.Text[],
            public defaultStyle: Phaser.PhaserTextStyle,
            public selectedStyle: Phaser.PhaserTextStyle,
            public selectionDelay: number = 250
        ) {
            this.currentOption = this.data.defaultOption;
        }

        public pause(): void {
            this.isActive = false;
        }

        public activate(): void {
            this.isActive = true;
        }
        
        private nextOptionHandler(): void {
            if (! this.isActive)
                return;

            this.selectNext();
        }

        private lastOptionHandler(): void {
            if (! this.isActive)
                return;

            this.selectPrevious();
        }

        private confirmHandler(): void {
            if (! this.isActive)
                return;

            this.executeSelection();
        }

        public grantKeyControl(): void {
            inputService.addHandlerToAxis(
                "vertical", 
                this.nextOptionHandler.bind(this), 
                this.lastOptionHandler.bind(this)
            );
            inputService.addHandlerToAxis(
                "confirm",
                this.confirmHandler.bind(this)
            );
        }

        public releaseKeyControl(): void {
            inputService.removeHandlerFromAxis(
                'vertical',
                this.nextOptionHandler,
                this.lastOptionHandler
            );
            inputService.removeHandlerFromAxis(
                'confirm',
                this.confirmHandler
            );
        }

        public selectNext(): void {
            if (this.data.options.length <= 1)
                return;

            this.clearSelectedOption();

            this.currentOption++;
            if (this.currentOption > this.data.options.length - 1)
                this.currentOption = 0;

            this.setSelectedOption();
        }

        public selectPrevious(): void {
            if (this.data.options.length <= 1)
                return;

            console.log('selectPrevious called...');

            this.clearSelectedOption();

            this.currentOption--;
            if (this.currentOption < 0)
                this.currentOption = this.data.options.length - 1;

            this.setSelectedOption();
        }

        public executeSelection(): void {
            this.data.options[this.currentOption].onSelection();
        }

        public clearSelectedOption(): void {
            this.labels[this.currentOption].setStyle(this.defaultStyle);
        }

        public setSelectedOption(): void {
            this.labels[this.currentOption].setStyle(this.selectedStyle);
        }
    }

    export class MenuFactory {
        public constructor(
            public game: Phaser.Game,
            public defaultStyle: Phaser.PhaserTextStyle,
            public selectedStyle: Phaser.PhaserTextStyle
        ) {
        }

        public create(menuData: MenuData): Menu {
            let menuLabels: Phaser.Text[] = [];
            let index: number = 0;
            for (let current of menuData.options) {
                const newText: Phaser.Text = this.game.add.text(
                    current.screenX, 
                    current.screenY,
                    current.optionText
                );
                newText.mousedown = current.onSelection;

                // This causes the options to render with the appropriate styling.
                if (index !== menuData.defaultOption)
                    newText.setStyle(this.defaultStyle);
                else
                    newText.setStyle(this.selectedStyle);

                menuLabels.push(newText);

                index++;
            }

            const result: Menu = new Menu(
                menuData,
                menuLabels,
                this.defaultStyle,
                this.selectedStyle
            );
            return result;
        }
    }
}