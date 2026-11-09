import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './style.css';
import './workspace.css';
class Boundary extends React.Component<{children:React.ReactNode},{error:string}>{state={error:''};static getDerivedStateFromError(e:Error){return {error:e.message};}render(){return this.state.error?<main><h1>Не удалось показать страницу</h1><p>{this.state.error}</p><p>Обновите страницу. Несохранённые данные обращения будут очищены.</p><button onClick={()=>location.reload()}>Обновить</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<Boundary><App/></Boundary>);
