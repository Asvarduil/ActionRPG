namespace Main.States {
    export class InitState extends Phaser.State {
        public preload() {
            game.load.image('overworld-tiles', 'assets/images/tiles.png');
            //this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
            game.load.tilemap('test-map', 'assets/maps/test-3.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.spritesheet('human-template', 'assets/images/human-template.png', 16, 16);
            game.load.spritesheet('hero-male', 'assets/images/hero-male.png', 16, 16);

            game.load.json('template-animations', 'assets/animations/player-animations.json');
            game.load.json('skill-line-defaults', 'assets/mechanics/skill-line-defaults.json');
        }

        public create() {
            // Ready any services...
            inputService.initialize();

            // Ready any factories...
            skillLineFactory.initialize();

            // Actually start the game proper.
            stateService.load('title');
        }

        public update() {
            
        }
    }
}