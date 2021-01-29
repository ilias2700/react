import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./fontawesome-free-5.15.2-web/css/all.min.css"
import "./fontawesome-free-5.15.2-web/js/all.js"


class ItemForm extends React.Component {
    state = {
      text: '',
      new: true,
      done: false,
    };
  
    componentDidMount() {
      this.createNew();
    }
  
    createNew = () => {
      this.setState({
        text: '',
        new: true,
        done: false,
      }, () => {
        this.input.focus();
      });
    }
    
    onChange = e => {
      this.setState({ text: e.target.value });
    }
    
    onKeyPress = e => {
      const { onComplete } = this.props;
      
      if ( e && e.which === 13 || e.keyCode === 13 ) {
        
        if ( this.state.text === '' ) {
          return false;
        }
        
        onComplete && typeof onComplete === 'function' && onComplete(this.state);
        this.createNew();
      }
    }
  
    render() {
       const { text } = this.state;
      
      return (
        <div className="item-form">
          <label htmlFor="newItem"> <i class="fas fa-plus" style={{marginRight:'5px'}}></i>add new Item</label> {' '}
          <input
            id="newItem"
            type="text"
            ref={ el => { this.input = el; } }
            autofocus placeholder="Start typing..."
            value={ text }
            onChange={ this.onChange }
            onKeyPress={ this.onKeyPress } />
        </div>
      );
    }
  }
  
  const Text = ({ done, children, ...events }) => done ? 
        <s {...events}>{children}</s> : <span {...events}>{children}</span>;
  
  class Item extends React.Component {
    state = {
      editing: false,
    }
  
    startEditing = () => {
      this.setState({ editing: true }, () => {
        this.input.focus();
      });
    };
  
    endEditing = () => this.setState({ editing: false });
    
    render() {
      const { item, onToggle, onRemove, onChange } = this.props;
      const { editing } = this.state;
      
      return (
        <li className={ `item ${ editing ? 'editing' : '' }` }>
          <label>
            <input
            type="checkbox"
            checked={item.done}
            onChange={ onToggle }
            disabled={editing} />
            <span className="checkbox" />
          </label>
          
          <button onClick={ onRemove }>X</button>
          
          <span className="text-wrapper">
            <Text
              done={item.done}
              onDoubleClick={ this.startEditing }> { item.text } &nbsp; </Text>
            
            <input
              type="text"
              onBlur={ this.endEditing }
              onKeyPress={ e => e.which === 13 || e.keyCode === 13 ? this.endEditing(e) : () => {} }
              ref={ el => { this.input = el; } }
              onChange={ onChange }
              value={ item.text } />
          </span>
        </li>
      );
    }
  }
  
  class TodoApp extends React.Component {
    state = {
      items: [],
      filter: 0,
    };
  
    componentWillMount() {
      const { items } = this.props;
      
      this.setState({ items });
    }
  
    addItem = item => {
      this.setState(({ items }) => ({
        items: [
          {
            ...item,
            number: items.length,
          },
          ...items,
        ],
      }), this.save);
    }
    
    toggleItem = index => () => {
      this.setState(({ items }) => ({
        items: items.map((item, current) => {
          if ( index !== current ) {
            return item;
          }
          
          return {
            ...item,
            done: !item.done,
          };
        })
      }), this.save);
    }
    
    removeItem = index => () => {
      this.setState(({ items }) => ({
        items: items.filter((item, current) => index !== current)
      }), this.save);
    }
    
    changeItem = index => e => {
      const value = e && e.target ? e.target.value : null;
      
      this.setState(({ items }) => ({
        items: items.map((item, current) => {
          if ( index !== current ) {
            return item;
          }
          
          return {
            ...item,
            text: value === null ? item.text : value,
          };
        })
      }), this.save);
    }
    
    save = () => {
      localStorage.setItem('items', JSON.stringify(this.state.items));
    }
    
    setFilter = filter => e => {
      e.preventDefault();
      
      this.setState({ filter });
    };
  
    reset = e => {
      e.preventDefault();
  
      this.setState({ items: [] }, this.save);
    };
    
    render() {
      const { items = [], filter = 0 } = this.state;
      
      const filterItems = item => {
        if (filter === 1) {
          return item.done;
        };
  
        if (filter === 2) {
          return !item.done;
        };
  
        return item;
      };
      
      return (
        <div className="todo-app">
          <h2><i class="fas fa-list-ul" style={{marginRight:'5px'}}></i> TO-DO </h2>
          
          <ItemForm ref={ el => { this.itemForm = el; } } onComplete={ this.addItem } />
          
          <div className="filter-tabs">
            <a
              href="#root"
              onClick={ this.setFilter(0) }
              className={ `filter ${ filter === 0 ? 'disabled' : '' }` }>
              Show All
            </a>
            <a
              href="#root"
              onClick={ this.setFilter(1) }
              className={ `filter ${ filter === 1 ? 'disabled' : '' }` }>
              Completed <span>{ items.filter(item => item.done).length }</span>
            </a>
            <a
              href="#root"
              onClick={ this.setFilter(2) }
              className={ `filter ${ filter === 2 ? 'disabled' : '' }` }>
              Uncompleted <span>{ items.filter(item => !item.done).length }</span>
            </a>
          </div>
          
          <ul className="item-list">
            
            { items.length === 0 && <li className="placeholder">Add your first item</li> }
            
            { ( items.length > 0 
               && items.filter(filterItems).length === 0 )
               && <li className="placeholder">No items</li> }
            
            { items.map( (item, index) => {
              if ((filter === 1 && !item.done) 
                  || (filter === 2 && item.done)) {
                return null;
              };
  
              return <Item
                       item={ item }
                       key={ index }
                       onChange={ this.changeItem(index) }
                       onRemove={ this.removeItem(index) }
                       onToggle={ this.toggleItem(index) } />;
            }) }
          </ul>
          
          <div className="footer-actions">
            <a
              href="#root"
              className={ items.length === 0 ? 'disabled' : '' }
              disabled={ items.length === 0 }
              onClick={ this.reset }><i class="fas fa-trash" style={{marginRight:'5px'}}></i>Clear All</a>
          </div>
        </div>
      );
    }
  }
  
  let items = [];
  const initialItems = [
    // { "text": "Edit me (double click)", "done": false },
    // { "text": "I\'m done", "done": true },
    // { "text": "You can filter me", "done": true },
  ];
  
  try {
    items = JSON.parse(localStorage.getItem('items'));
  } catch(err) {}
  
  if ( items === null || items.length === 0 ) {
    items = initialItems;
  }
  
  ReactDOM.render(<TodoApp items={ items } />, window.root);
