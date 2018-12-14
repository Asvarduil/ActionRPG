namespace Main.Entities {
    export class Trigger {
        public gameObject: Phaser.Sprite = null;

        public constructor(
            public x: number,
            public y: number,
            public width: number,
            public height: number,
            spriteScale: number = 1
        ) {
            const spriteData = game.add.bitmapData(width, height).fill(0, 0, 0, 0);

            this.gameObject = game.add.sprite(x, y, spriteData);
            this.gameObject.scale = new Phaser.Point(spriteScale, spriteScale);

            this.readyPhysics();
        }

        private readyPhysics(): void {
            game.physics.enable(this.gameObject, Phaser.Physics.ARCADE);
            this.gameObject.anchor.set(0.5, 0.5);
        }

        public body(): Phaser.Physics.Arcade.Body {
            return <Phaser.Physics.Arcade.Body>this.gameObject.body;
        }

        public checkOverlapsWith(other: any, onStay: () => void): void {
            let collidableObject: ICollidableObject;
            switch (other.constructor) {
                case Mob:
                    collidableObject = <Mob>(other).gameObject;
                    break;

                default:
                    collidableObject = other;
                    break;
            }

            game.physics.arcade.overlap(this.gameObject, other, onStay);
        }
    }
}