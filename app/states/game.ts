namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        
        public preload(): void {
            this.game.load.image('overworld-tiles', 'assets/images/tiles.png');
            this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
        }

        public create(): void {
            const map: Services.Map = mapService.createMap('test-map', 'overworld-tiles', 16, 3);
            map.addCollisionLayer(0, 26, 63);

            // this.game.physics.startSystem(Phaser.Physics.ARCADE);
        }

        public update(): void {
            const hAxis = inputService.getAxis('horizontal');
            const vAxis = inputService.getAxis('vertical');
            
            const horizontalAxis: number = hAxis.value();
            this.game.camera.x += horizontalAxis * 3;

            const verticalAxis = vAxis.value();
            this.game.camera.y += verticalAxis * 3;
        }
    }
}