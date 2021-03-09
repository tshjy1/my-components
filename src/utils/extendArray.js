Array.prototype.includes =
    Array.prototype.includes ||
    function(searchElement, fromIndex) {
        if (this === null) {
            throw new TypeError('"this" is null or not defined');
        }

        let that = Object(this),
            len = that.length >>> 0,
            index = fromIndex | 0;

        if (len === 0) {
            return false;
        }

        let startIndex = Math.max(index >= 0 ? index : len - Math.abs(index), 0);

        while (startIndex < len) {
            if (String(that[startIndex]) === String(searchElement)) {
                return true;
            }

            startIndex++;
        }

        return false;
    };
