import { Stream } from "stream";

export const getEmptyStream = (): NodeJS.WritableStream =>
    new Stream.Writable({
        write: (_data) => {
            _data;
        },
    });
