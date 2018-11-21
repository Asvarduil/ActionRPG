namespace Main.Mechanics {
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