namespace Main.Services {
    export class StateService {
        public states: { key: string, state: any}[] = [];

        public constructor(
            public game: Phaser.Game = null
        ) {
        }

        public addState(key: string, state: any): void {
            this.states.push({
                key: key,
                state: state
            });
        }

        public readyStates(): void {
            for (let current of this.states) {
                this.game.state.add(current.key, current.state);
            }
        }

        public startFirstState(): void {
            this.game.state.start(this.states[0].key);
        }

        public load(state: string): void {
            this.game.state.start(state, true, false);
        }

        public overlay(state: string): void {
            this.game.state.start(state, false, false);
        }
    }
}