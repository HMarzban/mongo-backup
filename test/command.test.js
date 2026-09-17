const { test } = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const { mongodump, mongoexport } = require('../command');

function stubProcess(t, implementation = () => null) {
    const calls = [];
    t.mock.method(childProcess, 'exec', () => assert.fail('A shell must never be invoked'));
    t.mock.method(childProcess, 'execFile', (file, args, options, callback) => {
        calls.push({ file, args, options });
        const error = implementation();
        queueMicrotask(() => callback(error, 'private output', 'private diagnostics'));
    });
    return calls;
}

test('dump sends the correct credential fields and preserves literal shell metacharacters', async t => {
    const calls = stubProcess(t);
    const username = 'test user;$(should-not-run)';
    const password = 'fixture & password `literal`';
    const output = './folder with spaces/backup;still-a-path';
    assert.equal(await mongodump({
        hostName: 'host name', port: 27018, userName: username, password,
        databaseName: 'database;literal', collectionName: '--literal-collection', output, gzip: true,
    }), 'done');
    assert.deepEqual(calls, [{
        file: 'mongodump',
        args: ['--host=host name', '--port=27018', `--username=${username}`, `--password=${password}`,
            '--db=database;literal', '--gzip', '--collection=--literal-collection', `--out=${output}`],
        options: { shell: false },
    }]);
});

test('export requires collection/output and passes each value as a single literal argument', async t => {
    const calls = stubProcess(t);
    assert.equal(await mongoexport({ databaseName: 'db', collectionName: 'users', output: './my file.json',
        userName: 'reader', password: 'fixture password' }), 'done');
    assert.deepEqual(calls[0].args, ['--username=reader', '--password=fixture password', '--db=db',
        '--collection=users', '--out=./my file.json']);
    assert.equal(calls[0].file, 'mongoexport');
    assert.equal(calls[0].options.shell, false);
});

test('archive/gzip and host-only/port-only options are supported', async t => {
    const calls = stubProcess(t);
    await mongodump({ databaseName: 'db', archive: './backup with spaces.gz', gzip: true, hostName: 'localhost' });
    await mongodump({ databaseName: 'db', port: '27017' });
    assert.deepEqual(calls[0].args, ['--host=localhost', '--db=db', '--archive=./backup with spaces.gz', '--gzip']);
    assert.deepEqual(calls[1].args, ['--port=27017', '--db=db']);
});

test('missing and invalid fields reject promises before invoking a process', async t => {
    const calls = stubProcess(t);
    for (const options of [undefined, null, [], {}, { databaseName: '' }, { databaseName: 5 },
        { databaseName: 'db', userName: 'reader' }, { databaseName: 'db', password: 'fixture' },
        { databaseName: 'db', port: 0 }, { databaseName: 'db', port: '27017;echo' },
        { databaseName: 'db', output: 'bad\0path' },
        { databaseName: 'db', archive: 'dump.gz', output: 'folder' }, { databaseName: 'db', gzip: 'yes' }]) {
        await assert.rejects(mongodump(options), TypeError);
    }
    await assert.rejects(mongoexport({ databaseName: 'db' }), /collectionName/);
    await assert.rejects(mongoexport({ databaseName: 'db', collectionName: 'users' }), /output/);
    assert.equal(calls.length, 0);
});

test('process failures reject Error objects without leaking command credentials or logs', async t => {
    const secret = 'fixture-secret';
    const logs = [];
    t.mock.method(console, 'log', (...args) => logs.push(args));
    t.mock.method(console, 'error', (...args) => logs.push(args));
    stubProcess(t, () => Object.assign(new Error(`Failed command --password=${secret}`), { code: 2 }));
    await assert.rejects(mongodump({ databaseName: 'db', userName: 'reader', password: secret }), error => {
        assert.equal(error.name, 'MongoToolError');
        assert.equal(error.code, 2);
        assert.equal(error.message, 'mongodump failed with exit code 2.');
        assert.doesNotMatch(String(error), /fixture-secret/);
        return true;
    });
    assert.deepEqual(logs, []);
});

test('missing tools and synchronous spawn errors reject instead of leaving a pending promise', async t => {
    const calls = stubProcess(t, () => Object.assign(new Error('private arguments'), { code: 'ENOENT' }));
    await assert.rejects(mongodump({ databaseName: 'db' }), /not found on PATH/);
    assert.equal(calls.length, 1);
    t.mock.method(childProcess, 'execFile', () => { throw new TypeError('private argument detail'); });
    await assert.rejects(mongoexport({ databaseName: 'db', collectionName: 'users', output: 'file' }),
        { name: 'MongoToolError', message: 'mongoexport failed.' });
});
