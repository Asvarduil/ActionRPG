namespace Main.Mechanics {
    export enum SkillLineLevelupType {
        LINEAR,
        EXPONENTIAL,
        LOGARITHMIC
    }

    export class SkillLineLevelupData {
        // Programmer's Notes:
        // -------------------
        // Based on the levelup type, generate a
        // function to raise the amount of XP
        // required to raise a skill line.
        //
        // Linear: ttnl = base + (modifier * previous)
        // Exponential: ttnl = base + (previous ^ modifier)
        // Logarithmic: ttnl = base + previous LOG modifier
        public constructor(
            public type: SkillLineLevelupType = SkillLineLevelupType.LINEAR,
            public base: number = 1,
            public modifier: number = 1
        ) {
        }

        public generateNextXPTNL(): (previous: number) => number {
            switch (this.type) {
                case SkillLineLevelupType.LINEAR:
                    return (previous: number) => this.base + (this.modifier * previous);

                case SkillLineLevelupType.EXPONENTIAL:
                    return (previous: number) => this.base + (previous ^ this.modifier);

                case SkillLineLevelupType.LOGARITHMIC:
                    return (previous: number) => this.base + (previous * Math.log(this.modifier)); 

                default:
                    console.error(`Unexpected levelup type: ${this.type}`);
                    return (previous: number) => this.base;
            }
        }
    }

    export class SkillLine implements INamed {
        public xp: number;
        public xpToNextLevel: number;
        public level: number;

        public constructor(
            public name: string,
            public description: string,
            defaultLevel: number = 1,
            defaultXp: number = 0,
            defaultXpToNextLevel: number = 5,
            public levelupData: SkillLineLevelupData = new SkillLineLevelupData(),
            public onLevelUp?: () => void
        ) {
            this.level = defaultLevel;
            this.xp = defaultXp;
            this.xpToNextLevel = defaultXpToNextLevel;
        }

        public gainXP(amount: number) {
            this.xp += amount;
            if (this.xp >= this.xpToNextLevel) {
                this.xp = this.xp - this.xpToNextLevel;
                this.level++;
                console.log(`${this.name} has increased to ${this.level}`);
                this.xpToNextLevel = this.levelupData.generateNextXPTNL()(this.xpToNextLevel);
                if (this.onLevelUp)
                    this.onLevelUp();
            }
        }

        public loseXP(amount: number) {
            this.xp -= amount;
            if (this.xp <= 0)
                this.xp = 0;
        }

        public clone(): SkillLine {
            const clone = new SkillLine(
                this.name,
                this.description,
                this.level,
                this.xp,
                this.xpToNextLevel,
                this.levelupData,
                this.onLevelUp
            );

            return clone;
        }
    }

    export class SkillLineFactory {
        private skillLines: SkillLine[] = [];

        public constructor() {
        }

        public initialize(): void {
            const data = game.cache.getJSON('skill-line-defaults');
            for (let current of data['skillLines']) {
                const newSkill = new SkillLine(
                    current['name'],
                    current['description'],
                    current['defaultLevel'],
                    current['defaultXp'],
                    current['defaultXpToNextLevel']
                );

                this.skillLines.push(newSkill);
            }
        }

        public generateSkillLines(): SkillLine[] {
            const clone: SkillLine[] = [];

            for (let current of this.skillLines) {
                clone.push(current.clone());
            }

            return clone;
        }
    }
}