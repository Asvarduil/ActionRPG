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
                if (this.onChange)
                    this.onChange();
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
                if (this.onChange)
                    this.onChange();

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
                    if (this.onChange)
                        this.onChange();
            }
        }
    }
}