import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { getGridSize } from '../redux/selectors';
import { changeGridSize } from '../redux/actions';

class Slider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,

            originalX: 0,
            translateX: 0,
            lastTranslateX: 0,
            boundingWidth: 0,

            maxGridSize: 50,
            currGridSize: 25
        };
    }

    componentDidMount() {
        const {
            xPosition
        } = this.props;
        const { barRef } = this.refs;
        const boundingWidth = barRef.clientWidth - 16;
        this.setState({
            xPosition,
            boundingWidth,
            translateX: boundingWidth/2,
            lastTranslateX: boundingWidth/2
         });
        

        // calculate initial X position here based on scale 5 - 50 x coords
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown(ev) {
        let { clientX } = ev;
        // mousemove: obtain cursor position
        // mouseup: save position for the element
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));

        this.setState({
          originalX: clientX,
          isDragging: true
        });
    }

    handleMouseMove(ev) {
        let { clientX } = ev;
        const {
            isDragging,
            boundingWidth,
            originalX,
            lastTranslateX
         } = this.state;
         let translateX = clientX - originalX + lastTranslateX;

        if (!isDragging) {
            return;
        }

        if (translateX > boundingWidth) {
            translateX = boundingWidth;
        }
        if (translateX < 0) {
            translateX = 0;
        }

        this.setState({ translateX });

        const barWidth = this.refs.barRef.clientWidth - 16;
        const { maxGridSize } = this.state;
        let newGridSize = Math.round(lastTranslateX/barWidth * maxGridSize);
        newGridSize = (newGridSize > 2) ? newGridSize : 2;
        this.setState({
            currGridSize: newGridSize
        })

    }

    handleMouseUp() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        
        this.setState({
            originalX: 0,
            lastTranslateX: this.state.translateX,
            isDragging: false
        });

        this.handleGridSizeChange();
    }

    handleGridSizeChange() {
        const barWidth = this.refs.barRef.clientWidth - 16;
        const { lastTranslateX, maxGridSize } = this.state;
        const newGridSize = Math.round(lastTranslateX/barWidth * maxGridSize);

        this.props.changeGridSize(newGridSize > 2 ? newGridSize : 2);
        this.props.createNewGrid();
    }

    handleLocalGridSizeChange() {
        const barWidth = this.refs.barRef.clientWidth - 16;
        const { lastTranslateX, maxGridSize } = this.state;
        let newGridSize = Math.round(lastTranslateX/barWidth * maxGridSize);
        newGridSize = (newGridSize > 2) ? newGridSize : 2;
        this.setState({
            currGridSize: newGridSize
        })
    }

    render() {
        const {
            translateX,
            currGridSize,
            isDragging
        } = this.state;

        return (
            <Container>
                <Bar
                    ref="barRef"
                >
                    <Ball
                        ref="ballRef"
                        onMouseDown={this.handleMouseDown.bind(this)}
                        x={translateX}
                        currGridSize={currGridSize}
                        isDragging={isDragging}   
                    />
                </Bar>
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    const gridSize = getGridSize(state);
    return { gridSize };
}

const Container = styled.div`
    position: relative;
    width: 10rem;
    height: 2rem; 
`;

const Bar = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 9.5rem;
    height: 5px;
    border-radius: 2px;
    background-color: #007bff;
`;

const Ball = styled.div.attrs({
    style: ({ x }) => ({
        transform: `translate(${x}px, -50%)`
    }),
})`
    cursor: grab;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: #d3d3d3;

    ::before {
        content: '${props => props.currGridSize}';
        position: absolute;
        top: -50%;
        transform: translateY(-50%);
        font-size: 10px;
    }

    ${({ isDragging }) => 
    isDragging && css`
        cursor: grabbing;
    `};
`;

export default connect(mapStateToProps, { changeGridSize })(Slider)
