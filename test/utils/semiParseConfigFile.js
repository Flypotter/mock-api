const pathUtil = require('path');
const tap = require('tap');
const toNiceJson = require('../../testUtils/toNiceJson.js');

tap.test('normal parse function', tap => {
    const configFileContent = `

    # some comment
    # some comment
	  # a tab and two spaces
    basic general config
    multiple   spaces  # comment after line
        tab	as a white space
    one config line \\
    writen in \\
    multiple lines
    `;

    const configFolder = tap.testdir({
        config: configFileContent
    });
    const configFilePath = pathUtil.resolve(configFolder, 'config');

    const semiParseConfigFile = require('../../src/utils/semiParseConfigFile.js');
    const semiParseResult = semiParseConfigFile(configFilePath);
    tap.matchSnapshot(toNiceJson(semiParseResult), 'semi parse result');
    tap.end();
});

tap.test('backslash is the last character of the file', tap => {
    const configFileContent = `
    backslash is the last character of the file
    \\`;

    const configFolder = tap.testdir({
        config: configFileContent
    });
    const configFilePath = pathUtil.resolve(configFolder, 'config');

    const semiParseConfigFile = require('../../src/utils/semiParseConfigFile.js');
    const semiParseResult = semiParseConfigFile(configFilePath);
    tap.matchSnapshot(toNiceJson(semiParseResult), 'semi parse result');
    tap.end();
});

tap.test('no effective config content', tap => {
    const configFileContent = `

    # some comment
    # some comment
	  # a tab and two spaces

    `;

    const configFolder = tap.testdir({
        config: configFileContent
    });
    const configFilePath = pathUtil.resolve(configFolder, 'config');

    const semiParseConfigFile = require('../../src/utils/semiParseConfigFile.js');
    const semiParseResult = semiParseConfigFile(configFilePath);
    tap.type(semiParseResult, Array);
    tap.equal(semiParseResult.length, 0);
    tap.end();
});

tap.test('config file path is not ok', tap => {
    const configFolder = tap.testdir({
        config: {},
    });
    const semiParseConfigFile = require('../../src/utils/semiParseConfigFile.js');
    let configFilePath = pathUtil.resolve(configFolder, 'config');
    tap.throws(() => semiParseConfigFile(configFilePath), 'a folder path should throw');
    configFilePath = pathUtil.resolve(configFolder, 'configgg');
    tap.throws(() => semiParseConfigFile(configFilePath), 'a non-exist path should throw');
    tap.end();
});

tap.test('config file is not readable', tap => {
    const configFolder = tap.testdir({
        config: '',
    });
    const semiParseConfigFile = tap.mock('../../src/utils/semiParseConfigFile.js', {
        fs: {
            readFileSync: () => { throw new Error('read file error'); },
            existsSync: () => true,
            statSync: () => {
                return {
                    isFile: () => true,
                };
            },
        },
    });

    const configFilePath = pathUtil.resolve(configFolder, 'config');
    tap.notOk(semiParseConfigFile(configFilePath), 'should throw when failed to read');
    tap.end();
});