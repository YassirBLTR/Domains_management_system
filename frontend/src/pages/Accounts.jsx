import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { accountsAPI } from '../api/accounts';
import { providersAPI } from '../api/providers';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { getProviderBadgeColor } from '../utils/providerColors';

const Accounts = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [testingConnection, setTestingConnection] = useState({});
  const [syncingDomains, setSyncingDomains] = useState({});
  const [formData, setFormData] = useState({
    account_name: '',
    provider_id: '',
    api_key: '',
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsData, providersData] = await Promise.all([
        accountsAPI.getAll(),
        providersAPI.getAll()
      ]);
      setAccounts(accountsData);
      setProviders(providersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAccount) {
        await accountsAPI.update(selectedAccount.id, formData);
        toast({
          title: 'Success',
          description: 'Account updated successfully',
        });
      } else {
        await accountsAPI.create(formData);
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error saving account',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? All associated domains will be unlinked.')) {
      try {
        await accountsAPI.delete(id);
        toast({
          title: 'Success',
          description: 'Account deleted successfully',
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.detail || 'Error deleting account',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTestConnection = async (accountId) => {
    setTestingConnection({ ...testingConnection, [accountId]: true });
    try {
      const result = await accountsAPI.testConnection(accountId);
      toast({
        title: result.connected ? 'Connection Successful' : 'Connection Failed',
        description: result.message,
        variant: result.connected ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test connection',
        variant: 'destructive',
      });
    } finally {
      setTestingConnection({ ...testingConnection, [accountId]: false });
    }
  };

  const handleSyncDomains = async (accountId) => {
    setSyncingDomains({ ...syncingDomains, [accountId]: true });
    try {
      const result = await accountsAPI.syncDomains(accountId);
      toast({
        title: 'Sync Complete',
        description: `Added: ${result.added}, Updated: ${result.updated}, Total: ${result.total_fetched}`,
      });
      if (result.errors && result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error.response?.data?.detail || 'Failed to sync domains',
        variant: 'destructive',
      });
    } finally {
      setSyncingDomains({ ...syncingDomains, [accountId]: false });
    }
  };

  const openEditDialog = (account) => {
    setSelectedAccount(account);
    setFormData({
      account_name: account.account_name,
      provider_id: account.provider_id.toString(),
      api_key: account.api_key || '',
      username: account.username || '',
      email: account.email || '',
      password: '', // Don't populate password for security
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedAccount(null);
    setFormData({
      account_name: '',
      provider_id: '',
      api_key: '',
      username: '',
      email: '',
      password: '',
    });
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.provider_name : 'Unknown';
  };


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Accounts</h1>
            <p className="text-gray-500 mt-1">Manage your provider account credentials and sync domains</p>
          </div>
          {isAdmin() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                  <DialogDescription>
                    {selectedAccount ? 'Update account credentials' : 'Add a new provider account with API credentials'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_name">Account Name *</Label>
                      <Input
                        id="account_name"
                        value={formData.account_name}
                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                        placeholder="e.g., GoDaddy Main Account"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="provider_id">Provider *</Label>
                      <Select
                        value={formData.provider_id}
                        onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id.toString()}>
                              {provider.provider_name.charAt(0).toUpperCase() + provider.provider_name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key *</Label>
                      <Input
                        id="api_key"
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        placeholder="Your API key"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap'
                          ? 'Namecheap Username'
                          : 'Email'}
                        {formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap' && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      <Input
                        id="email"
                        type={formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap' ? 'text' : 'email'}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={
                          formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap'
                            ? "Your Namecheap username (e.g., Leadsvoice380)"
                            : "account@example.com"
                        }
                        required={formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap'}
                      />
                      {formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap' && (
                        <p className="text-xs text-amber-600">
                          ⚠️ Use your Namecheap <strong>username</strong>, not your email address
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password / API Secret / Client IP
                        {formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap' && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      <Input
                        id="password"
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={
                          formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap'
                            ? "Your whitelisted IP address (e.g., 123.45.67.89)"
                            : "API secret or IP whitelist"
                        }
                        required={formData.provider_id && providers.find(p => p.id.toString() === formData.provider_id)?.provider_name.toLowerCase() === 'namecheap'}
                      />
                      <p className="text-xs text-gray-500">
                        <strong>GoDaddy:</strong> API Secret | <strong>Namecheap:</strong> Your whitelisted public IP (required) | <strong>Dynadot:</strong> Leave empty
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedAccount ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>API Key</TableHead>
                {isAdmin() && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No accounts found. Add your first provider account to get started.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.account_name}</TableCell>
                    <TableCell>
                      <Badge className={getProviderBadgeColor(getProviderName(account.provider_id))}>
                        {getProviderName(account.provider_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.email || '-'}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{account.api_key ? '••••••••' : '-'}</span>
                    </TableCell>
                    {isAdmin() && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(account.id)}
                            disabled={testingConnection[account.id]}
                            title="Test API Connection"
                          >
                            {testingConnection[account.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSyncDomains(account.id)}
                            disabled={syncingDomains[account.id]}
                            title="Sync Domains"
                          >
                            {syncingDomains[account.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(account)}
                            title="Edit Account"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(account.id)}
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {accounts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Actions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Test Connection:</strong> Verify your API credentials are working</li>
              <li>• <strong>Sync Domains:</strong> Fetch all domains from this provider account</li>
              <li>• <strong>Edit:</strong> Update account credentials</li>
              <li>• <strong>Delete:</strong> Remove account (domains will be unlinked)</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Accounts;
