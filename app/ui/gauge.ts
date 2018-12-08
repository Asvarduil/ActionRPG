namespace Main.UI {
    export interface IResourceGaugeStyleData 
        extends INamed {
        name: string;
        backgroundWidth?: number;
        foregroundWidth?: number;
        backgroundHeight?: number;
        foregroundHeight?: number;
        backgroundOffsetX?: number;
        foregroundOffsetX?: number;
        backgroundOffsetY?: number;
        foregroundOffsetY?: number;
        backgroundImageKey?: string;
        foregroundImageKey?: string;
        backgroundColor?: string;
        foregroundColor?: string;
    }

    export class ResourceGauge {
        private background: Phaser.Sprite = null;
        private foreground: Phaser.Sprite = null;

        public constructor(
            public x: number,
            public y: number,
            public resource: Mechanics.Resource,
            public style: IResourceGaugeStyleData
        ) {
            const bgData = game.add.bitmapData(
                style.backgroundWidth, 
                style.backgroundHeight
            );
            const fgData = game.add.bitmapData(
                style.foregroundWidth,
                style.foregroundHeight
            );

            if (this.style.backgroundColor && this.style.foregroundColor) {
                bgData.ctx.beginPath();
                fgData.ctx.beginPath();

                bgData.ctx.rect(0, 0, 2, 2);
                fgData.ctx.rect(0, 0, 2, 2);

                bgData.ctx.fillStyle = style.backgroundColor;
                fgData.ctx.fillStyle = style.foregroundColor;

                bgData.ctx.fill();
                fgData.ctx.fill();

                this.background = game.add.sprite(
                    this.x, 
                    this.y, 
                    bgData
                );
                this.foreground = game.add.sprite(
                    this.x + this.style.foregroundOffsetX, 
                    this.y + this.style.foregroundOffsetY, 
                    fgData
                );
            } else if (this.style.backgroundImageKey && this.style.foregroundImageKey) {
                this.background = game.add.sprite(
                    this.x,
                    this.y,
                    this.style.backgroundImageKey
                );
                this.foreground = game.add.sprite(
                    this.x + this.style.foregroundOffsetX,
                    this.y + this.style.foregroundOffsetY,
                    this.style.foregroundImageKey
                );
            } else {
                console.error(`Gauge style ${this.style.name} requires either a bg/fg image key or a bg/fg style.  This type of gauge will throw errors.`);
            }

            this.background.fixedToCamera = true;
            this.foreground.fixedToCamera = true;

            let bgWidth = 0;
            let bgHeight = 0;
            let fgWidth = 0;
            let fgHeight = 0;

            if (this.isHorizontalGauge()) {
                bgHeight = this.style.backgroundHeight;
                fgHeight = this.style.foregroundHeight;

                bgWidth = this.style.backgroundWidth;
                const newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                fgWidth = newWidth;
            } else {
                bgWidth = this.style.backgroundWidth;
                fgWidth = this.style.foregroundWidth;

                bgHeight = this.style.backgroundHeight;
                const newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                fgHeight = newHeight;
            }

            this.background.scale.setTo(bgWidth, bgHeight);
            this.foreground.scale.setTo(fgWidth, fgHeight);
        }

        private isHorizontalGauge(): boolean {
            if (this.style.foregroundWidth && this.style.backgroundWidth)
                return false;
            else if (this.style.foregroundHeight && this.style.backgroundHeight)
                return true;
            else {
                console.error(`Gauge ${this.style.name} requires either bg/fg heights and/or bg/fg widths.`);
                return false;
            }
        }

        public update(): void {
            if (this.isHorizontalGauge()) {
                const newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                game.add.tween(this.foreground.scale).to(
                    { 'x': newWidth },
                    500,
                    Phaser.Easing.Linear.None,
                    true
                );
            } else {
                const newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                game.add.tween(this.foreground.scale).to(
                    { 'y': newHeight },
                    500,
                    Phaser.Easing.Linear.None,
                    true
                );
            }
        }
    }

    export class ResourceGaugeFactory {
        public styles: IResourceGaugeStyleData[] = [];

        public constructor() {
        }

        public initialize(): void {
            const data = game.cache.getJSON('ui-styles');
            const gaugeData = data["gauges"];
            for (let current of gaugeData) {
                this.styles.push(current);
            }
        }

        public create(
            x: number,
            y: number,
            resource: Mechanics.Resource,
            style?: string
        ): ResourceGauge {
            let gaugeStyle: IResourceGaugeStyleData;
            if (!style) {
                if (this.styles.length === 0) {
                    console.error(`Styles need to be added for Gauges.`);
                    return null;
                }

                gaugeStyle = this.styles[0];
            } else {
                gaugeStyle = this.styles.getByName(style);
                if (gaugeStyle == null) {
                    console.error(`There's no Gauge style named ${style}`);
                    console.error(`${JSON.stringify(this.styles)}`);
                    return null;
                }
            }
            
            const gauge = new ResourceGauge(x, y, resource, gaugeStyle);
            return gauge;
        }
    }
}