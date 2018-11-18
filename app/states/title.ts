namespace Main.States {
    export class TitleState extends Phaser.State {
        public cursors: Phaser.CursorKeys;
        public mainMenu: UI.Menu;

        public constructor() {
            super();
        }

        public preload(): void {

        }

        public create(): void {
            inputService.initialize();

            const toGameState = () => {
                console.log('Pressed!');
                stateService.load('game');
            };

            const data = new UI.MenuData(
                [
                    new UI.MenuOptionData('New Game', 8, 240, toGameState),
                    new UI.MenuOptionData('Continue', 8, 280, toGameState)
                ],
                0
            );
            this.mainMenu = menuFactory.create(data);
            this.mainMenu.grantKeyControl();
        }

        public update(): void {
        }
    }
}