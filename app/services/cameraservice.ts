namespace Main.Services {
    export class CameraService {
        public constructor() {

        }

        public bindCamera(mob: Entities.Mob): void {
            game.camera.follow(mob.gameObject.animations.sprite);
        }

        public pan(x: number, y: number): void {
            game.camera.x += x;
            game.camera.y += y;
        }
    }
}