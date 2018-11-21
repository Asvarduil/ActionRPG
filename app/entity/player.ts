namespace Main.Entities {
    export class Player extends Mob {
        public constructor(
            x: number,
            y: number,
            imageKey: string,
            animationKey: string,
            spriteScale: number
        ) {
            super(x, y, 16, imageKey, animationKey, spriteScale, true);

            this.setStatsFromFile('player');
            // TODO: Overwrite the defaults with stats from the player state store instead.
            //       This will also cover skill line levels, and other things.
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
                this.direction = EntityDirections.RIGHT;
            } else if (hAxis < 0) {
                this.gameObject.animations.play('walk-left');
                this.direction = EntityDirections.LEFT;
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