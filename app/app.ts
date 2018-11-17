/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace Main {
    export var mapService: Services.MapService = null;
    export var stateService: Services.StateService = null;

    export class App {
        public game: Phaser.Game = null;

        public constructor() {
            this.game = new Phaser.Game(
                640, 480, 
                Phaser.CANVAS, 
                'content'
            );

            mapService = new Services.MapService(this.game);
            this.registerStates();

            stateService.startFirstState();
        }

        private registerStates(): void {
            stateService = new Services.StateService(this.game);
            stateService.addState('game', Main.States.GameState);

            stateService.readyStates();
        }
    }
}

window.onload = () => {
    const app = new Main.App();
};