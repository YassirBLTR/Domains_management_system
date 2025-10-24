import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { mailersAPI } from '../api/mailers';
import { teamsAPI } from '../api/teams';

const Mailers = () => {
  const navigate = useNavigate();
  const [mailers, setMailers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMailer, setSelectedMailer] = useState(null);
  const [formData, setFormData] = useState({
    mailer_name: '',
    team_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mailersData, teamsData] = await Promise.all([
        mailersAPI.getAll(),
        teamsAPI.getAll(),
      ]);
      setMailers(mailersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMailer) {
        await mailersAPI.update(selectedMailer.id, formData);
      } else {
        await mailersAPI.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving mailer:', error);
      alert(error.response?.data?.detail || 'Error saving mailer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mailer?')) {
      try {
        await mailersAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting mailer:', error);
        alert(error.response?.data?.detail || 'Error deleting mailer');
      }
    }
  };

  const openEditDialog = (mailer) => {
    setSelectedMailer(mailer);
    setFormData({
      mailer_name: mailer.mailer_name,
      team_id: mailer.team_id || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedMailer(null);
    setFormData({
      mailer_name: '',
      team_id: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mailers</h1>
            <p className="text-gray-500 mt-1">Manage mailers and their team assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/mailer-domains')}>
              <FolderOpen className="h-4 w-4 mr-2" />
              View Mailer Domains
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mailer
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedMailer ? 'Edit Mailer' : 'Add New Mailer'}</DialogTitle>
                <DialogDescription>
                  {selectedMailer ? 'Update mailer information' : 'Create a new mailer'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="mailer_name">Mailer Name</Label>
                    <Input
                      id="mailer_name"
                      value={formData.mailer_name}
                      onChange={(e) => setFormData({ ...formData, mailer_name: e.target.value })}
                      placeholder="Mailer 1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_id">Team</Label>
                    <Select
                      value={formData.team_id.toString()}
                      onValueChange={(value) => setFormData({ ...formData, team_id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedMailer ? 'Update' : 'Create'}
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
                <TableHead>Mailer Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : mailers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No mailers found. Add your first mailer to get started.
                  </TableCell>
                </TableRow>
              ) : (
                mailers.map((mailer) => (
                  <TableRow key={mailer.id}>
                    <TableCell className="font-medium">{mailer.mailer_name}</TableCell>
                    <TableCell>
                      {teams.find(t => t.id === mailer.team_id)?.team_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(mailer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(mailer.id)}
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

export default Mailers;
