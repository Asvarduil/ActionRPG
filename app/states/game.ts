namespace Main.States {
    export class GameState extends Phaser.State {
        public cursors: Phaser.CursorKeys = null;
        public player: Entities.Player = null;
        
        public preload(): void {
        }

        public create(): void {
            const map: Services.Map = mapService.createMap('test-map', 'overworld-tiles', 16, 3);
            //map.addCollisionLayer(0, 26, 63);

            this.player = new Entities.Player(this.game, 96, 96, 'human-template', 3);
            this.player.addAnimationsFromFile('template-animations');
            
            this.player.bindCamera();
        }

        public update(): void {
            const deltaTime = this.game.time.physicsElapsed;

            this.player.onUpdate(deltaTime);
        }
    }
}