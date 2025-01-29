import { pantryStore, categoriesStore } from '../lib/stores/pantryStore';

describe('pantryStore tests', () => {
    test('pantryStore should initialize as an empty array', () => {
        let value;
        pantryStore.subscribe(v => value = v)(); // 订阅 store
        expect(value).toEqual([]); // 检查初始值
    });

    test('pantryStore should update with new items', () => {
        let value;
        pantryStore.set(['Apples', 'Bananas']); // 设置新数据
        pantryStore.subscribe(v => value = v)();
        expect(value).toEqual(['Apples', 'Bananas']);
    });

    test('pantryStore should reset to an empty array', () => {
        let value;
        pantryStore.set([]); // 重置为空
        pantryStore.subscribe(v => value = v)();
        expect(value).toEqual([]); // 确保它被清空
    });
});

describe('categoriesStore tests', () => {
    test('categoriesStore should initialize as an empty array', () => {
        let value;
        categoriesStore.subscribe(v => value = v)();
        expect(value).toEqual([]);
    });

    test('categoriesStore should update with new categories', () => {
        let value;
        categoriesStore.set(['Fruits', 'Vegetables']);
        categoriesStore.subscribe(v => value = v)();
        expect(value).toEqual(['Fruits', 'Vegetables']);
    });
});
