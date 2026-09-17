const childProcess = require('node:child_process');

function stringOption(options, name, required = false) {
    const value = options[name];
    if (value === undefined && !required) return undefined;
    if (typeof value !== 'string' || (required && value.trim() === '') || value.includes('\0')) {
        throw new TypeError(`${name} must be ${required ? 'a nonempty' : 'a'} string without null bytes.`);
    }
    return value;
}

function commonArguments(options) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new TypeError('options must be an object.');
    }
    const args = [];
    const host = stringOption(options, 'hostName');
    if (host !== undefined) args.push(`--host=${host}`);
    if (options.port !== undefined) {
        const port = String(options.port);
        if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
            throw new TypeError('port must be an integer from 1 to 65535.');
        }
        args.push(`--port=${port}`);
    }
    const username = stringOption(options, 'userName');
    const password = stringOption(options, 'password');
    if ((username === undefined) !== (password === undefined)) {
        throw new TypeError('userName and password must be supplied together.');
    }
    if (username !== undefined) {
        args.push(`--username=${username}`, `--password=${password}`);
    }
    args.push(`--db=${stringOption(options, 'databaseName', true)}`);
    return args;
}

function execute(tool, args) {
    return new Promise((resolve, reject) => {
        const failed = error => {
            // execFile's error.message may include the complete command and credentials.
            // Do not echo arguments, stdout, stderr, or the raw child-process error.
            const message = error.code === 'ENOENT'
                ? `${tool} was not found on PATH.`
                : `${tool} failed${typeof error.code === 'number' ? ` with exit code ${error.code}` : ''}.`;
            const failure = new Error(message);
            failure.name = 'MongoToolError';
            if (typeof error.code === 'number' || /^[A-Z_]+$/.test(error.code || '')) failure.code = error.code;
            reject(failure);
        };
        try {
            childProcess.execFile(tool, args, { shell: false }, error => {
                if (error) return failed(error);
                resolve('done');
            });
        } catch (error) {
            failed(error);
        }
    });
}

/** Binary BSON backup through MongoDB Database Tools; no shell is invoked. */
async function mongodump(options) {
    const args = commonArguments(options);
    const archive = stringOption(options, 'archive');
    const output = stringOption(options, 'output');
    const collection = stringOption(options, 'collectionName');
    if (archive !== undefined && output !== undefined) {
        throw new TypeError('archive and output cannot be used together.');
    }
    if (options.gzip !== undefined && typeof options.gzip !== 'boolean') {
        throw new TypeError('gzip must be a boolean.');
    }
    if (archive !== undefined) args.push(`--archive=${archive}`);
    if (options.gzip) args.push('--gzip');
    if (collection !== undefined) args.push(`--collection=${collection}`);
    if (output !== undefined) args.push(`--out=${output}`);
    return execute('mongodump', args);
}

/** JSON collection export, not a full-fidelity BSON backup. */
async function mongoexport(options) {
    const args = commonArguments(options);
    args.push(`--collection=${stringOption(options, 'collectionName', true)}`);
    args.push(`--out=${stringOption(options, 'output', true)}`);
    return execute('mongoexport', args);
}

module.exports = { mongodump, mongoexport };
