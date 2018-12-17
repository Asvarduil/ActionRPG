namespace Main.Entities {
    export class Trigger {
        public gameObject: Phaser.Sprite = null;
        public isTriggered: boolean = false;

        public constructor(
            public x: number,
            public y: number,
            public width: number,
            public height: number,
            public onEnter: (gameObject: Phaser.Sprite, other: ICollidableObject) => void
        ) {
            const spriteData = game.add.bitmapData(width, height).fill(0, 0, 0, 0);

            this.gameObject = game.add.sprite(x, y, spriteData);
            this.gameObject.scale = new Phaser.Point(gfxMagnification, gfxMagnification);

            this.readyPhysics();
        }

        private readyPhysics(): void {
            game.physics.enable(this.gameObject, Phaser.Physics.ARCADE);
            this.gameObject.anchor.set(0.5, 0.5);

            const body = this.body();
            body.immovable = true;
            body.bounce.setTo(0);
            body.collideWorldBounds = true;
        }

        public body(): Phaser.Physics.Arcade.Body {
            return <Phaser.Physics.Arcade.Body>this.gameObject.body;
        }

        public checkOverlapsWith(other: any): void {
            let collidableObject: ICollidableObject;
            switch (other.constructor) {
                case Entities.Mob:
                case Entities.Player:
                    collidableObject = <Mob>(other).gameObject;
                    break;

                default:
                    collidableObject = other;
                    break;
            }

            this.isTriggered = game.physics.arcade.overlap(this.gameObject, collidableObject, this.onEnter);
        }
    }
}