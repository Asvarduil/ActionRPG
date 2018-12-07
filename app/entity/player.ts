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
            const hAxis = inputService.getAxis('horizontal').value();
            const vAxis = inputService.getAxis('vertical').value();

            this.selectAnimation(hAxis, vAxis);
            this.performMovement(hAxis, vAxis, deltaTime);
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
        
        private performMovement(
            hAxis: number, 
            vAxis: number, 
            deltaTime: number
        ): void {
            const physicsBody = this.gameObject.body;
            const speed = this.getStatByName("speed");

            speed.clearModifiers();
            if (inputService.getAxis('dash').isPressed()
                && (hAxis !== 0 || vAxis !== 0)) {
                // At 1000 Conditioning, you'll get an 
                // additional 25% base move speed when sprinting.
                speed.addScaledEffect(0.6 + (0.00025 * this.getLevelForSkill("Conditioning")));
                this.addXpForSkill(deltaTime, "Conditioning");
            }

            // Since I'm using physics why aren't I colliding?
            physicsBody.velocity.x = hAxis * speed.modifiedValue();
            physicsBody.velocity.y = vAxis * speed.modifiedValue();
        }
    }
}