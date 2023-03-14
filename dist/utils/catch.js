"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Catch = void 0;
function Catch(callback) {
    try {
        callback();
    }
    catch (e) {
        console.log(e);
    }
}
exports.Catch = Catch;
