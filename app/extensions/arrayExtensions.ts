interface Array<T> {
    getByName: (this: Main.INamed[], name: string) => Main.INamed | null;
}

Array.prototype.getByName = function(name: string) {
    let result: Main.INamed = null;
    for (let current of this) {
        if (current.name !== name)
            continue;

        result = current;
        break;
    }

    return result;
};