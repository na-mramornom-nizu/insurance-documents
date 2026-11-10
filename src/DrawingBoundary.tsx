import {Component,ReactNode} from 'react';
export default class DrawingBoundary extends Component<{children:ReactNode;onClose:()=>void},{error:boolean}>{
 state={error:false};
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<div className="modal-back"><section className="modal" role="alertdialog"><h2>Не удалось показать схему</h2><p>Данные обращения сохранены в текущем окне. Закройте редактор и откройте его снова.</p><button type="button" onClick={this.props.onClose}>Вернуться к документам</button></section></div>:this.props.children;}
}
