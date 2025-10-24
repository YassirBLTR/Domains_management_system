import React, { useEffect, useState } from 'react';
import { Globe, Server, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { domainsAPI } from '../api/domains';
import { providersAPI } from '../api/providers';
import { teamsAPI } from '../api/teams';
import { mailersAPI } from '../api/mailers';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDomains: 0,
    freeDomains: 0,
    assignedDomains: 0,
    providers: 0,
    teams: 0,
    mailers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [domains, providers, teams, mailers] = await Promise.all([
          domainsAPI.getAll(),
          providersAPI.getAll(),
          teamsAPI.getAll(),
          mailersAPI.getAll(),
        ]);

        setStats({
          totalDomains: domains.length,
          freeDomains: domains.filter(d => d.status === 'free').length,
          assignedDomains: domains.filter(d => d.status === 'assigned').length,
          providers: providers.length,
          teams: teams.length,
          mailers: mailers.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Domains',
      value: stats.totalDomains,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Free Domains',
      value: stats.freeDomains,
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Assigned Domains',
      value: stats.assignedDomains,
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Providers',
      value: stats.providers,
      icon: Server,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Teams',
      value: stats.teams,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Mailers',
      value: stats.mailers,
      icon: Mail,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your domain management system</p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-full`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
