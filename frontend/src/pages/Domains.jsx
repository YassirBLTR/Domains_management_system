import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Link2, Unlink, Search, ChevronLeft, ChevronRight, RefreshCw, UsersRound, Mail } from 'lucide-react';
import { domainsAPI } from '../api/domains';
import { providersAPI } from '../api/providers';
import { teamsAPI } from '../api/teams';
import { mailersAPI } from '../api/mailers';
import { useAuth } from '../contexts/AuthContext';
import { getProviderBadgeColor } from '../utils/providerColors';

const Domains = () => {
  const { isAdmin } = useAuth();
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [providers, setProviders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [mailers, setMailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [assignData, setAssignData] = useState({
    assignType: 'team',
    team_id: '',
    mailer_id: '',
  });
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDomains();
  }, [domains, searchTerm, statusFilter, providerFilter]);

  const filterDomains = () => {
    let filtered = [...domains];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(domain =>
        domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.server?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(domain => domain.status === statusFilter);
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter(domain => domain.provider_name?.toLowerCase() === providerFilter.toLowerCase());
    }

    setFilteredDomains(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const fetchData = async () => {
    try {
      const [domainsData, providersData, teamsData, mailersData] = await Promise.all([
        domainsAPI.getAll(),
        providersAPI.getAll(),
        teamsAPI.getAll(),
        mailersAPI.getAll(),
      ]);
      setDomains(domainsData);
      setFilteredDomains(domainsData);
      setProviders(providersData);
      setTeams(teamsData);
      setMailers(mailersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      if (assignData.assignType === 'team') {
        await domainsAPI.assign(selectedDomain.id, assignData.team_id, null);
      } else {
        await domainsAPI.assign(selectedDomain.id, null, assignData.mailer_id);
      }
      setAssignDialogOpen(false);
      setSelectedDomain(null);
      setAssignData({ assignType: 'team', team_id: '', mailer_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error assigning domain:', error);
      alert(error.response?.data?.detail || 'Error assigning domain');
    }
  };

  const handleUnassign = async (id) => {
    if (window.confirm('Are you sure you want to unassign this domain?')) {
      try {
        await domainsAPI.unassign(id);
        fetchData();
      } catch (error) {
        console.error('Error unassigning domain:', error);
        alert(error.response?.data?.detail || 'Error unassigning domain');
      }
    }
  };

  const openAssignDialog = (domain) => {
    setSelectedDomain(domain);
    setAssignDialogOpen(true);
  };

  const handleRefreshDns = async (domainId) => {
    try {
      await domainsAPI.refreshDns(domainId);
      fetchData();
      alert('DNS A record refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing DNS:', error);
      alert(error.response?.data?.detail || 'Error refreshing DNS record');
    }
  };

  const handleRefreshAllDns = async () => {
    if (window.confirm('This will refresh A records for ALL domains. This may take some time. Continue?')) {
      setLoading(true);
      try {
        const result = await domainsAPI.refreshAllDns();
        fetchData();
        alert(`DNS refresh complete!\nUpdated: ${result.updated}\nFailed: ${result.failed}\nTotal: ${result.total_domains}`);
      } catch (error) {
        console.error('Error refreshing all DNS:', error);
        alert(error.response?.data?.detail || 'Error refreshing DNS records');
      } finally {
        setLoading(false);
      }
    }
  };


  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDomains = filteredDomains.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getUniqueProviders = () => {
    const providers = [...new Set(domains.map(d => d.provider_name).filter(Boolean))];
    return providers.sort();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domains</h1>
            <p className="text-gray-500 mt-1">Manage your domain inventory</p>
          </div>
          {isAdmin() && (
            <Button variant="outline" onClick={handleRefreshAllDns}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All DNS
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search domains, server, or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {getUniqueProviders().map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            Showing {currentDomains.length} of {filteredDomains.length} domains
            {filteredDomains.length !== domains.length && ` (filtered from ${domains.length} total)`}
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rotation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No domains found. Add your first domain to get started.
                  </TableCell>
                </TableRow>
              ) : (
                currentDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.domain_name}</TableCell>
                    <TableCell>{domain.server || '-'}</TableCell>
                    <TableCell>
                      {domain.provider_name ? (
                        <Badge className={getProviderBadgeColor(domain.provider_name)}>
                          {domain.provider_name.charAt(0).toUpperCase() + domain.provider_name.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No Provider</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.account_name ? (
                        <span className="text-sm text-gray-700">{domain.account_name}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={domain.status === 'free' ? 'success' : 'warning'}>
                          {domain.status}
                        </Badge>
                        {domain.status === 'assigned' && (
                          <div className="text-xs text-gray-600 mt-1">
                            {domain.assigned_to_team && (
                              <div className="flex items-center gap-1">
                                <UsersRound className="h-3 w-3" />
                                <span>{domain.assigned_to_team}</span>
                              </div>
                            )}
                            {domain.assigned_to_mailer && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{domain.assigned_to_mailer}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{domain.rotation}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignDialog(domain)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        {domain.status === 'assigned' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnassign(domain.id)}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshDns(domain.id)}
                            title="Refresh DNS A record"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="min-w-[40px]"
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-2 py-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Domain</DialogTitle>
            <DialogDescription>
              Assign {selectedDomain?.domain_name} to a team or mailer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={assignData.assignType}
                  onValueChange={(value) => setAssignData({ ...assignData, assignType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="mailer">Mailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assignData.assignType === 'team' ? (
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select
                    value={assignData.team_id.toString()}
                    onValueChange={(value) => setAssignData({ ...assignData, team_id: parseInt(value) })}
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
              ) : (
                <div className="space-y-2">
                  <Label>Mailer</Label>
                  <Select
                    value={assignData.mailer_id.toString()}
                    onValueChange={(value) => setAssignData({ ...assignData, mailer_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mailer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mailers.map((mailer) => (
                        <SelectItem key={mailer.id} value={mailer.id.toString()}>
                          {mailer.mailer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Domains;
