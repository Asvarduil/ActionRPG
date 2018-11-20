namespace Main.Mechanics {
    export class HealthSystem {
        public HP: number;
        public workingMaxHP: number;

        public constructor(
            public maxHP: number,
            public onHealed: () => void,
            public onHurt: () => void,
            public onDeath: () => void
        ) {
            this.HP = this.maxHP;
        }

        public heal(amount: number): void {
            if (amount <= 0)
                return;

            const preHealHP: number = this.HP;
            this.HP += amount;
            if (this.HP >= this.workingMaxHP)
                this.HP = this.workingMaxHP;

            const postHealHP: number = this.HP;

            if (preHealHP !== postHealHP)
                this.onHealed();
        }

        public harm(amount: number): void {
            if (amount <= 0)
                return;

            const preHurtHP: number = this.HP;

            this.HP -= amount;
            if (this.HP <= 0)
                this.HP = 0;

            const postHurtHP: number = this.HP;

            if (preHurtHP !== postHurtHP) {
                this.onHurt();
                this.checkForDeath();
            }
        }

        public checkForDeath(): void {
            if (this.HP >= 0)
                return;

            this.onDeath();
        }

        public augment(amount: number): void {
            this.workingMaxHP += amount;
            if (this.workingMaxHP > this.maxHP)
                this.workingMaxHP = this.maxHP;
        }

        public diminish(amount: number): void {
            this.workingMaxHP -= amount;
            if (this.workingMaxHP > this.HP) {
                this.HP = this.workingMaxHP;
                this.onHurt();
                this.checkForDeath();
            }
        }
    }
}