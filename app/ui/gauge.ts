namespace Main.UI {
    export interface IResourceGaugeStyleData {
        name: string;
        isHorizontal?: boolean;
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

    export class ResourceGauge implements INamed {
        private background: Phaser.Sprite = null;
        private foreground: Phaser.Sprite = null;

        public constructor(
            public name: string,
            public x: number,
            public y: number,
            public style: IResourceGaugeStyleData,
            public resource?: Mechanics.Resource,
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

            if (this.style.isHorizontal) {
                bgHeight = this.style.backgroundHeight;
                bgWidth = this.style.backgroundWidth;

                fgHeight = this.style.foregroundHeight;
                let newWidth: number;
                if (resource)
                    newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                else
                    newWidth = 0;

                fgWidth = newWidth;
            } else {
                bgWidth = this.style.backgroundWidth;
                bgHeight = this.style.backgroundHeight;
                
                fgWidth = this.style.foregroundWidth;
                let newHeight: number;
                if (resource)
                    newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                else
                    newHeight = 0;

                fgHeight = newHeight;
            }

            this.background.scale.setTo(bgWidth, bgHeight);
            this.foreground.scale.setTo(fgWidth, fgHeight);
        }

        public bindResource(resource: Mechanics.Resource): void {
            this.resource = resource;
            this.update();
        }

        public update(): void {
            if (this.style.isHorizontal) {
                const newWidth = (this.resource.current / this.resource.workingMax) * this.style.foregroundWidth;
                this.foreground.scale.x = newWidth;
            } else {
                const newHeight = (this.resource.current / this.resource.workingMax) * this.style.foregroundHeight;
                this.foreground.scale.y = newHeight;
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
            name: string,
            x: number,
            y: number,
            style?: string,
            resource?: Mechanics.Resource
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
            
            const gauge = new ResourceGauge(name, x, y, gaugeStyle, resource);
            return gauge;
        }
    }
}