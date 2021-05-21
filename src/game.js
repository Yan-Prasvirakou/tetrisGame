export default class Game { 
	static points = {
		'1': 40,
		'2': 100,
		'3': 300,
		'4': 1200
	}

	constructor() {
		this.resetGame();
	}

	get level() {
		return Math.floor(this.lines * 0.1); //10 сбритых линий - 1-й уровень, 20 - 2-й и т.д.
	}

	getState() { // метод для размещения фигуры на поле
		const playfield = this.createPlayfield();
		const {
			y: pieceY,
			x: pieceX,
			blocks
		} = this.activePiece;

		for (let y = 0; y < this.playfield.length; y++) {
			playfield[y] = [];

			for (let x = 0; x < this.playfield[y].length; x++) {
				playfield[y][x] = this.playfield[y][x]
			}
		}

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x]) {
					playfield[pieceY + y][pieceX + x] = blocks[y][x];
				}
			}
		}

		return {
			score: this.score,
			level: this.level,
			lines: this.lines,
			nextPiece: this.nextPiece,
			playfield,
			isGameOver: this.topOut
		};
	}

	resetGame() {
		this.score = 0;
		this.lines = 0;
		this.topOut = false;
		this.playfield = this.createPlayfield();
		this.activePiece = this.createPiece();
		this.nextPiece = this.createPiece();
	}

	createPlayfield() {
		const playfield = [];

		for (let y = 0; y < 20; y++) {
			playfield[y] = [];

			for (let x = 0; x < 10; x++) {
				playfield[y][x] = 0;
			}
		}

		return playfield;
	}


	createPiece() {
		const index = Math.floor(Math.random() * 7);
		const type = 'IJLOSTZ'[index];
		const piece = {};

		switch (type) {
			case 'I':
				piece.blocks = [
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0],
					[0, 0, 0, 0]
				];
				break;
			case 'J':
				piece.blocks = [
					[0, 0, 0],
					[2, 2, 2],
					[0, 0, 2]
				];
				break;
			case 'L':
				piece.blocks = [
					[0, 0, 0],
					[3, 3, 3],
					[3, 0, 0]
				];
				break;
			case 'O':
				piece.blocks = [
					[0, 0, 0, 0],
					[0, 4, 4, 0],
					[0, 4, 4, 0],
					[0, 0, 0, 0],
				];
				break;
			case 'S':
				piece.blocks = [
					[0, 0, 0, 0],
					[0, 0, 5, 5],
					[0, 5, 5, 0],
					[0, 0, 0, 0],
				];
				break;
			case 'T':
				piece.blocks = [
					[0, 0, 0],
					[6, 6, 6],
					[0, 6, 0]
				];
				break;
			case 'Z':
				piece.blocks = [
					[0, 0, 0],
					[7, 7, 0],
					[0, 7, 7],
				];
				break;
			default:
				throw new Error('Неизвестный тип фигуры');
		}

		piece.x = Math.floor((10 - piece.blocks[0].length) / 2); // чтобы новая фигура появлялась в центре, а не с левого боку
		piece.y = -1;// чтобы фигура появлялась в самом верху

		return piece;
	}

	movePieceLeft() { //движение фигуры влево
		this.activePiece.x -= 1;

		if (this.hasCollision()) { // если фигура вышла за поле или наткнулась на другую фигуру
			this.activePiece.x += 1; //возвращаем ее обратно
		}
	}

	movePieceRight() { //вправо
		this.activePiece.x += 1;

		if (this.hasCollision()) { // если фигура вышла за поле или наткнулась на другую фигуру
			this.activePiece.x -= 1; //возвращаем ее обратно
		}
	}

	movePieceDown() { //вниз
		if (this.topOut) return;

		this.activePiece.y += 1;

		if (this.hasCollision()) { // если фигура вышла за поле или наткнулась на другую фигуру
			this.activePiece.y -= 1; //возвращаем ее обратно
			this.lockPiece(); // и закрепляем ее внизу
			const clearedLines = this.clearLines();// сбриваем линию
			this.updateScore(clearedLines);
			this.updatePieces();
		}

		if (this.hasCollision()) { // почему это условие внесено отдельно?
			// видимо логика такая: если после this.activePiece.y -= 1; снова есть столкновение, то фигура касается верха поля
			this.topOut = true;
		}
	}

	rotatePiece() {
		this.rotateBlocks();

		if (this.hasCollision()) {
			this.rotateBlocks(false);//против часовой стрелки
		}
	}

	rotateBlocks(clockwise = true) {//по часовой стрелке
		const blocks = this.activePiece.blocks;
		const length = blocks.length;
		const x = Math.floor(length / 2);
		const y = length - 1;

		for (let i = 0; i < x; i++) {
			for (let j = i; j < y - i; j++) {
				const temp = blocks[i][j];

				if (clockwise) {
					blocks[i][j] = blocks[y - j][i];
					blocks[y - j][i] = blocks[y - i][y - j];
					blocks[y - i][y - j] = blocks[j][y - i];
					blocks[j][y - i] = temp;
				} else {
					blocks[i][j] = blocks[j][y - i];
					blocks[j][y - i] = blocks[y - i][y - j];
					blocks[y - i][y - j] = blocks[y - j][i];
					blocks[y - j][i] = temp;
				}
			}
		}
	}

	// метод для проверки, вышли ли фигура за пределы игрового поля и столкнулась ли она с другой фигурой
	hasCollision() {
		const {
			y: pieceY,
			x: pieceX,
			blocks
		} = this.activePiece;

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (
					blocks[y][x] && // это условие нужно, чтобы фигура двигалась до конца поля, даже если она состоит из нулей
					((this.playfield[pieceY + y] === undefined || this.playfield[pieceY + y][pieceX + x] === undefined) || // а это для проверки нахождения фигуры в пределах игрового поля
						this.playfield[pieceY + y][pieceX + x]) // эта строка для того, чтобы фигуры не перекрывали друг друга, а накладывались поверх
				) {
					return true;
				}
			}
		}

		return false
	}


	lockPiece() { //метод для закрепления фигуры на поле
		const {
			y: pieceY,
			x: pieceX,
			blocks
		} = this.activePiece;

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x]) {
					this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
				}
			}
		}
	}

	clearLines() {
		const rows = this.playfield.length; //20
		const columns = this.playfield.length / 2; //10
		let lines = [];

		for (let y = rows - 1; y >= 0; y--) {// почему с конца?
			// потому что линии сбриваются чаще внизу, чем вверху
			let numberOfBlocks = 0;

			for (let x = 0; x < columns; x++) {
				if (this.playfield[y][x]) {
					numberOfBlocks++;
				}
			}

			if (numberOfBlocks === 0) {
				break;
			} else if (numberOfBlocks < columns) {
				continue;
			} else if (numberOfBlocks === columns) {
				lines.unshift(y);// добавляем в массив номер линии, которую необходимо сбрить
			}
		}

		// console.log(lines);
		for (let index of lines) {
			this.playfield.splice(index, 1);
			this.playfield.unshift(new Array(columns).fill(0));
		}

		return lines.length;
	}

	updateScore(clearedLines) {
		// console.log(this.level);
		if (clearedLines > 0) {
			this.score += Game.points[clearedLines] * (this.level + 1); //1-й уровень нулевой, а умножать на 0 не нужно
			this.lines += clearedLines;
			// console.log(this.score, this.lines, this.level);
		}
	}

	updatePieces() {
		this.activePiece = this.nextPiece;
		this.nextPiece = this.createPiece();
	}
}