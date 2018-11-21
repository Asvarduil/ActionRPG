namespace Main.Entities {
    export class Player extends Mob {
        public constructor(
            x: number,
            y: number,
            imageKey: string,
            spriteScale: number
        ) {
            super(x, y, 16, imageKey, spriteScale, true);

            this.speed = new Mechanics.ModifiableStat('speed', 96);
            this.health = new Mechanics.HealthSystem(12, this.onHealed, this.onHurt, this.onDeath);
        }

        public onUpdate(deltaTime: number): void {
            this.checkForDashing();

            const hAxis = inputService.getAxis('horizontal').value();
            const vAxis = inputService.getAxis('vertical').value();

            this.gameObject.position.x += hAxis * this.speed.modifiedValue() * deltaTime;
            this.gameObject.position.y += vAxis * this.speed.modifiedValue() * deltaTime;

            this.selectAnimation(hAxis, vAxis);
            this.performMovement(hAxis, vAxis);
        }

        private checkForDashing(): void {
            // TODO: Add check against a Stamina resource.
            // TODO: Every 1 sec spent dashing raises the Stamina
            //       skill line by 1 XP.
            this.speed.clearModifiers();
            if (inputService.getAxis('dash').isPressed()) {
                this.speed.addScaledEffect(0.6);
            }
        }

        private selectAnimation(hAxis: number, vAxis: number): void {
            // TODO: Fix my animations to point to the correct frames, so I can fix
            // the animation logic below.
            if (hAxis === 0)
                if (this.direction === EntityDirections.RIGHT)
                    this.gameObject.animations.play('idle-right');
                else if (this.direction === EntityDirections.LEFT)
                    this.gameObject.animations.play('idle-left');
            if (vAxis === 0)
                if (this.direction === EntityDirections.DOWN)
                    this.gameObject.animations.play('idle-down');
                else if (this.direction === EntityDirections.UP)
                    this.gameObject.animations.play('idle-up');
        }
        
        private performMovement(hAxis: number, vAxis: number): void {
            if (hAxis > 0) {
                this.gameObject.animations.play('walk-right');
                this.direction = EntityDirections.LEFT;
            } else if (hAxis < 0) {
                this.gameObject.animations.play('walk-left');
                this.direction = EntityDirections.RIGHT;
            }

            if (vAxis > 0) {
                this.gameObject.animations.play('walk-down');
                this.direction = EntityDirections.DOWN;
            } else if (vAxis < 0) {
                this.gameObject.animations.play('walk-up');
                this.direction = EntityDirections.UP;
            }
        }
    }
}