export const encodeDataToString = <TData>(data: TData): string => encodeURI(JSON.stringify(data));
export const decodeStringToData = <TData>(encoded: string): TData => JSON.parse(decodeURI(encoded));
