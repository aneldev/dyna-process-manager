export var encodeDataToString = function (data) { return encodeURI(JSON.stringify(data)); };
export var decodeStringToData = function (encoded) { return JSON.parse(decodeURI(encoded)); };
//# sourceMappingURL=codeDataString.js.map