namespace Main.Services {
    export type InputControl = (Phaser.Key | Phaser.DeviceButton);

    export class InputAxis implements INamed {
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

        public isPressed(): boolean {
            let result: boolean = false;

            const checkBindingState = (binding: InputControl): boolean => {
                if (binding instanceof Phaser.Key || binding instanceof Phaser.DeviceButton)
                    return binding.isDown;

                return false;
            }

            for (let current of this.positiveBindings) {
                result = result || checkBindingState(current);
            }

            for (let current of this.negativeBindings) {
                result = result || checkBindingState(current);
            }

            return result;
        }
    }

    export class InputService {
        private cursors: Phaser.CursorKeys;
        private pad: Phaser.SinglePad;

        public axes: InputAxis[] = [];

        public constructor() {
        }

        // This should only be ran in state create() methods, so that game.input is
        // set up.
        public initialize(): void {
            this.axes.length = 0; // Clear the axes...
            this.cursors = game.input.keyboard.createCursorKeys();

            // TODO: ...Can we make a factory, and source these bindings from JSON?
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
                "dash",
                [ game.input.keyboard.addKey(Phaser.KeyCode.SHIFT) ]
            );
            this.addAxis(
                "attack",
                [ game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR) ]
            );
            this.addAxis(
                "block",
                [ game.input.keyboard.addKey(Phaser.KeyCode.TAB) ]
            );
            this.addAxis(
                "confirm",
                [ game.input.keyboard.addKey(Phaser.KeyCode.ENTER) ]
            );
            this.addAxis(
                "cancel",
                [ game.input.keyboard.addKey(Phaser.KeyCode.ESC) ]
            );

            // this.pad = this.game.input.gamepad.pad1;
            // this.pad.addCallbacks(this, {
            //     onConnect: this.addGamepadSupport
            // });
        }

        // public addGamepadSupport(): void {
        //     const vAxis = this.getAxis('vertical');
        //     const hAxis = this.getAxis('horizontal');
        //     const dash = this.getAxis('dash');
        //     const confirm = this.getAxis('confirm');
        //     const cancel = this.getAxis('cancel');
        //     const attack = this.getAxis('attack');
        //     const block = this.getAxis('block');

        //     // TODO: Detect common gamepad types, and set the gamepad up as appropriate.
        //     const dpadUp = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP);
        //     const dpadDown = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN);
        //     const dpadLeft = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT);
        //     const dpadRight = this.pad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT);
        //     const dpadA = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
        //     const dpadB = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
        //     const dpadX = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
        //     const dpadY = this.pad.getButton(Phaser.Gamepad.XBOX360_A);
        //     const dpadL2 = this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER);
        //     const dpadR2 = this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

        //     vAxis.positiveBindings.push(dpadUp);
        //     vAxis.negativeBindings.push(dpadDown);
        //     hAxis.positiveBindings.push(dpadRight);
        //     hAxis.negativeBindings.push(dpadLeft);
        //     dash.positiveBindings.push(dpadX);
        //     confirm.positiveBindings.push(dpadA);
        //     cancel.positiveBindings.push(dpadB);
        //     attack.positiveBindings.push(dpadR2);
        //     block.positiveBindings.push(dpadL2);
        // }

        public addAxis(
            name: string, 
            positiveBindings?: (Phaser.Key[] | Phaser.DeviceButton[]), 
            negativeBindings?: (Phaser.Key[] | Phaser.DeviceButton[])
        ): void {
            if (this.getAxis(name) != null) {
                console.error(`Axis not registered - ${name} is already registered in the Input Service.`);
                return;
            }

            if (!positiveBindings && !negativeBindings) {
                console.error(`Axis ${name} requires at least a positive or a negative binding to be registered.`);
                return;
            }

            if (!positiveBindings)
                positiveBindings = [];

            if (!negativeBindings)
                negativeBindings = [];

            const axis: InputAxis = new InputAxis(
                name,
                positiveBindings,
                negativeBindings
            );
            this.axes.push(axis);
        }

        public getAxis(name: string): InputAxis {
            return <InputAxis>(this.axes.getByName(name));
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