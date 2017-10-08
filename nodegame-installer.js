#!/usr/local/bin/node
/**
 * # nodeGame Installer
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.

const isWin = /^win/.test(process.platform);

const path = require('path');
const fs = require('fs');
const execFile = require('child_process').execFile;
const readline = require('readline');

const logList = txt => {
    console.log('  - ' + txt);
};

var verbose = false;
var nodeModulesExisting = false;
var isDev = false;

// Installer default version.
const INSTALLER_VERSION = "4.0.4";

// The actual version being installed, user can change it.
var version;

var requestedVersion = process.argv[2];

if (requestedVersion) {
    if (requestedVersion === 'dev') {
        isDev = true;
        version = INSTALLER_VERSION;
        requestedVersion = '@' + version;
    }
    else {
        if (requestedVersion.charAt(0) !== '@') {
            console.error('  Error: version must start with @, e.g. @' +
                         INSTALLER_VERSION);
            return;
        }
        version = requestedVersion.substr(1);
        if (version.length < 1 || version.length > 5) {
            console.error('  Error: invalid version number: ', version);
            return;
        }
    }
}
else {
    version = INSTALLER_VERSION;    
    requestedVersion = '@' + version;
}

// nodeGame version.
const VERSION = isDev ? "v" + version + '-dev' : "v" + version;

const NODEGAME_AND_VERSION = 'nodegame-' + VERSION;

const ROOT_DIR = process.cwd()
const NODE_MODULES_DIR = path.resolve(ROOT_DIR, 'node_modules');
const INSTALL_DIR =  path.resolve(ROOT_DIR, NODEGAME_AND_VERSION);
const INSTALL_DIR_MODULES = path.resolve(INSTALL_DIR, 'node_modules');

const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator', 'nodegame-monitor',
    'nodegame-db', 'nodegame-mondodb',
    'JSUS', 'NDDB'
];
const N_MODULES = NODEGAME_MODULES.length;

const GAMES_AVAILABLE_DIR = path.resolve(INSTALL_DIR,
                                         'games_available');
const GAMES_ENABLED_DIR = path.resolve(INSTALL_DIR, 'games');

// Print cool nodegame logo.

console.log();
console.log('  ***********************************************  ');
console.log('  **    WELCOME TO NODEGAME ' + VERSION + ' INSTALLER   **  ');
console.log('  ***********************************************  ');
console.log();
console.log('  nodeGame is a free and open source javascript');
console.log('  framework for online, multiplayer, real-time ');
console.log('  games and experiments in the browser.');

console.log();
console.log('  creator: Stefano Balietti');
console.log('  website: http://nodegame.org');
console.log('  license: MIT');
console.log('  mail:    info@nodegame.org');
console.log('  twitter: @nodegameorg');
console.log('  forum:   https://groups.google.com/' +
            'forum/?fromgroups#!forum/nodegame');

// Print node and nodeGame version (npm too?).

console.log();
console.log('  ----------------------------------------------');
console.log();

console.log('  node version:      ' + process.version);
console.log('  nodeGame version:  ' + VERSION);
console.log('  install directory: ' + INSTALL_DIR);
console.log();

// Check node version is >

var nodeVersion = process.versions.node.split('.');
if (parseInt(nodeVersion[0], 10) < 4) {
    console.error('  Error: node version >= 4.x is required.');
    console.error('  Please upgrade your Node.Js installation, ' +
                'visit: http://nodejs.org');
    console.log();
    return;
}


// Check if nodegame-4.0.0 exists (abort)

if (fs.existsSync(INSTALL_DIR)) {
    console.error('  Error: installation directory already existing.');
    console.log();
    return;
}

// Check if node_modules exists (prompt continue?)

if (fs.existsSync(NODE_MODULES_DIR)) {
    console.error('  Warning: node_modules directory already existing.');
    confirm('  Continue? [y/n] ', function(ok) {
        if (ok) {
            process.stdin.destroy();
            nodeModulesExisting = true;
            console.log();
            doInstall();
        }
        else {
            console.error('  Installation aborted.');
            console.log();
        }
    });
    return;
}
else {
    doInstall();
}

// Install.

function doInstall() {
    // Create spinner.
    console.log('  Downloading and installing nodeGame packages.');
    let sp = new Spinner('  This might take a few minutes %s  ');
    sp.start();

    let child = execFile(
        isWin ? 'npm.cmd' : 'npm',        
        [ 'install', 'nodegame-test' + requestedVersion ],
        { cwd: ROOT_DIR },
        (error, stdout, stderr) => {
            if (error) {
                logList(stderr.trim());
            }
            else {
                // Stop spinner.
                sp.stop();

                if (verbose) logList(stdout.trim());
                console.log();
                console.log('  Done! Now some finishing magics...');

                // Move nodegame folder outside node_modules.
                fs.renameSync(path.resolve(NODE_MODULES_DIR,
                                           'nodegame-test'),
                              INSTALL_DIR);

                // Old npms put already all modules under nodegame.
                if (!fs.existsSync(INSTALL_DIR_MODULES)) {
                    fs.renameSync(NODE_MODULES_DIR,
                                  INSTALL_DIR_MODULES);
                }
                else if (!nodeModulesExisting) {
                    fs.rmdirSync(NODE_MODULES_DIR);
                }

                // nodeGame generator: make link and store conf.

                makeLink(path.resolve(INSTALL_DIR_MODULES,
                                      'nodegame-generator',
                                      'bin', 'nodegame'),
                         path.resolve(INSTALL_DIR, 'bin', 'nodegame'),
			 'file');


                fs.writeFileSync(path.resolve(INSTALL_DIR_MODULES,
					      'nodegame-generator',
					      'conf',
					      'generator.conf.json'),
				 JSON.stringify({
				     author: "",
				     email: "",
				     gamesFolder: GAMES_AVAILABLE_DIR
				 }, 4));

		// Move games from node_modules.

                copyGameFromNodeModules('ultimatum-game');

                // Print final Information.

                printFinalInfo();
            }
    });
}

// Helper stuff.
////////////////


function printFinalInfo() {
    console.log();
    console.log('  Installation complete!');
    console.log('  ----------------------------------------------');

    console.log('  Enter the installation directory:');
    console.log('    cd ' + NODEGAME_AND_VERSION);
    console.log();

    console.log('  Start the server:');
    console.log('    node launcher.js');
    console.log(); 

    console.log('  Open two browser tabs at the address:');
    console.log('    http://localhost:8080/ultimatum');
    console.log();

    console.log('  Open another tab with the monitor interface:');
    console.log('    http://localhost:8080/ultimatum/monitor');
    console.log();

    console.log('  Create a new game:');
    console.log('    bin/nodegame create-game mygame');
    console.log();

    console.log('  Please cite as:');
    console.log('  ----------------------------------------------');
    console.log('    Balietti (2017) "nodeGame: Real-time, synchronous, ');
    console.log('    online experiments in the browser." ' +
                'Behavior Research Methods 49(5) pp. 1696–1715');
    console.log();
}


function makeLink(from, to, type) {
    if (isWin) {
        if (type === 'file') fs.linkSync(from, to, 'file');
        else fs.symlinkSync(from, to, 'junction');
    }
    else {
        fs.symlinkSync(from, to);
    }
}

function copyGameFromNodeModules(game, enable) {
    enable = 'undefined' === typeof enable ? true : enable;

    // Move game from node_modules into  games_available directory.
    fs.renameSync(path.resolve(INSTALL_DIR, 'node_modules', game),
                  path.resolve(GAMES_AVAILABLE_DIR, game));

    if (!enable) return;

    // Enable game.
    makeLink(path.resolve(GAMES_AVAILABLE_DIR, game),
             path.resolve(GAMES_ENABLED_DIR, game));
}

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}


// Kudos: cli-spinner package.

function Spinner(text) {
    var that;
    that = this;

    this.spinners = [
        "|/-\\",
        "⠂-–—–-",
        "◐◓◑◒",
        "◴◷◶◵",
        "◰◳◲◱",
        "▖▘▝▗",
        "■□▪▫",
        "▌▀▐▄",
        "▉▊▋▌▍▎▏▎▍▌▋▊▉",
        "▁▃▄▅▆▇█▇▆▅▄▃",
        "←↖↑↗→↘↓↙",
        "┤┘┴└├┌┬┐",
        "◢◣◤◥",
        ".oO°Oo.",
        ".oO@*",
        "🌍🌎🌏",
        "◡◡ ⊙⊙ ◠◠",
        "☱☲☴",
        "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
        "⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓",
        "⠄⠆⠇⠋⠙⠸⠰⠠⠰⠸⠙⠋⠇⠆",
        "⠋⠙⠚⠒⠂⠂⠒⠲⠴⠦⠖⠒⠐⠐⠒⠓⠋",
        "⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠴⠲⠒⠂⠂⠒⠚⠙⠉⠁",
        "⠈⠉⠋⠓⠒⠐⠐⠒⠖⠦⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈",
        "⠁⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈⠈",
        "⢄⢂⢁⡁⡈⡐⡠",
        "⢹⢺⢼⣸⣇⡧⡗⡏",
        "⣾⣽⣻⢿⡿⣟⣯⣷",
        "⠁⠂⠄⡀⢀⠠⠐⠈"
    ];

    this.text = text || '';

    this.chars = this.spinners[isWin ? 0 : 4].split('');

    this.delay = 60;

    this.onTick = function(msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    };

    this.stream = process.stdout;

    this.start = function() {
        var current = 0;
        var self = this;
        this.id = setInterval(function() {
            var msg = self.text.indexOf('%s') > -1
                ? self.text.replace('%s', self.chars[current])
                : self.chars[current] + ' ' + self.text;
            self.onTick(msg);

            current = ++current % self.chars.length;
        }, this.delay);
    };

    this.stop = function(clear) {
        clearInterval(this.id);
        this.id = undefined;
        if (clear && this.enabled) this.clearLine(this.stream);
    };

    this.clearLine = function(stream) {
        readline.clearLine(stream, 0);
        readline.cursorTo(stream, 0);
    };
};
