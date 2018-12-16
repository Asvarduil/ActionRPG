namespace Main.Entities {
    export class Player extends Mob {
        public constructor(
            name: string,
            x: number,
            y: number,
            tileSize: number,
            imageKey: string,
            animationKey: string,
            statData: IMobStatData,
            spriteScale: number
        ) {
            super(
                name, 
                x, 
                y, 
                tileSize, 
                imageKey, 
                animationKey, 
                spriteScale, 
                true
            );

            this.setStatsFromData(statData);
        }

        public onUpdate(deltaTime: number): void {
            const hAxis = inputService.getAxis('horizontal').value();
            const vAxis = inputService.getAxis('vertical').value();

            this.selectAnimation(hAxis, vAxis);
            this.performMovement(hAxis, vAxis, deltaTime);
            this.resourceRegeneration(deltaTime);
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
            } else if (vAxis > 0) {
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
            const physicsBody = this.body();
            const speed = this.getStatByName("speed");
            const dashCost = this.getStatByName("Dash Cost");
            const stamina = this.getResourceByName("Stamina");

            speed.clearModifiers();
            if (inputService.getAxis('dash').isPressed()
                && (hAxis !== 0 || vAxis !== 0)
                && stamina.consume(dashCost.modifiedValue() * deltaTime)) {
                speed.addScaledEffect(0.6);
                this.addXpForSkill(deltaTime, "Conditioning");
            }

            // Since I'm using physics why aren't I colliding?
            physicsBody.velocity.x = hAxis * speed.modifiedValue();
            physicsBody.velocity.y = vAxis * speed.modifiedValue();
        }

        private resourceRegeneration(deltaTime: number): void {
            const stamina = this.getResourceByName("Stamina");
            const staminaRegen = this.getStatByName("Stamina Regen");
            const conditioning = this.getLevelForSkill("Conditioning");

            stamina.gain(
                staminaRegen.modifiedValue() + ((conditioning / 1000) * 0.25) * deltaTime
            );
        }
    }
}