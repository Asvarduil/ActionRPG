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
        public resources: Mechanics.Resource[] = [];
        public stats: Mechanics.ModifiableStat[] = [];
        public skillLines: Mechanics.SkillLine[] = [];

        public onSkillUp: (skill: Mechanics.SkillLine) => void;

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
            
            // Create the actual game object for the mob.
            this.gameObject = game.add.tileSprite(x, y, tileSize, tileSize, imageKey);
            this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);
            if (enablePhysics) {
                game.physics.arcade.enable(this.gameObject);
                // ...Had no effect...
                //this.gameObject.body.tilePadding.set(32, 32);
            }

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
            const entityData: any = data["entities"].getByName(entityTypeName);

            // Overwrite stats based on the data for the type of mob.
            this.health = new Mechanics.HealthSystem(entityData["maxHP"], this.onHealed, this.onHurt, this.onDeath);
            for (let current of entityData["resources"]) {
                const loadedResource = new Mechanics.Resource(
                    current["name"],
                    current["value"]
                );

                this.resources.push(loadedResource);
            }

            for (let current of entityData["stats"]) {
                const loadedStat = new Mechanics.ModifiableStat(
                    current["name"],
                    current["value"]
                );

                this.stats.push(loadedStat);
            }
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

        public getStatByName(name: string): Mechanics.ModifiableStat {
            return <Mechanics.ModifiableStat>this.stats.getByName(name);
        }

        public getSkillLineByName(name: string): Mechanics.SkillLine {
            return <Mechanics.SkillLine>this.skillLines.getByName(name);
        }

        public getResourceByName(name: string): Mechanics.Resource {
            return <Mechanics.Resource>this.resources.getByName(name);
        }

        public addXpForSkill(
            xp: number,
            skill: string
        ): void {
            const skillLine: Mechanics.SkillLine = this.getSkillLineByName(skill);
            if (!skillLine) {
                console.error(`Skill line ${skill} does not exist.  Can't get XP for that line.`);
                return;
            }

            const preXpLevel = skillLine.level;
            skillLine.gainXP(xp);
            const postXpLevel = skillLine.level;

            if (postXpLevel > preXpLevel) {
                if (this.onSkillUp)
                    this.onSkillUp(skillLine);
            }
        }

        public getLevelForSkill(
            skill: string
        ): number {
            const skillLine = this.getSkillLineByName(skill);
            if (!skillLine) {
                console.error(`Skill line ${skill} does not exist.  Can't get XP for that line.`);
                return -1;
            }

            return skillLine.level;
        }

        public addAnimation(key: string, frames: number[], isLooped: boolean = true): Phaser.Animation {
            return this.gameObject.animations.add(key, frames, this.frameRate, isLooped);
        }

        public checkCollisionWith(other: any): void {
            game.physics.arcade.collide(this.gameObject, other);
        }

        public checkMapCollisions(map: Services.Map): void {
            for (let collisionLayer of map.collisionLayers) {
                this.checkCollisionWith(collisionLayer);
            }
            // this.checkCollisionWith(map.map);
        }
    }
}