import { useState, useEffect } from 'react';
import { CrudService } from '../services/crudService';
import { DocumentData } from 'firebase/firestore';

interface UseCrudProps {
  collectionName: string;
}

export const useCrud = ({ collectionName }: UseCrudProps) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const crudService = new CrudService(collectionName);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = crudService.subscribeToChanges((newData) => {
      setData(newData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [collectionName]);

  const create = async (newData: any) => {
    try {
      setError(null);
      const id = await crudService.create(newData);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating');
      throw err;
    }
  };

  const read = async (id: string) => {
    try {
      setError(null);
      return await crudService.read(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while reading');
      throw err;
    }
  };

  const update = async (id: string, updateData: any) => {
    try {
      setError(null);
      await crudService.update(id, updateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      setError(null);
      await crudService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
      throw err;
    }
  };

  const query = async (field: string, operator: any, value: any) => {
    try {
      setError(null);
      return await crudService.query(field, operator, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while querying');
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    create,
    read,
    update,
    remove,
    query
  };
};