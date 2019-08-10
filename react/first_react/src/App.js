import React, { Component } from 'react';
import Navigation from './components/Navigation';
import Content from './components/Content';
import Subject from './components/Subject';
import './App.css';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            mode: 'read',
            selected_content_id: 2,
            welcome: {title: 'Welcome', desc: 'Hello, React!!'},
            subject: {
                title: 'WEB',
                sub: 'World Wide Web!'
            },
            contents: [
                {id:1, title:'HTML', desc: 'HTML is for information'},
                {id:2, title:'CSS', desc: 'CSS is for design'},
                {id:3, title: 'JavaScript', desc: 'JavaScript is for interactive'}
            ]
        }
    }

    render() {
        var _title, _desc = null;
        if(this.state.mode === 'welcome'){
            _title = this.state.welcome.title;
            _desc = this.state.welcome.desc;
        } else if(this.state.mode === 'read') {
            for(var i=0;i< this.state.contents.length;i++){
                var data = this.state.contents[i];
                if(data.id === this.state.selected_content_id) {
                    _title = data.title;
                    _desc = data.desc;
                    break;
                }
            }
        }
        return (
            <div className="App">
                <Subject
                    title={this.state.subject.title}
                    sub={this.state.subject.sub}
                    onChangePage = {function(){
                        this.setState({
                            mode: 'welcome'
                        });
                    }.bind(this)}>
                </Subject>
                <Navigation
                    data={this.state.contents}
                    onChangePage = {function(id){
                        this.setState({
                            mode: 'read',
                            selected_content_id: id
                        })
                    }.bind(this)}></Navigation>
                <Content
                    title={_title}
                    desc={_desc}></Content>
            </div>
        );
    }
}

export default App