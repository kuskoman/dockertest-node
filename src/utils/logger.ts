import { Logger } from "./logger.interfaces";
import { Console } from "console";

export class DefaultLogger implements Logger {
    private readonly stderrConsole = new Console({
        stdout: process.stderr,
        stderr: process.stderr,
    });

    verbose = this.write;
    debug = this.write;
    log = this.write;
    warn = this.write;
    error = this.write;

    private write(...args: any[]) {
        // eslint-disable-next-line no-console
        return this.stderrConsole.log(...args);
    }
}

export class VoidLogger implements Logger {
    verbose = this.doNothing;
    debug = this.doNothing;
    log = this.doNothing;
    warn = this.doNothing;
    error = this.doNothing;

    private doNothing() {}
}
