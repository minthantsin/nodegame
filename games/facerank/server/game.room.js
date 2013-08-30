/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);
    var mdb = ngdb.getLayer('MongoDB');
   
    var stager = new node.Stager();
    var logicPath = __dirname + '/includes/game.logic';

    // second parameter makes available to the required file its properties
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
    });

    // second parameter makes available to the required file its properties
    //var logic = channel.require(__dirname + '/includes/game.logic', {
    //    Stager: node.Stager,
    //    stepRules: node.stepRules,
    //    mdb: mdb,
    //    node: node
    //});

    var waitingStage = {
        id: 'waiting',
        cb: function() {
            return true;
        }
	
    };

    stager.addStage(waitingStage);

    stager.setOnInit(function() {

        node.on.pconnect(function(p) {
            var room;
            console.log('-----------Player connected ' + p.id);
	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
            
            // create the object
            debugger;
            var tmpPlayerList = new node.PlayerList(null, [p]);
            //var tmpPlayerList = new node.PlayerList();
            //tmpPlayerList.add(p);
            tmpPlayerList.rebuildIndexes();
            room = channel.createGameRoom({
                name: 'facerank-room',
                playerList: tmpPlayerList,
                channel: channel,
                logicPath: logicPath
            });
                   
            // not existing at the moment
            // the remoteCommand start on the client must be called
            // room.start(); // .exec();

            // or we can use the this:
            // node.remoteCommand('start', p.id);
            
            room.startGame();
        });
    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager.init().loop('waiting');

    return {
	game_metadata: {
	    name: 'wroom',
	    version: '0.0.1'
	},
	game_settings: {
	    observer: false
	},
	plot: stager.getState(),
	debug: true,
	verbosity: 100
    };

};
