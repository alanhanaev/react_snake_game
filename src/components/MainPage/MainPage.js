import React, { Component, Fragment } from 'react';
import { CellState, Direction, GameStatus } from "./../../constants/EnumTypes"
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import _ from "lodash"
import Board from "./../Board/Board"
import './MainPage.css';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paperInputs: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary
    },
    paperBoard: {
        padding: theme.spacing.unit * 2,
        color: theme.palette.text.secondary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    table: {
        minWidth: 450,
    },
    button: {
        margin: theme.spacing.unit,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});


const minX = 5;
const maxX = 27;
const minY = 5;
const maxY = 40;


class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            xSize: 10,
            ySize: 10,
            speedGame: 8,
            walls: true,
            gameStatus: GameStatus.NOT_STARTED,
            motionVector: Direction.RIGHT,
            eatedApple: 0,
            board: []
        };
        this.interv = null;
        this.motionVector = Direction.RIGHT;
        this.snake = [[0, 0], [0, 1]];
        this.apple = [1, 5];
    }

    getNewBoard = (snake, apple, xSize, ySize) => {
        let board = Array.from(new Array(xSize), () => Array.from(new Array(ySize), () => CellState.EMPTY))
        board = board.map((xItem, xIndex) => xItem.map((yItem, yIndex) => {
            if (snake.findIndex((item) => { return item[0] === xIndex && item[1] === yIndex }) !== -1)
                return CellState.BUSY_SNAKE;
            if (xIndex === apple[0] && yIndex === apple[1])
                return CellState.BUSY_APPLE;
            return CellState.EMPTY;
        }));
        return board;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateApple(snake, apple, xSize, ySize) {
        let x = 0;
        let y = 0;
        while (true) {
            x = this.getRandomInt(0, xSize - 1);
            y = this.getRandomInt(0, ySize - 1);
            let goodValue = true;
            if (x === apple[0] && y === apple[1]) goodValue = false;
            for (let element of snake)
                if (element[0] === x && element[1] === y) {
                    goodValue = false;
                    return;
                }
            if (goodValue) {
                apple = [x, y];
                break;
            }
        }
        return [x, y];
    }

    beatSelf(snake, newHead) {
        return snake.findIndex((item) => { return item[0] === newHead[0] && item[1] === newHead[1] }) > -1;
    }

    getNewHeadPosition(snake, direction) {
        let snakeHead = snake[snake.length - 1]; //Get snake head indexes
        let newHead = [0, 0];
        switch (direction) {
            case Direction.UP:
                newHead = [snakeHead[0] - 1, snakeHead[1]];
                break;
            case Direction.DOWN:
                newHead = [snakeHead[0] + 1, snakeHead[1]];
                break;
            case Direction.LEFT:
                newHead = [snakeHead[0], snakeHead[1] - 1];
                break;
            case Direction.RIGHT:
                newHead = [snakeHead[0], snakeHead[1] + 1];
                break;
            default:
                break;
        }
        return newHead;
    }

    getOppositeXY(head, direction, xItems, yItems) {
        let newHead = [];
        switch (direction) {
            case Direction.UP:
                newHead = [xItems-1, head[1]];
                break;
            case Direction.DOWN:
                newHead = [0, head[1]];
                break;
            case Direction.LEFT:
                newHead = [head[0], yItems-1];
                break;
            case Direction.RIGHT:
                newHead = [head[0], 0];
                break;
            default:
                break;
        }
        return newHead;
    }

    oneGameIterate = () => {
        let eatApple = false;

        //We calculate the new position of the snake's head based on the motion vector
        let newHead = this.getNewHeadPosition(this.snake, this.motionVector);

        //If the snake struck itself
        if (this.beatSelf(this.snake, newHead)) {
            this.endGame();
            return;
        }

        //If the snake ate an apple
        if (_.isEqual(newHead, this.apple)) {
            eatApple = true;
            this.apple = this.generateApple(this.snake, this.apple, this.state.xSize, this.state.ySize);
        }

        //Remove the last element of our snake, if the apple is not eaten
        if (!eatApple) this.snake = this.snake.slice(1);

        //Check whether the snake hit the border
        if (newHead[0] < 0 || newHead[1] < 0 || newHead[0] > this.state.xSize - 1 || newHead[1] > this.state.ySize - 1) {
            if (this.state.walls) {
                this.endGame();
                return;
            }
            else {
                newHead = this.getOppositeXY(this.snake[this.snake.length - 1], this.motionVector, this.state.xSize, this.state.ySize);
            }
        }

        //Add a new element to the head of the snake
        this.snake.push(newHead);

        //Updating the board
        let board = this.getNewBoard(this.snake, this.apple, this.state.xSize, this.state.ySize);
        this.setState({ board, motionVector: this.motionVector, eatedApple: eatApple ? this.state.eatedApple + 1 : this.state.eatedApple })
    }

    startGame = () => {
        clearInterval(this.interv);
        this.motionVector = Direction.RIGHT;
        this.snake = [[0, 0], [0, 1]];
        this.apple = [1, 3];
        let board = this.getNewBoard(this.snake, this.apple, this.state.xSize, this.state.ySize);
        this.setState({ gameStatus: GameStatus.STARTED, board, eatedApple: 0 }, () => {
            this.interv = setInterval(() => {
                this.oneGameIterate();
            }, this.state.speedGame * 100)
        })
    }

    endGame = () => {
        clearInterval(this.interv);
        alert("Game end, you score " + this.state.eatedApple);
        this.setState({ gameStatus: GameStatus.NOT_STARTED});
    }

    pressKeyFn = (event) => {
        if ([38, 87].includes(event.keyCode)) //Up
            if (this.state.motionVector !== Direction.DOWN) this.motionVector = Direction.UP;
        if ([40, 83].includes(event.keyCode)) //Down
            if (this.state.motionVector !== Direction.UP) this.motionVector = Direction.DOWN;
        if ([39, 68].includes(event.keyCode)) //Right
            if (this.state.motionVector !== Direction.LEFT) this.motionVector = Direction.RIGHT;
        if ([37, 65].includes(event.keyCode)) //Left
            if (this.state.motionVector !== Direction.RIGHT) this.motionVector = Direction.LEFT;
        if (event.keyCode === 32) //Space
            this.startGame();
    }

    componentDidMount() {
        document.addEventListener("keydown", this.pressKeyFn, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.pressKeyFn, false);
    }

    render() {
        const { classes } = this.props;
        return (
            <div className="MainPage">
                {
                    this.state.gameStatus === GameStatus.NOT_STARTED && <Fragment>
                        <Grid container justify="center" spacing={24}>
                            <Grid item xs={6}>
                                <Paper className={classes.paperInputs}>
                                    <TextField id="number"
                                        label="X cell numbers"
                                        value={this.state.xSize}
                                        onChange={(e) => { let value = Number(e.target.value); if (value >= minX && value <= maxX) this.setState({ ...this.state, xSize: value }) }}
                                        type="number"
                                        className={classes.textField}
                                        InputLabelProps={{
                                            shrink: true,
                                            min: 5,
                                            max: 40,
                                            step: 1
                                        }}
                                        margin="normal"
                                    />

                                    <TextField id="number"
                                        label="Y cell numbers"
                                        value={this.state.ySize}
                                        onChange={(e) => { let value = Number(e.target.value); if (value >= minY && value <= maxY) this.setState({ ...this.state, ySize: value }) }}
                                        type="number"
                                        className={classes.textField}
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                    />

                                    <TextField id="number"
                                        label="Speed game, from 1 to 20"
                                        value={this.state.speedGame}
                                        onChange={(e) => { let value = Number(e.target.value); if (value >= 1 && value <= 20) this.setState({ ...this.state, speedGame: value }) }}
                                        type="number"
                                        className={classes.textField}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        margin="normal"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={this.state.walls}
                                                onChange={(e) => { ; this.setState({ walls: e.target.checked }) }}
                                                value="checkedB"
                                                color="primary"
                                            />
                                        }
                                        label="Walls"
                                    />


                                    <Button variant="contained" color="primary" className={classes.button} onClick={this.startGame}>
                                        Start game
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Fragment>
                }

                {
                    this.state.gameStatus === GameStatus.STARTED && <Fragment>
                        <Grid container justify="center" spacing={24}>
                            <Grid item xs={10}>
                                <Paper className={classes.paperBoard}>
                                    <Board board={this.state.board} snake={this.state.snake} apple={this.state.apple} />
                                </Paper>
                            </Grid>
                        </Grid>

                    </Fragment>
                }

            </div>
        );
    }
}

export default withStyles(styles)(MainPage);
