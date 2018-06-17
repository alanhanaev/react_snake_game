import React, { Component, Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CellState } from "./../../constants/EnumTypes"
import './Board.css';


class BoardCell extends PureComponent {
    render() {
        let { cell } = this.props;
        return (
            <Fragment>
                {cell === CellState.EMPTY && <div className="BoardCellEmpty"></div>}
                {cell === CellState.BUSY_SNAKE && <div className="BoardCellBusySnake"></div>}
                {cell === CellState.BUSY_APPLE && <div className="BoardCellBusyApple"></div>}
            </Fragment>
        );
    }
}

const BoardRow = ({ xItems }) => {
    return <div className="BoardRow">
        {
            xItems.map((yItem, index) => {
                return <BoardCell key={"yItem" + index} cell={yItem} />
            })
        }
    </div>

}

class Board extends Component {
    render() {
        return (
            <div className="Board">
                {
                    this.props.board.map((xItems, index) => {
                        return <BoardRow key={"xItem" + index} xItems={xItems} />
                    })
                }
            </div>
        );
    }
}

Board.defaultProps = {
    board: [],
    snake: [],
    apple: []
}

Board.propTypes = {
    board: PropTypes.array.isRequired,
    snake: PropTypes.array.isRequired,
    apple: PropTypes.array.isRequired
}

export default Board;
