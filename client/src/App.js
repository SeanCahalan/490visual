import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: {}
        }
    }

    componentDidMount() {
        window.socket = window.io.connect('http://localhost:8083');
        window.socket.on('news', (data) => {
            console.log(data);
            this.setState({data: data})
            window.socket.emit('my other event', { my: 'data' });
        });
    }

    render() {
        return (
        <div className="App">
            {this.state.data}
        </div>
        );
    }
}

export default App;
