namespace Main.Services {
    export type InputControl = (Phaser.Key | Phaser.DeviceButton);

    export class InputAxis {
        public constructor(
            public name: string = '',
            public positiveBindings: InputControl[],
            public negativeBindings: InputControl[]
        ) {
        }

        public value(): number {
            let result: number = 0;

            const checkBindingContribution = (binding: InputControl, addedValue: number): number => {
                let contribution: number = 0;
                if (binding instanceof Phaser.Key || binding instanceof Phaser.DeviceButton)
                    if (binding.isDown)
                        contribution = addedValue;

                return contribution;
            };

            for (let current of this.positiveBindings) {
                result += checkBindingContribution(current, 1);
            }

            for (let current of this.negativeBindings) {
                result += checkBindingContribution(current, -1);
            }

            return result;
        }
    }

    export class InputService {
        private cursors: Phaser.CursorKeys;

        public axes: InputAxis[] = [];

        public constructor(
            private game: Phaser.Game
        ) {
        }

        // This should only be ran in state create() methods, so that game.input is
        // set up.
        public initialize(): void {
            this.axes.length = 0; // Clear the axes...
            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.addAxis(
                "horizontal",
                [ this.cursors.right ],
                [ this.cursors.left ]
            );
            this.addAxis(
                "vertical",
                [ this.cursors.down ],
                [ this.cursors.up ]
            );
            this.addAxis(
                "confirm",
                [ this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER) ],
                []
            );
            this.addAxis(
                "cancel",
                [ this.game.input.keyboard.addKey(Phaser.KeyCode.ESC)],
                []
            );
        }

        public addAxis(
            name: string, 
            positiveBindings: (Phaser.Key[] | Phaser.DeviceButton[]), 
            negativeBindings: (Phaser.Key[] | Phaser.DeviceButton[])
        ): void {
            if (this.getAxis(name) != null) {
                console.error(`Axis not registered - ${name} is already registered in the Input Service.`);
                return;
            }

            const axis: InputAxis = new InputAxis(
                name,
                positiveBindings,
                negativeBindings
            );
            this.axes.push(axis);
        }

        public getAxis(name: string): InputAxis {
            let result: InputAxis = null;
            for (let current of this.axes) {
                if (current.name !== name)
                    continue;

                result = current;
                break;
            }

            return result;
        }

        public addHandlerToAxis(
            name: string, 
            positiveHandler?: () => void, 
            negativeHandler?: () => void
        ) {
            if (!positiveHandler && !negativeHandler) {
                console.error(`addHandlerToAxis requires at least a positive or a negative control handler.`);
                return;
            }

            const axis: InputAxis = this.getAxis(name);
            if (axis == null) {
                console.error(`Axis ${axis.name} has not been registered in the Input Service.`);
                return;
            }

            const bindHandler = (
                control: (Phaser.Key | Phaser.DeviceButton),
                handler: () => void
            ) => {
                if (control instanceof Phaser.Key) {
                    control.onDown.add(positiveHandler);
                } else if (control instanceof Phaser.DeviceButton) {
                    control.onDown.add(positiveHandler);
                }
            };

            if (positiveHandler) {
                for (let current of axis.positiveBindings) {
                    bindHandler(current, positiveHandler);
                }
            }

            if (negativeHandler) {
                for (let current of axis.negativeBindings) {
                    bindHandler(current, negativeHandler);
                }
            }
        }

        public removeHandlerFromAxis(
            name: string,
            positiveHandler?: () => void,
            negativeHandler?: () => void
        ): void {
            if (!positiveHandler && !negativeHandler) {
                console.error(`addHandlerToAxis requires at least a positive or a negative control handler.`);
                return;
            }

            const axis: InputAxis = this.getAxis(name);
            if (axis == null) {
                console.error(`Axis ${axis.name} has not been registered in the Input Service.`);
                return;
            }

            const removeHandler = (
                control: (Phaser.Key | Phaser.DeviceButton),
                handler: () => void
            ) => {
                control.onDown.remove(handler);
            };

            if (positiveHandler)
                for (let current of axis.positiveBindings) {
                    removeHandler(current, positiveHandler);
                }

            if (negativeHandler)
                for (let current of axis.negativeBindings) {
                    removeHandler(current, negativeHandler);
                }
        }
    }
}