namespace Main.States {
    export class GameState extends Phaser.State {
        // TODO: Entity pools
        // TODO: Global sprite scaling
        public map: Services.Map = null;
        public player: Entities.Player = null;
        public layout: UI.Layout = null;

        private npc: Entities.Mob = null;
        private testTrigger: Entities.Trigger = null;

        private exitTriggerEntered: boolean = false;

        public preload(): void {
        }

        public create(): void {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            
            this.map = mapService.loadMap('overworld');

            this.npc = new Entities.Mob(96, 192, 16, 'hero-male', 'template-animations', 3);
            this.player = new Entities.Player(96, 96, 'hero-male', 'template-animations', 3);

            this.testTrigger = new Entities.Trigger(16, 192, 16, 32, 3);

            this.layout = new UI.Layout('game-ui');
            
            const skillUpLabel: Phaser.Text = <Phaser.Text>(this.layout.elements.getByName('skillUpLabel'));
            skillUpLabel.alpha = 0;
            skillUpLabel.fixedToCamera = true;
            this.player.onSkillUp = this.onPlayerSkillUp.bind(this);

            const healthGauge: UI.ResourceGauge = <UI.ResourceGauge>(this.layout.elements.getByName('health'));
            healthGauge.bindResource(this.player.health);
            this.player.health.onChange = this.onPlayerHealthChange.bind(this);

            const staminaGauge: UI.ResourceGauge = <UI.ResourceGauge>(this.layout.elements.getByName('stamina'));
            const playerStamina = this.player.getResourceByName("Stamina");
            staminaGauge.bindResource(playerStamina);
            playerStamina.onChange = this.onPlayerStaminaChange.bind(this);

            cameraService.bindCamera(this.player);
            cameraService.fadeIn(() => {});
        }

        private onPlayerSkillUp(skill: Mechanics.SkillLine): void {
            const skillUpLabel: Phaser.Text = <Phaser.Text>(this.layout.elements.getByName('skillUpLabel'));
            skillUpLabel.setText(`${skill.name} has increased to ${skill.level}`);
            skillUpLabel.x = game.canvas.width / 2 - skillUpLabel.width / 2;
            skillUpLabel.y = 100
            skillUpLabel.fixedToCamera = true;

            game.add.tween(skillUpLabel).to(
                {alpha: 1},
                500,
                Phaser.Easing.Linear.None,
                true
            );

            game.time.events.add(3000, () => {
                game.add.tween(skillUpLabel).to(
                    {alpha: 0},
                    500,
                    Phaser.Easing.Linear.None,
                    true
                );
            });
        }

        private onPlayerHealthChange(): void {
            const healthGauge: UI.ResourceGauge = <UI.ResourceGauge>(this.layout.elements.getByName('health'));
            healthGauge.update();
        }

        private onPlayerStaminaChange(): void {
            const staminaGauge: UI.ResourceGauge = <UI.ResourceGauge>(this.layout.elements.getByName('stamina'));
            staminaGauge.update();
        }

        public update(): void {
            const deltaTime = this.game.time.physicsElapsed;

            this.player.onUpdate(deltaTime);
            this.player.checkCollisionWith(this.npc);
            this.player.checkCollisionWith(this.map);
            this.npc.checkCollisionWith(this.map);

            this.testTrigger.checkOverlapsWith(this.player, () => {
                console.log(`Overlap detected!`);
                if (this.exitTriggerEntered === true)
                    return;

                this.exitTriggerEntered = true;
                cameraService.fadeOut(() => {
                    stateService.load('title');
                });
            });
        }

        public render(): void {
            game.debug.body(this.testTrigger.gameObject);
        }
    }
}