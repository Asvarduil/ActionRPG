namespace Main.States {
    export class InitState extends Phaser.State {
        public preload() {
            game.load.image('overworld-tiles', 'assets/images/tiles.png');
            game.load.tilemap('test-map', 'assets/maps/test-3.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.spritesheet('human-template', 'assets/images/human-template.png', 16, 16);
            game.load.spritesheet('hero-male', 'assets/images/hero-male.png', 16, 16);

            // Used by UI factories
            game.load.json('ui-styles', 'assets/ui/styles.json');

            // Used to auto-create UIs
            game.load.json('ui-layouts', 'assets/ui/layouts.json');

            // Used by the Map Service to build maps on the fly without hardcoding every single map.
            game.load.json('map-data', 'assets/maps/map-data.json');

            // Used by the Entity system to set up mob stats, also without hardcoding every single one.
            game.load.json('entity-stats', 'assets/entities/entities.json');

            // Used by various Mobs to set up their animations, again without hardcoding every single one.
            game.load.json('template-animations', 'assets/animations/template-animations.json');
            game.load.json('player-animations', 'assets/animations/player-animations.json');

            // Used by the Skill Line factory, to ensure that all mobs have the same skill lines.
            game.load.json('skill-line-defaults', 'assets/mechanics/skill-line-defaults.json');
        }

        public create() {
            // Ready any services...
            inputService.initialize();

            // Ready any factories...
            textFactory.initialize();
            menuFactory.iniitalize();
            resourceGaugeFactory.initialize();
            skillLineFactory.initialize();

            // Actually start the game proper.
            stateService.load('title');
        }

        public update() {
            
        }
    }
}