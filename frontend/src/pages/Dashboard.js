import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container, Typography, Paper, TextField, Button, Grid, Card, CardContent, CardActions,
  IconButton, Chip, MenuItem, Select, FormControl, InputLabel, Pagination, Skeleton,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Box, useTheme
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const categories = ['All', 'Work', 'Personal', 'Shopping', 'Health'];

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [completedFilter, setCompletedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (completedFilter !== '') params.completed = completedFilter;
      const res = await axios.get('/api/items', { params, headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      enqueueSnackbar('Failed to load items', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, search, categoryFilter, completedFilter, page, enqueueSnackbar]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await axios.post('/api/items', { name, category, dueDate: dueDate || null }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setName(''); setCategory('Personal'); setDueDate('');
      fetchItems();
      enqueueSnackbar('Item added', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to add', { variant: 'error' });
    }
  };

  const handleToggleComplete = async (item) => {
    await axios.put(`/api/items/${item._id}`, { completed: !item.completed }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/items/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchItems();
    enqueueSnackbar('Item deleted', { variant: 'info' });
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    await axios.put(`/api/items/${editItem._id}`, {
      name: editItem.name,
      category: editItem.category,
      dueDate: editItem.dueDate,
      completed: editItem.completed
    }, { headers: { Authorization: `Bearer ${token}` } });
    setEditOpen(false);
    fetchItems();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const updated = reordered.map((item, index) => ({ ...item, order: index }));
    setItems(updated);
    await axios.put('/api/items/reorder', { items: updated.map(({ _id, order }) => ({ _id, order })) }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom align="center">
        Your Tasks
      </Typography>

      {/* Add form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} component="form" onSubmit={handleAdd}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="New Task" value={name} onChange={(e) => setName(e.target.value)} required />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                {categories.filter(c => c !== 'All').map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button type="submit" variant="contained" fullWidth startIcon={<Add />} sx={{ height: '56px' }}>Add</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} InputProps={{ startAdornment: <Search color="action" /> }} />
          </Grid>
          <Grid item xs={4} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={completedFilter} label="Status" onChange={(e) => { setCompletedFilter(e.target.value); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Active</MenuItem>
                <MenuItem value="true">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={2} display="flex" justifyContent="flex-end">
            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
          </Grid>
        </Grid>
      </Paper>

      {/* Drag & Drop context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <Grid container spacing={2}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                      </Grid>
                    ))
                  : items.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <Grid item xs={12} sm={6} md={4} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card
                              elevation={snapshot.isDragging ? 6 : 1}
                              sx={{
                                borderRadius: 2,
                                opacity: item.completed ? 0.7 : 1,
                                backgroundColor: item.completed ? 'action.disabledBackground' : 'background.paper',
                                transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                                transition: 'all 0.2s',
                              }}
                            >
                              <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Typography variant="h6" sx={{ textDecoration: item.completed ? 'line-through' : 'none', fontWeight: 500 }}>
                                    {item.name}
                                  </Typography>
                                  <Checkbox checked={item.completed} onChange={() => handleToggleComplete(item)} color="success" />
                                </Box>
                                <Box display="flex" gap={1} mt={1}>
                                  <Chip label={item.category} size="small" color="primary" variant="outlined" />
                                  {item.dueDate && (
                                    <Chip label={new Date(item.dueDate).toLocaleDateString()} size="small" variant="outlined" />
                                  )}
                                </Box>
                              </CardContent>
                              <CardActions>
                                <IconButton size="small" onClick={() => openEdit(item)}><Edit fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={() => handleDelete(item._id)}><Delete fontSize="small" /></IconButton>
                              </CardActions>
                            </Card>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                {provided.placeholder}
              </Grid>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {editItem && (
            <Box sx={{ pt: 1 }}>
              <TextField fullWidth margin="normal" label="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select value={editItem.category} label="Category" onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                  {categories.filter(c => c !== 'All').map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth margin="normal" type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={editItem.dueDate ? editItem.dueDate.substring(0,10) : ''} onChange={(e) => setEditItem({ ...editItem, dueDate: e.target.value })} />
              <Checkbox checked={editItem.completed} onChange={(e) => setEditItem({ ...editItem, completed: e.target.checked })} /> Completed
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;