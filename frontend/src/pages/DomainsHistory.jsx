import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { History, Search } from 'lucide-react';
import { assignmentHistoryAPI } from '../api/assignment-history';

const DomainsHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    try {
      const data = await assignmentHistoryAPI.getAll(0, 500);
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    if (!searchTerm) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter(record =>
      record.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assigned_by_username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-8 w-8" />
              Assignment History
            </h1>
            <p className="text-gray-500 mt-1">Track all domain assignment changes</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by domain name, assigned to, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Total Assignments</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{history.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Unique Domains</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {new Set(history.map(h => h.domain_name)).size}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-sm font-medium text-gray-500">Filtered Results</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{filteredHistory.length}</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rotation</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading assignment history...
                  </TableCell>
                </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching records found.' : 'No assignment history yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.domain_name}</TableCell>
                    <TableCell>{record.assigned_to_name}</TableCell>
                    <TableCell>
                      <Badge variant={record.assigned_to_type === 'team' ? 'default' : 'secondary'}>
                        {record.assigned_to_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.rotation}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{record.assigned_by_username}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(record.assigned_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Show count info */}
        {filteredHistory.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {filteredHistory.length} of {history.length} total assignments
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DomainsHistory;
