export default class Controller {
	constructor(game, view) {
		this.game = game;
		this.view = view;
		this.intervalId = null;
		this.isPlaying = false;

		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);

		this.moveEvent = this.movePiece;

		this.view.renderStartScreen();
	}

	update() {
		this.game.movePieceDown();
		this.updateView();
	}

	play() {
		this.isPlaying = true;
		this.startTimer();
		this.updateView();
		document.addEventListener('keydown', this.moveEvent);
	}

	pause() {
		this.isPlaying = false;
		this.stopTimer();
		this.updateView();
		document.removeEventListener('keydown', this.moveEvent);
	}

	reset() {
		this.game.resetGame();
		this.play();
	}

	updateView() {
		const state = this.game.getState();
		
		if (state.isGameOver) {
			this.view.renderEndScreen(state);
		} else if (!this.isPlaying) {
			this.view.renderPauseScreen();
		} else {
			this.view.renderMainScreen(state);
		}
	}

	startTimer() {
		const speed = 1000 - this.game.getState().level * 100;

		if (!this.intervalId) {
			this.intervalId = setInterval(() => {
				this.update();
			}, speed > 0? speed : 100);
		}
	}

	stopTimer() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	movePiece = (event) => {
		switch (event.code) {
			case 'KeyA': //left
				this.game.movePieceLeft();
				this.updateView();
				break;
			case 'KeyW': //up
				this.game.rotatePiece();
				this.updateView();
				break;
			case 'KeyD': //right
				this.game.movePieceRight();
				this.updateView();
				break;
			case 'KeyS': //down
				this.stopTimer();
				this.game.movePieceDown();
				this.updateView();
				break;
			case 'KeyR': // для проверки
				console.log('test');
				break;
				}
	}

	handleKeyDown = (event) => {
		const state = this.game.getState();

		switch (event.code) {
			case 'Enter':
				if (state.isGameOver) {
					this.reset();
				}
				else if (this.isPlaying) {
					this.pause();
				}
				else {
					this.play();
				}
			break;
		}
	}

	handleKeyUp = (event) => {//чтобы таймер не работал во время нажатия кнопки вниз
		//то есть чтобы фигура не делала лишнего движения вниз после долгого нажатия кнопки вниз
		switch (event.code) {
			case 'KeyS':
				if (this.isPlaying) {
					this.startTimer();
				}
			break;
		}
	}
}

