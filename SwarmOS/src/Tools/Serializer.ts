export class Serializer {
    static SerializeMap<K, V>(map: Map<K, V>): string {
        let convertedToArray: [K, V][] = [];
        let iter = map.entries();
        let curEntry = iter.next();
        while (!curEntry.done) {
            convertedToArray.push([curEntry.value[0], curEntry.value[1]]);
            curEntry = iter.next();
        }

        return JSON.stringify(convertedToArray);
    }

    static DeserializeMap<K, V>(serializedString: string): Map<K, V> {
        let convertedArray: [K, V][] = JSON.parse(serializedString);
        let map = new Map<K, V>();
        for (let i = 0, length = convertedArray.length; i < length; i++) {
            map.set(convertedArray[i][0], convertedArray[i][1]);
        }

        return map;
    }
}