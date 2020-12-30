declare namespace KaiLogs {
    /**
     * Creates a new file for logging.
     * @param path A path to a file where the log is created.
     * @example KaiLogs.createLog('../logs')
     */
    export function createLog(
        path: string
    )

    /**
     * Loads the latest log and continues to write to the log.
     * @param path A path to a file. If file doesn't exist a new one will be created.
     * @example KaiLogs.loadLog('../logs')
     */
    export function loadLog(
        path: string
    )

    /**
     * Prints to the console and logs as debug'.
     * @param message A message that gets logged.
     * @param where Where the debug took place. Default: 'main'
     * @example KaiLogs.debug("Debug!", "main")
     */
    export function debug(
        message: string,
        where?: "main" | "clnt" | "cmnd" | "dtbs" | "evnt" | "fnct" | "atmd"
    )

    /**
     * Deletes a log file.
     * @param path The path to a specific file.
     * @example KaiLogs.delete('../logs/latest.log')
     */
    export function deleteLog(
        path: string
    )

    /**
     * Prints to the console and logs as an error.
     * @param message A message that gets logged.
     * @param where Where the debug took place. Default: 'main'
     * @example KaiLogs.error("Error!", "main")
     */
    export function error(
        message: string,
        where?: "main" | "clnt" | "cmnd" | "dtbs" | "evnt" | "fnct" | "atmd"
    )

    /**
     * Prints to the console and logs as a 'INFO'.
     * @param message A message that gets logged.
     * @param where Where the debug took place. Default: 'main'
     * @example KaiLogs.log("Log me!", "main")
     */
    export function log(
        message: string,
        where?: "main" | "clnt" | "cmnd" | "dtbs" | "evnt" | "fnct" | "atmd"
    )

    /**
     * Saves the loaded log.
     * @param fileName Name of the file.
     * @example KaiLogs.save() saves as 'YYYY-MM-DD.log'
     * @example KaiLogs.save('Restart') saves as 'Restart-YYYY-MM-DD.log'
     */
    export function save(
        fileName?: string
    )

    /**
     * Prints to the console and logs as a warning.
     * @param message A message that gets logged.
     * @param where Where the debug took place. Default: 'main'
     * @example KaiLogs.warn("Warning!", "main")
     */
    export function warn(
        message: string,
        where?: "main" | "clnt" | "cmnd" | "dtbs" | "evnt" | "fnct" | "atmd"
    )

    /**
     * Only prints to the console. Does not get logged.
     * @param message A message that gets printed.
     * @param where Where the debug took place. Default: 'main'
     * @param type The type of log. Default: 'DEBUG'
     * @example KaiLogs.write("Don't log this!", "main", "INFO")
     */
    export function write(
        message: string,
        where?: "main" | "clnt" | "cmnd" | "dtbs" | "evnt" | "fnct" | "atmd",
        type?: "DEBUG" | "INFO" | "WARN" | "ERROR"
    )

    /**
     * Saves the log and overwrites the a file exists
     * @example KaiLogs.overwrite()
     */
    export function overwrite()
}

export = KaiLogs