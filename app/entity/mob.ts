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
        public skillLines: Mechanics.SkillLine[] = [];

        public constructor(
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
            this.skillLines = skillLineFactory.generateSkillLines();

            this.gameObject = game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
            this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
            if (enablePhysics)
                game.physics.arcade.enable(this.gameObject);
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
            const data = game.cache.getJSON(jsonKey);

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
            game.camera.follow(this.gameObject.animations.sprite);
        }

        public collidesWith(other: any): void {
            game.physics.arcade.collide(this.gameObject, other);
        }
    }
}