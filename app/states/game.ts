namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        
        public preload(): void {
            this.game.load.image('tiles', 'assets/images/tiles.png');
            this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
        }

        public create(): void {
            inputService.initialize();
            mapService.createMap('test-map', 'tiles', 16, 4, 4, 3);

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            
            inputService.addHandlerToAxis(
                'horizontal',
                () => {
                    this.game.camera.x++;
                },
                () => {
                    this.game.camera.x--;
                }
            );
            inputService.addHandlerToAxis(
                'vertical',
                () => {
                    this.game.camera.y++;
                },
                () => {
                    this.game.camera.y--;
                }
            )
        }

        public update(): void {
        }
    }
}