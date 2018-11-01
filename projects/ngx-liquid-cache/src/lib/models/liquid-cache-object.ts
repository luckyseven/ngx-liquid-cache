export enum LiquidCacheObjectType {
    Observable = 0,
    Static = 1
}

export class LiquidCacheObject {
    key: string;
    value: any;
    type: LiquidCacheObjectType;

    constructor(key: string, value: any, type: LiquidCacheObjectType = LiquidCacheObjectType.Observable) {
        this.key = key;
        this.value = value;
        this.type = type;
    }

    is(type: LiquidCacheObjectType) {
        return this.type === type;
    }
}
