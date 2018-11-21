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
            animationKey: string,
            spriteScale: number = 1,
            enablePhysics: boolean = true,
            private frameRate: number = 8
        ) {
            this.skillLines = skillLineFactory.generateSkillLines();

            // Default stats; these should be overwritten by each type of mob.
            this.health = new Mechanics.HealthSystem(4, this.onHealed, this.onHurt, this.onDeath);
            this.speed = new Mechanics.ModifiableStat('speed', 48);

            // Create the actual game object for the mob.
            this.gameObject = game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
            this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
            if (enablePhysics)
                game.physics.arcade.enable(this.gameObject);

            // Bind animations...
            this.addAnimationsFromFile(animationKey);
        }

        public onHealed(): void {
        }

        public onHurt(): void {
        }

        public onDeath(): void {
        }

        public onUpdate(deltaTime: number): void {
        }

        public setStatsFromFile(entityTypeName: string): void {
            const data = game.cache.getJSON('entity-stats');
            const stats: any = data["entities"].getByName(entityTypeName);

            // Overwrite stats based on the data for the type of mob.
            this.health = new Mechanics.HealthSystem(stats["maxHP"], this.onHealed, this.onHurt, this.onDeath);
            this.speed = new Mechanics.ModifiableStat("speed", stats["speed"]);
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

        public setMapCollisions(map: Services.Map): void {
            for (let current of map.collisionLayers) {
                game.physics.arcade.collide(current);
            }
        }
    }
}