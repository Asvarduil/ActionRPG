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

        public fadeOut( 
            onComplete: () => void, 
            durationMs: number = 1000, 
            fadeColor: number = 0x000000
        ): void {
            const onNextFadeDone = () => {
                onComplete();
                game.camera.onFadeComplete.removeAll();
            };
            game.camera.onFadeComplete.add(onNextFadeDone);
            game.camera.fade(fadeColor, durationMs);
        }

        public fadeIn(
            onComplete: () => void,
            durationMs: number = 1000,
            fadeColor: number = 0x000000
        ): void {
            const onNextFadeDone = () => {
                onComplete();
                game.camera.onFlashComplete.removeAll();
            };
            game.camera.onFlashComplete.add(onNextFadeDone);
            game.camera.flash(fadeColor, durationMs);
        }
    }
}