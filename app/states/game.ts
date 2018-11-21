namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        public player: Entities.Player = null;
        
        public preload(): void {
        }

        public create(): void {
            const map: Services.Map = mapService.createMap('test-map', 'overworld-tiles', 16, 3);
            const collisionLayer = map.addCollisionLayer(1, 26, 63);
            map.addLayer(2);

            this.player = new Entities.Player(this.game, 96, 96, 'hero-male', 3);
            this.player.addAnimationsFromFile('template-animations');
            
            this.player.bindCamera();
            this.player.collidesWith(collisionLayer);
        }

        public update(): void {
            const deltaTime = this.game.time.physicsElapsed;

            this.player.onUpdate(deltaTime);
        }
    }
}