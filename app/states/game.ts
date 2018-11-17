namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        
        public preload(): void {
            this.game.load.image('tiles', 'assets/images/tiles.png');
            this.game.load.tilemap('test-map', 'assets/maps/overworld.csv', null, Phaser.Tilemap.CSV);
        }

        public create(): void {
            mapService.createMap('test-map', 'tiles', 16, 4, 4, 3);

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        public update(): void {
            if (this.cursors.left.isDown)
                this.game.camera.x--;
            else if (this.cursors.right.isDown)
                this.game.camera.x++;

            if (this.cursors.up.isDown)
                this.game.camera.y--;
            else if (this.cursors.down.isDown)
                this.game.camera.y++;
        }
    }
}