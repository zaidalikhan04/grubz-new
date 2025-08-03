import React, { useState } from 'react';
import { useCrud } from '../hooks/useCrud';

interface Item {
  id: string;
  name: string;
  description: string;
}

export const CrudExample: React.FC = () => {
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [editItem, setEditItem] = useState<Item | null>(null);

  const {
    data: items,
    loading,
    error,
    create,
    update,
    remove
  } = useCrud({ collectionName: 'items' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(newItem);
      setNewItem({ name: '', description: '' });
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      await update(editItem.id, {
        name: editItem.name,
        description: editItem.description
      });
      setEditItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">CRUD Example</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 rounded mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="border p-2 rounded mr-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Item
          </button>
        </div>
      </form>

      {/* Edit Form */}
      {editItem && (
        <form onSubmit={handleUpdate} className="mb-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={editItem.name}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={editItem.description}
              onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
              className="border p-2 rounded mr-2"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setEditItem(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 gap-4">
        {items.map((item: Item) => (
          <div
            key={item.id}
            className="border p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            <div>
              <button
                onClick={() => setEditItem(item)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};