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
import { teamsAPI } from '../api/teams';
import { ispsAPI } from '../api/isps';

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isps, setIsps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    team_name: '',
    isp_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsData, ispsData] = await Promise.all([
        teamsAPI.getAll(),
        ispsAPI.getAll(),
      ]);
      setTeams(teamsData);
      setIsps(ispsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTeam) {
        await teamsAPI.update(selectedTeam.id, formData);
      } else {
        await teamsAPI.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving team:', error);
      alert(error.response?.data?.detail || 'Error saving team');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert(error.response?.data?.detail || 'Error deleting team');
      }
    }
  };

  const openEditDialog = (team) => {
    setSelectedTeam(team);
    setFormData({
      team_name: team.team_name,
      isp_id: team.isp_id || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedTeam(null);
    setFormData({
      team_name: '',
      isp_id: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-500 mt-1">Manage teams and their ISP assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/team-domains')}>
              <FolderOpen className="h-4 w-4 mr-2" />
              View Team Domains
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
                <DialogDescription>
                  {selectedTeam ? 'Update team information' : 'Create a new team'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team_name">Team Name</Label>
                    <Input
                      id="team_name"
                      value={formData.team_name}
                      onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                      placeholder="Gmail Team 1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isp_id">ISP</Label>
                    <Select
                      value={formData.isp_id.toString()}
                      onValueChange={(value) => setFormData({ ...formData, isp_id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ISP" />
                      </SelectTrigger>
                      <SelectContent>
                        {isps.map((isp) => (
                          <SelectItem key={isp.id} value={isp.id.toString()}>
                            {isp.isp_name}
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
                    {selectedTeam ? 'Update' : 'Create'}
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
                <TableHead>Team Name</TableHead>
                <TableHead>ISP</TableHead>
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
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No teams found. Add your first team to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>
                      {isps.find(i => i.id === team.isp_id)?.isp_name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(team.id)}
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

export default Teams;
