export const encodeDataToString = <TData>(data:TData):string=> encodeURI(JSON.stringify(data));
export const decodeStringToData = <TData>(encoded:string):string=> JSON.parse(decodeURI(encoded));
