namespace Main.Mechanics {
    export class Resource implements INamed {
        public current: number;
        public workingMax: number;

        public onChange: () => void;

        public constructor(
            public name: string,
            public max: number
        ) {
            this.current = this.max;
            this.workingMax = this.max;
        }

        public hasEnough(amount: number): boolean {
            return this.current >= amount;
        }

        public gain(amount: number): void {
            const preGain = this.current;

            this.current += amount;
            if (this.current > this.workingMax)
                this.current = this.workingMax;

            const postGain = this.current;
            if(preGain != postGain)
                this.fireChangeEvent();
        }

        public consume(amount: number): boolean {
            if (!this.hasEnough(amount))
                return false;

            const preConsume = this.current;
            this.current -= amount;
            if (this.current <= 0)
                this.current = 0;

            const postConsume = this.current;
            if (preConsume != postConsume)
                this.fireChangeEvent();

            return true;
        }

        public augment(amount: number): void {
            this.workingMax += amount;
            if (this.workingMax > this.max)
                this.workingMax = this.max;
        }

        public diminish(amount: number): void {
            this.workingMax -= amount;
            if (this.workingMax <= 0)
                this.workingMax = 0;

            if (this.current >= this.workingMax) {
                const preDiminish = this.current;
                this.current = this.workingMax;
                if (this.current < 0)
                    this.current = 0;

                const postDiminish = this.current;
                if (preDiminish != postDiminish)
                    this.fireChangeEvent();
            }
        }

        protected fireChangeEvent(): boolean {
            if (!this.onChange)
                return false;

            this.onChange();
            return true;
        }
    }

    export class HealthSystem extends Resource {
        public constructor(
            public max: number,
            public onHealed: () => void,
            public onHurt: () => void,
            public onDeath: () => void
        ) {
            super("Health", max);
        }

        public gain(amount: number): void {
            if (amount <= 0)
                return;

            const preHealHP: number = this.current;
            this.current += amount;
            if (this.current >= this.workingMax)
                this.current = this.workingMax;

            const postHealHP: number = this.current;

            if (preHealHP !== postHealHP) {
                this.fireChangeEvent();

                this.onHealed();
            }
        }

        public consume(amount: number): boolean {
            if (amount <= 0)
                return false;

            const preHurtHP: number = this.current;

            this.current -= amount;
            if (this.current <= 0)
                this.current = 0;

            const postHurtHP: number = this.current;

            if (preHurtHP !== postHurtHP) {
                this.fireChangeEvent();

                this.onHurt();
                this.checkForDeath();
                return true;
            }

            return false;
        }

        public checkForDeath(): void {
            if (this.current >= 0)
                return;

            this.onDeath();
        }

        public diminish(amount: number): void {
            this.workingMax -= amount;
            if (this.workingMax > this.current) {
                this.current = this.workingMax;

                this.fireChangeEvent();

                this.onHurt();
                this.checkForDeath();
            }
        }
    }
}