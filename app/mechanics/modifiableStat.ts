namespace Main.Mechanics {
    export class ModifiableStat implements INamed {
        public scalingModifier: number = 1.0;
        public staticModifier: number = 0.0;

        public constructor(
            public name: string,
            public value: number
        ) {

        }

        public modifiedValue(): number {
            return (this.value * this.scalingModifier) + this.staticModifier;
        }

        public addBaseValue(baseChange: number): void {
            this.value += baseChange;
        }

        public addScaledEffect(scalingChange: number): void {
            this.scalingModifier += scalingChange;
        }

        public addStaticEffect(staticChange: number): void {
            this.scalingModifier += staticChange;
        }

        public clearModifiers(): void {
            this.scalingModifier = 1.0;
            this.staticModifier = 0.0;
        }
    }
}