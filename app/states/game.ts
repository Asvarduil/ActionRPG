namespace Main.States {
    export class GameState extends Phaser.State {
        public map: Services.Map = null;
        public player: Entities.Player = null;
        public skillUpLabel: Phaser.Text = null;
        
        public preload(): void {
        }

        public create(): void {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            this.map = mapService.loadMap('overworld');

            this.player = new Entities.Player(96, 96, 'hero-male', 'template-animations', 3);
            
            this.skillUpLabel = textFactory.create(0, 0, '[Skill Up]');
            this.skillUpLabel.alpha = 0;
            this.skillUpLabel.fixedToCamera = true;
            this.player.onSkillUp = this.onPlayerSkillUp.bind(this);

            cameraService.bindCamera(this.player);
            cameraService.fadeIn(() => {});
        }

        private onPlayerSkillUp(skill: Mechanics.SkillLine): void {
            this.skillUpLabel.setText(`${skill.name} has increased to ${skill.level}`);
            this.skillUpLabel.x = game.canvas.width / 2 - this.skillUpLabel.width / 2;
            this.skillUpLabel.y = 100
            this.skillUpLabel.fixedToCamera = true;

            game.add.tween(this.skillUpLabel).to(
                {alpha: 1},
                500,
                Phaser.Easing.Linear.None,
                true
            );

            game.time.events.add(3000, () => {
                game.add.tween(this.skillUpLabel).to(
                    {alpha: 0},
                    500,
                    Phaser.Easing.Linear.None,
                    true
                );
            });
        }

        public update(): void {
            const deltaTime = this.game.time.physicsElapsed;
            game.physics.arcade.TILE_BIAS = 90;

            this.player.onUpdate(deltaTime);
            this.player.checkMapCollisions(this.map);
        }
    }
}