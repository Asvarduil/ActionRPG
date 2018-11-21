/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace Main {
    export var mapService: Services.MapService = null;
    export var stateService: Services.StateService = null;
    export var inputService: Services.InputService = null;

    export var menuFactory: UI.MenuFactory = null;

    export class App {
        public game: Phaser.Game = null;

        public constructor() {
            this.game = new Phaser.Game(
                640, 480, 
                Phaser.CANVAS, 
                'content',
                null,
                false,
                false
            );

            this.registerFactories();
            this.registerServices();
            this.registerStates();

            this.appStart();
        }

        private registerServices(): void {
            mapService = new Services.MapService(this.game);
            stateService = new Services.StateService(this.game);
            inputService = new Services.InputService(this.game);
        }

        private registerFactories(): void {
            const defaultStyle = {
                fill: '#FFF'
            };
            const selectedStyle = {
                fill: '#FF3'
            };
            menuFactory = new UI.MenuFactory(
                this.game,
                defaultStyle,
                selectedStyle
            );

            // TODO: More factories.
        }

        private registerStates(): void {
            stateService.addState('init', States.InitState);
            stateService.addState('title', States.TitleState);
            stateService.addState('game', States.GameState);
            stateService.readyStates();
        }

        private appStart(): void {
            stateService.startFirstState();
        }
    }
}

window.onload = () => {
    const app = new Main.App();
};