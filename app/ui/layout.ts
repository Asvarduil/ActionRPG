namespace Main.UI {
    export interface IUILayoutElement extends INamed {
        type: string,
        name: string,
        x: number,
        y: number,
        style: string
    }

    export interface IUILayout extends INamed {
        name: string,
        elements: IUILayoutElement[]
    }

    export type ILayoutElement = INamedPhaserText | ResourceGauge

    export class Layout {
        public elements: ILayoutElement[] = [];

        public constructor(layoutKey: string) {
            this.generateElements(layoutKey);
        }

        public getElement(elementKey: string): ILayoutElement {
            return <ILayoutElement>this.elements.getByName(elementKey);
        }

        public generateElements(layoutKey: string): void {
            const layoutData = game.cache.getJSON('ui-layouts');
            const chosenLayout = <IUILayout>(layoutData['layouts'].getByName(layoutKey));
            if (chosenLayout == null) {
                console.error(`UI Layout ${layoutKey} doesn't exist in the layouts JSON file.`);
                return;
            }

            for (let current of chosenLayout.elements) {
                switch (current.type) {
                    case "text":
                        const newText: INamedPhaserText = textFactory.create(
                            current.name,
                            current.x,
                            current.y,
                            current.style
                        );
                        this.elements.push(newText);
                        break;

                    case "gauge":
                        const newGauge: ResourceGauge = resourceGaugeFactory.create(
                            current.name,
                            current.x,
                            current.y,
                            current.style
                        );
                        this.elements.push(newGauge);
                        break;

                    default:
                        console.warn(`Element ${current.name} won't be added, as element type ${current.type} has no generation behavior defined.`);
                        break;
                }
            }
        }
    }
}