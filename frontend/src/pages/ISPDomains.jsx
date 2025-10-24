import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Wifi, Globe, Server, Users, Mail } from 'lucide-react';
import { ispsAPI } from '../api/isps';
import { teamsAPI } from '../api/teams';
import { mailersAPI } from '../api/mailers';
import { domainsAPI } from '../api/domains';

const ISPDomains = () => {
  const [isps, setIsps] = useState([]);
  const [selectedISP, setSelectedISP] = useState(null);
  const [teams, setTeams] = useState([]);
  const [mailers, setMailers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [ispDomains, setIspDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDomainsByISP();
  }, [selectedISP, domains, teams, mailers]);

  const fetchData = async () => {
    try {
      const [ispsData, teamsData, mailersData, domainsData] = await Promise.all([
        ispsAPI.getAll(),
        teamsAPI.getAll(),
        mailersAPI.getAll(),
        domainsAPI.getAll(),
      ]);
      
      setIsps(ispsData);
      setTeams(teamsData);
      setMailers(mailersData);
      setDomains(domainsData);
      
      if (ispsData.length > 0) {
        setSelectedISP(ispsData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDomainsByISP = () => {
    if (!selectedISP) {
      setIspDomains([]);
      return;
    }

    // Get teams and mailers for this ISP
    const ispTeams = teams.filter(t => t.isp_id === selectedISP.id);
    const ispMailers = mailers.filter(m => m.isp_id === selectedISP.id);

    // Get team and mailer names
    const teamNames = ispTeams.map(t => t.team_name);
    const mailerNames = ispMailers.map(m => m.mailer_name);

    // Filter domains assigned to these teams or mailers
    const filtered = domains.filter(domain => 
      (domain.assigned_to_team && teamNames.includes(domain.assigned_to_team)) ||
      (domain.assigned_to_mailer && mailerNames.includes(domain.assigned_to_mailer))
    );

    setIspDomains(filtered);
  };

  const handleISPChange = (ispId) => {
    const isp = isps.find(i => i.id === parseInt(ispId));
    setSelectedISP(isp);
  };

  const getAssignedToInfo = (domain) => {
    if (domain.assigned_to_team) {
      return {
        type: 'Team',
        name: domain.assigned_to_team,
        icon: Users
      };
    } else if (domain.assigned_to_mailer) {
      return {
        type: 'Mailer',
        name: domain.assigned_to_mailer,
        icon: Mail
      };
    }
    return null;
  };

  const getTeamsCount = () => {
    if (!selectedISP) return 0;
    return teams.filter(t => t.isp_id === selectedISP.id).length;
  };

  const getMailersCount = () => {
    if (!selectedISP) return 0;
    return mailers.filter(m => m.isp_id === selectedISP.id).length;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wifi className="h-8 w-8" />
            ISP Domains
          </h1>
          <p className="text-gray-500 mt-1">View all domains assigned to each ISP (via teams and mailers)</p>
        </div>

        {/* ISP Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select ISP</CardTitle>
            <CardDescription>Choose an ISP to view all domains assigned through their teams and mailers</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedISP?.id.toString() || ""}
              onValueChange={handleISPChange}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Select an ISP" />
              </SelectTrigger>
              <SelectContent>
                {isps.map((isp) => (
                  <SelectItem key={isp.id} value={isp.id.toString()}>
                    {isp.isp_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Statistics */}
        {selectedISP && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">ISP Name</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedISP.isp_name}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{ispDomains.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getTeamsCount()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">Mailers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{getMailersCount()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Domains Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Domains</CardTitle>
            <CardDescription>
              {selectedISP ? `All domains assigned to ${selectedISP.isp_name} through teams and mailers` : 'Select an ISP to view domains'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Server (A Record)</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Rotation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading domains...
                    </TableCell>
                  </TableRow>
                ) : !selectedISP ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Please select an ISP to view their domains
                    </TableCell>
                  </TableRow>
                ) : ispDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No domains assigned to this ISP yet
                    </TableCell>
                  </TableRow>
                ) : (
                  ispDomains.map((domain) => {
                    const assignedInfo = getAssignedToInfo(domain);
                    const AssignedIcon = assignedInfo?.icon;
                    
                    return (
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
                          {assignedInfo && (
                            <div className="flex items-center gap-2">
                              <AssignedIcon className="h-4 w-4 text-gray-400" />
                              {assignedInfo.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {assignedInfo && (
                            <Badge variant={assignedInfo.type === 'Team' ? 'default' : 'secondary'}>
                              {assignedInfo.type}
                            </Badge>
                          )}
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
                          <Badge variant="secondary">{domain.rotation}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ISPDomains;
