import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  const fetchItems = async () => {
    const res = await axios.get('/api/items');
    setItems(res.data);
  };

  useEffect(() => { fetchItems(); }, []);

  const addItem = async () => {
    if (!input) return;
    await axios.post('/api/items', { name: input });
    setInput('');
    fetchItems();
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter item" />
      <button onClick={addItem}>Add</button>
      <ul>{items.map((item, i) => <li key={i}>{item.name}</li>)}</ul>
    </div>
  );
}

export default App;