function PeerReviewGame () {
	
	this.name = 'Peer Review Game';
	this.description = 'Create, submit, and evaluate contributions from your peers.';
	this.version = '0.3';
	
	this.auto_step = false;
	this.auto_wait = true;
	
	this.minPlayers = 2;
	this.maxPlayers = 8;
	
	this.init = function() {			
		node.window.setup('PLAYER');
		this.cf = null;
		this.header = document.getElementById('gn_header');
		this.vs = node.window.addWidget('VisualState', this.header);
		this.timer = node.window.addWidget('VisualTimer', this.header);
		this.timer = node.window.addWidget('DoneButton', this.header);
		this.sd = node.window.addWidget('StateDisplay', this.header);
		this.outlet = null;
		this.exs = ['A','B','C'];
		this.donetxt = 'Done!';
		this.milli = 10000;
		this.milli_short = 1000;

		this.evas = {};
		
		this.all_ex = new node.window.List({ id: 'all_ex',
											 title: 'History of previous exhibitions'
		});
		
		// DTABLE
//		this.dtable = node.window.addWidget('DynamicTable', document.body, {replace: true});
//		this.dtable.setLeft(['Mean', 'N. of shows', 'Money Won']);
//					
//		var bindings = {
//				x: function (msg) {
//				if (msg.text === 'WIN_CF') {
//					var out = [];
//					for (var i=0; i< msg.data.length; i++) {
//						var author = msg.data[i].author;
//						var x = node.game.pl.select('name', '=', author).first().count;
//						if ('undefined' !== typeof x) {
//							out.push(x);
//						}
//					}
//				}
//				return out;
//			},
//				
//			y: function (msg) {
//				if (msg.text === 'WIN_CF') {
//					return [1,2,3];
//				}
//			},
//
//			cell: function (msg, cell) {
//				if (msg.text === 'WIN_CF') {
//					if (cell.y === 1) {
//						console.log('header');
//						console.log(this.header);
//						console.log('cell.x');
//						console.log(cell.x);
//						var idx = this.header[cell.x].content;
//						if (!cell.history) cell.history = [];
//						for (var i=0; i< msg.data.length; i++) {
//							if (msg.data[i].author === idx) {
//								cell.history.push(msg.data[i].mean);
//							}
//						}
//						var mean = 0;
//						for (var i=0; i < cell.history.length; i++) {
//							mean += new Number(cell.history[i]); 
//						}
//						cell.content = (mean / cell.history.length).toFixed(2);
//						
//						
//					}
//					else if (cell.y === 2) {
//						if (!cell.content) {
//							cell.content = 1;
//						}
//						else {
//							cell.content += 1;
//						}
//					
//					}
//					else {
//						if (!cell.content) {
//							cell.content = 1;
//						}
//						else {
//							cell.content += 1;
//						}
//					}
//					return cell;	
//				}
//			}
//		};
//		
//		
//		this.dtable.bind('in.say.DATA', bindings);
//		
//		this.dtable.bind('in.say.PLIST', {
//									header: function (msg) {
//										if (msg.data.length === 0) return;
//										var plist = new node.PlayerList({}, msg.data);
//										var out = plist.map(function(player){
//											return player.name;
//										});
//										return out;
//									}
//		});
		// End TABLE
		
		
		this.renderCF = function (cell) {
			// Check if it is really CF obj
			if (cell.content.cf) {
				var cf_options = { id: 'cf_' + cell.x,
						   width: 200,
						   height: 200,
						   features: cell.content.cf,
						   controls: false,
						   onclick: function() {
						      node.game.cf.draw(this.getAllValues());
						   }
				};
				
				var container = document.createElement('div');
				var cf = node.window.addWidget('ChernoffFaces', container, cf_options);
				
				var details_tbl = new node.window.Table();
				details_tbl.addColumn(['Author: ' + cell.content.author,
				                       'Score: ' + cell.content.mean
				]);
				container.appendChild(details_tbl.parse());
				return container;
			}
		};
		
	};
	
	
	
	var pregame = function() {
		var frame = node.window.loadFrame('pregame.html');
		node.emit('DONE');
		console.log('Pregame');
	};
	
	var instructions = function(){
		node.window.loadFrame('instructions.html');
		console.log('Instructions');
	};
	
	var creation = function(){

		node.window.loadFrame('creation.html', function(){
			
			var creationDiv = node.window.getElementById('creation');
			var cf_options = { id: 'cf',
							   width: 300,
							   height: 300
			};
			
			this.cf = node.window.addWidget('ChernoffFaces', creationDiv, cf_options);
			// AUTOPLAY
			this.cf.randomize();
			
			// History of previous exhibits
			var historyDiv = node.window.getElementById('history');
			this.all_ex.reverse();
			this.all_ex.parse();
			node.window.write(this.all_ex.getRoot(), historyDiv);
			
		});

		console.log('Creation');
	};
	
	var submission = function() {
		var root = node.window.getElementById('creation');
		
		node.emit('INPUT_DISABLE');
		
		var ctrl_options = { id: 'exhib',
							 name: 'exhib',
							 fieldset: {
										legend: 'Exhibitions'
							 },
							 //change: 'SUBMISSION_DONE',
							 //fieldset: false,
							 submit: false,
//							 submit: {
//								 		value: 'Submit'
//							 },
							 features: {
										ex_A: { 
											value: 'A',
											label: 'A'
										},
										ex_B: { 
												value: 'B',
												label: 'B'
										},
										ex_C: { 
												value: 'C',
												label: 'C'
										}
							}
		};
		
		this.outlet = node.window.addWidget('Controls.Radio',root,ctrl_options);
		
		// AUTOPLAY
		node.random.exec(function(){
			var choice = Math.random();
			if (choice < 0.33) {
				node.window.getElementById('ex_A').click();
			}
			else if (choice < 0.66) {
				node.window.getElementById('ex_B').click();
			}
			else {
				node.window.getElementById('ex_C').click();
			}
		}, 10);
		
		console.log('Submission');
	};	
	
	var evaluation = function() {
		
		var evaAttr = {
				min: 1,
				max: 9,
				step: 0.5,
				value: 4.5,
				label: 'Evaluation'
		};
		
		node.window.loadFrame('evaluation.html', function() {
		
			var root = node.window.getElementById('root');
			
			node.onDATA('CF', function(msg) {
				
				var cf_options = { id: 'cf',
								   width: 300,
								   height: 300,
								   features: msg.data.face,
								   controls: false
				};
	
				node.window.addWidget('ChernoffFaces', root, cf_options);
				
				 
				
				var evaId = 'eva_' + msg.data.from;
				node.window.writeln();
				
				// Add the slider to the container
				this.evas[msg.data.from] = node.window.addSlider(root, evaId, evaAttr);
				
		
				
				// AUTOPLAY
				node.random.exec(function(){
					var choice = Math.random();
					node.window.getElementById(evaId).value = Math.random()*10;
					//alert(choice);
				}, 10);
			});
	
		});
		
		console.log('Evaluation');
	};
	
	var dissemination = function(){
		node.window.loadFrame('dissemination.html', function() {
			
			this.all_ex.addDT('Round: ' + node.game.gameState.round);
			
			var table = new node.window.Table({className: 'exhibition',
										 	   render: this.renderCF
			});
			table.setHeader(['Rank','A','B','C']);
			table.addColumn([1,2,3]);
			
			
			node.onDATA('WIN_CF', function(msg) {
				
				if (msg.data.length > 0) {
					var db = new node.NDDB(null,msg.data);
					
					for (var j=0; j < this.exs.length; j++) {
						var winners = db.select('ex','=',this.exs[j])
										.sort('mean')
										.reverse()
										.fetch();
					
						if (winners.length > 0) {
							table.addColumn(winners);
						}
						else {
							table.addColumn(['No creation was selected for exhibition ' + this.exs[j]]);
						}
					}
					
					// Styling the table
					var t = table.select('x', '=', 1);
					t.select('y', '=', 0).addClass('first');
					t.select('y', '=', 1).addClass('second');
					t.select('y', '=', 2).addClass('third');
					//t.select('y', '>', 2).addClass('other');

					node.window.write(table.parse());
					
					// Was table.table
					this.all_ex.addDD(table);

				}
				
				else {
					var str = 'No work was selected to be published in any exhibition';
					node.window.write(str);
					this.all_ex.addDD(str);
				}
				
			});
			
		});
		
		
		
		console.log('Dissemination');
	};
	
	var questionnaire = function() {
		node.window.loadFrame('postgame.html');
		console.log('Postgame');
	};
	
	var endgame = function() {
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	
// Assigning Functions to Loops
	
	
	var gameloop = { // The different, subsequent phases in each round
		
		1: {state: creation,
			name: 'Creation',
//			timer: {
//				timeup: 'CREATION_DONE',
//				milliseconds: 1000
//			},
			timer: 3000,
			done: function () {
				node.set('CF', this.cf.getAllValues());
				return true;
			}
		},
		
		2: {state: submission,
			name: 'Submission',
			timer: 1000,
			done: function () {
				if (!this.outlet.hasChanged) {
					this.outlet.highlight();
					alert('You must select an outlet for your creation NOW!!');
					this.timer.restart(timerOptions);
					return false;
				}
				
				node.emit('INPUT_DISABLE');
				node.set('SUB', this.outlet.getAllValues());
				return true;
			}
		},
		
		3: {state: evaluation,
			name: 'Evaluation',
			timer: 1000,
			done: function () {
				for (var i in this.evas) {
					if (this.evas.hasOwnProperty(i)) {	
						node.set('EVA', {'for': i,
										 eva: this.evas[i].value
						});
					}
				}
				this.evas = {};
				return true;
			}
		},
		
		4: {state: dissemination,
			name: 'Exhibition',
			timer: 20000
		}
	};


	
	// LOOPS
	this.loops = {
			
			
			1: {state:	pregame,
				name:	'Game will start soon'
			},
			
			2: {state: 	instructions,
				name: 	'Instructions',
				timer:  1000
			},
				
			3: {rounds:	10, 
				state: 	gameloop,
				name: 	'Game'
			},
			
			4: {state:	questionnaire,
				name: 	'Questionnaire',
				timer: 	1000
			},
				
			5: {state:	endgame,
				name: 	'Thank you'
			}
			
	};	
}