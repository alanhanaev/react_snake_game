import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainPage from './components/MainPage/MainPage';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MainPage />, document.getElementById('root'));
registerServiceWorker();
