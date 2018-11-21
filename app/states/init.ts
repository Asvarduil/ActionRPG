namespace Main.States {
    export class InitState extends Phaser.State {
        public preload() {
            this.game.load.image('overworld-tiles', 'assets/images/tiles.png');
            //this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
            this.game.load.tilemap('test-map', 'assets/maps/test-3.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.spritesheet('human-template', 'assets/images/human-template.png', 16, 16);
            this.game.load.spritesheet('hero-male', 'assets/images/hero-male.png', 16, 16);
            this.game.load.json('template-animations', 'assets/animations/player-animations.json');
        }

        public create() {
            inputService.initialize();

            stateService.load('title');
        }

        public update() {
            
        }
    }
}