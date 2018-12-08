namespace Main.Mechanics {
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
                if (this.onChange)
                    this.onChange();

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
                if (this.onChange)
                    this.onChange();

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

                if (this.onChange)
                    this.onChange();

                this.onHurt();
                this.checkForDeath();
            }
        }
    }
}