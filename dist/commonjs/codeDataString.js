"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDataToString = function (data) { return encodeURI(JSON.stringify(data)); };
exports.decodeStringToData = function (encoded) { return JSON.parse(decodeURI(encoded)); };
//# sourceMappingURL=codeDataString.js.map