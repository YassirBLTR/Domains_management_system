import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Globe, Server } from 'lucide-react';
import { mailersAPI } from '../api/mailers';
import { domainsAPI } from '../api/domains';

const MailerDomains = () => {
  const [mailers, setMailers] = useState([]);
  const [selectedMailer, setSelectedMailer] = useState(null);
  const [domains, setDomains] = useState([]);
  const [mailerDomains, setMailerDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMailers();
    fetchDomains();
  }, []);

  useEffect(() => {
    filterDomainsByMailer();
  }, [selectedMailer, domains]);

  const fetchMailers = async () => {
    try {
      const data = await mailersAPI.getAll();
      setMailers(data);
      if (data.length > 0) {
        setSelectedMailer(data[0]);
      }
    } catch (error) {
      console.error('Error fetching mailers:', error);
    }
  };

  const fetchDomains = async () => {
    try {
      const data = await domainsAPI.getAll();
      setDomains(data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDomainsByMailer = () => {
    if (!selectedMailer) {
      setMailerDomains([]);
      return;
    }

    const filtered = domains.filter(domain => 
      domain.assigned_to_mailer === selectedMailer.mailer_name
    );
    setMailerDomains(filtered);
  };

  const handleMailerChange = (mailerId) => {
    const mailer = mailers.find(m => m.id === parseInt(mailerId));
    setSelectedMailer(mailer);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Mailer Domains
          </h1>
          <p className="text-gray-500 mt-1">View domains assigned to each mailer</p>
        </div>

        {/* Mailer Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Mailer</CardTitle>
            <CardDescription>Choose a mailer to view their assigned domains</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedMailer?.id.toString() || ""}
              onValueChange={handleMailerChange}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Select a mailer" />
              </SelectTrigger>
              <SelectContent>
                {mailers.map((mailer) => (
                  <SelectItem key={mailer.id} value={mailer.id.toString()}>
                    {mailer.mailer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Statistics */}
        {selectedMailer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Mailer Name</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedMailer.mailer_name}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mailerDomains.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">ISP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedMailer.isp_name || 'Not assigned'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Domains Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Domains</CardTitle>
            <CardDescription>
              {selectedMailer ? `Domains assigned to ${selectedMailer.mailer_name}` : 'Select a mailer to view domains'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Server (A Record)</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Rotation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading domains...
                    </TableCell>
                  </TableRow>
                ) : !selectedMailer ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Please select a mailer to view their domains
                    </TableCell>
                  </TableRow>
                ) : mailerDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No domains assigned to this mailer yet
                    </TableCell>
                  </TableRow>
                ) : (
                  mailerDomains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          {domain.domain_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-gray-400" />
                          {domain.server || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {domain.provider_name ? (
                          <Badge variant="outline">
                            {domain.provider_name.charAt(0).toUpperCase() + domain.provider_name.slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.account_name || <span className="text-gray-400">-</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{domain.rotation}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MailerDomains;
