namespace Main.States {
    export class InitState extends Phaser.State {
        public preload() {

        }

        public create() {
            inputService.initialize();

            stateService.load('title');
        }

        public update() {
            
        }
    }
}