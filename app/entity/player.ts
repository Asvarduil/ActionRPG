namespace Main.Entities {
    export class Player extends Mob {
        public constructor(
            game: Phaser.Game,
            x: number,
            y: number,
            imageKey: string,
            spriteScale: number
        ) {
            super(game, x, y, 16, imageKey, spriteScale, true);

            this.speed = new Mechanics.ModifiableStat('speed', 96);
            this.health = new Mechanics.HealthSystem(12, this.onHealed, this.onHurt, this.onDeath);
        }

        public onUpdate(deltaTime: number): void {
            this.speed.clearModifiers();
            if (inputService.getAxis('dash').isPressed()) {
                this.speed.addScaledEffect(0.6);
            }

            const hAxis = inputService.getAxis('horizontal').value();
            const vAxis = inputService.getAxis('vertical').value();

            this.gameObject.position.x += hAxis * this.speed.modifiedValue() * deltaTime;
            this.gameObject.position.y += vAxis * this.speed.modifiedValue() * deltaTime;

            if (hAxis === 0)
                if (this.direction === 1)
                    this.gameObject.animations.play('idle-right');
                else if (this.direction === 2)
                    this.gameObject.animations.play('idle-left');
            if (vAxis === 0)
                if (this.direction === 0)
                    this.gameObject.animations.play('idle-down');
                else if (this.direction === 3)
                    this.gameObject.animations.play('idle-up');
            
            if (hAxis > 0) {
                this.gameObject.animations.play('walk-right');
                this.direction = 1;
            } else if (hAxis < 0) {
                this.gameObject.animations.play('walk-left');
                this.direction = 2;
            }

            if (vAxis > 0) {
                this.gameObject.animations.play('walk-down');
                this.direction = 0;
            } else if (vAxis < 0) {
                this.gameObject.animations.play('walk-up');
                this.direction = 3;
            }
        }
    }
}