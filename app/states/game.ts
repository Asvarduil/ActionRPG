namespace Main.States {
    export class GameState extends Phaser.State {
        public map: Services.Map = null;
        public cursors: Phaser.CursorKeys = null;
        public player: Entities.Player = null;
        
        public preload(): void {
        }

        public create(): void {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            this.map = mapService.loadMap('overworld');

            this.player = new Entities.Player(96, 96, 'hero-male', 'template-animations', 3);
            cameraService.bindCamera(this.player);
            cameraService.fadeIn(() => {});
        }

        public update(): void {
            const deltaTime = this.game.time.physicsElapsed;
            game.physics.arcade.TILE_BIAS = 90;

            this.player.onUpdate(deltaTime);
            this.player.checkMapCollisions(this.map);
        }
    }
}