namespace Main.Entities {
    export enum EntityDirections {
        DOWN = 0,
        LEFT,
        RIGHT,
        UP
    }

    export class Mob {
        public gameObject: Phaser.TileSprite = null;
        public direction: EntityDirections = EntityDirections.DOWN;

        public health: Mechanics.HealthSystem = null;
        public speed: Mechanics.ModifiableStat = null;

        public constructor(
            private game: Phaser.Game,
            x: number,
            y: number,
            tileSize: number,
            imageKey: string,
            spriteScale: number = 1,
            enablePhysics: boolean = true,
            private frameRate: number = 8
        ) {
            this.health = new Mechanics.HealthSystem(4, this.onHealed, this.onHurt, this.onDeath);
            this.speed = new Mechanics.ModifiableStat('speed', 48);

            this.gameObject = game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
            this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
            if (enablePhysics)
                this.game.physics.arcade.enable(this.gameObject);
        }

        public onHealed(): void {
        }

        public onHurt(): void {
        }

        public onDeath(): void {
        }

        public onUpdate(deltaTime: number): void {
        }

        public addAnimationsFromFile(jsonKey: string): Phaser.Animation[] {
            // Data should be pre-loaded with this.game.load.json().
            const data = this.game.cache.getJSON(jsonKey);

            const result: Phaser.Animation[] = [];
            for (let current of data.animations) {
                const newAnimation = this.addAnimation(current['key'], current['frames'], current['isLooped']);
                result.push(newAnimation);
            }

            return result;
        }

        public addAnimation(key: string, frames: number[], isLooped: boolean = true): Phaser.Animation {
            return this.gameObject.animations.add(key, frames, this.frameRate, isLooped);
        }

        public bindCamera(): void {
            this.game.camera.follow(this.gameObject.animations.sprite);
        }
    }

    export class Player extends Mob {
        public constructor(
            game: Phaser.Game,
            x: number,
            y: number,
            imageKey: string,
            spriteScale: number
        ) {
            super(game, x, y, 16, imageKey, spriteScale, true);

            this.speed = new Mechanics.ModifiableStat('speed', 76);
        }

        public onUpdate(deltaTime: number): void {
            const hAxis = inputService.getAxis('horizontal').value();
            const vAxis = inputService.getAxis('vertical').value();
            
            if (hAxis > 0) {
                this.gameObject.animations.play('walk-right');
                this.gameObject.position.x += hAxis * this.speed.modifiedValue() * deltaTime;
                this.direction = 1;
            } else if (hAxis < 0) {
                this.gameObject.animations.play('walk-left');
                this.gameObject.position.x += hAxis * this.speed.modifiedValue() * deltaTime;
                this.direction = 2;
            } else if (hAxis === 0) {
                if (this.direction === 1)
                    this.gameObject.animations.play('idle-right');
                else if (this.direction === 2)
                    this.gameObject.animations.play('idle-left');
            }

            if (vAxis > 0) {
                this.gameObject.animations.play('walk-down');
                this.gameObject.position.y += vAxis * this.speed.modifiedValue() * deltaTime;
                this.direction = 0;
            } else if (vAxis < 0) {
                this.gameObject.animations.play('walk-up');
                this.gameObject.position.y += vAxis * this.speed.modifiedValue() * deltaTime;
                this.direction = 3;
            } else if (vAxis === 0) {
                if (this.direction === 0)
                this.gameObject.animations.play('idle-down');
            else if (this.direction === 3)
                this.gameObject.animations.play('idle-up');
            }
        }
    }
}