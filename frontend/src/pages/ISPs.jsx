import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { ispsAPI } from '../api/isps';

const ISPs = () => {
  const navigate = useNavigate();
  const [isps, setIsps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedISP, setSelectedISP] = useState(null);
  const [formData, setFormData] = useState({
    isp_name: '',
  });

  useEffect(() => {
    fetchISPs();
  }, []);

  const fetchISPs = async () => {
    try {
      const data = await ispsAPI.getAll();
      setIsps(data);
    } catch (error) {
      console.error('Error fetching ISPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedISP) {
        await ispsAPI.update(selectedISP.id, formData);
      } else {
        await ispsAPI.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      fetchISPs();
    } catch (error) {
      console.error('Error saving ISP:', error);
      alert(error.response?.data?.detail || 'Error saving ISP');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ISP?')) {
      try {
        await ispsAPI.delete(id);
        fetchISPs();
      } catch (error) {
        console.error('Error deleting ISP:', error);
        alert(error.response?.data?.detail || 'Error deleting ISP');
      }
    }
  };

  const openEditDialog = (isp) => {
    setSelectedISP(isp);
    setFormData({
      isp_name: isp.isp_name,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedISP(null);
    setFormData({
      isp_name: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ISPs</h1>
            <p className="text-gray-500 mt-1">Manage Internet Service Providers (Gmail, Yahoo, Outlook, etc.)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/isp-domains')}>
              <FolderOpen className="h-4 w-4 mr-2" />
              View ISP Domains
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add ISP
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedISP ? 'Edit ISP' : 'Add New ISP'}</DialogTitle>
                <DialogDescription>
                  {selectedISP ? 'Update ISP information' : 'Add a new Internet Service Provider'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="isp_name">ISP Name</Label>
                    <Input
                      id="isp_name"
                      value={formData.isp_name}
                      onChange={(e) => setFormData({ ...formData, isp_name: e.target.value })}
                      placeholder="Gmail, Yahoo, Outlook, etc."
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedISP ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ISP Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                    No ISPs found. Add your first ISP to get started.
                  </TableCell>
                </TableRow>
              ) : (
                isps.map((isp) => (
                  <TableRow key={isp.id}>
                    <TableCell className="font-medium">{isp.isp_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(isp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(isp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default ISPs;
