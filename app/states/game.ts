namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        
        public preload(): void {
            this.game.load.image('overworld-tiles', 'assets/images/tiles.png');
            this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
        }

        public create(): void {
            inputService.initialize();
            const map: Services.Map = mapService.createMap('test-map', 'overworld-tiles', 16, 3);
            map.addCollisionLayer(1, 26, 63);

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
            );
        }

        public update(): void {
        }
    }
}