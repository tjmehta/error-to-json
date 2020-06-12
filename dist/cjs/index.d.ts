export default errToJSON;
declare function errToJSON<T extends {}>(err: Error): T;
export declare function parse(json: {
    message: string;
}): Error;
