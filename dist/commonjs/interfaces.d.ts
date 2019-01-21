export interface IResult {
    success: boolean;
    data?: any;
    warn?: IWarn;
    error?: IError;
}
export interface IWarn {
    section: string;
    code: string;
    message?: string;
    data?: any;
}
export interface IError {
    section: string;
    code: string;
    message?: string;
    error?: any;
    data?: any;
}
