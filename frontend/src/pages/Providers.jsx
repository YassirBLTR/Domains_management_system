import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ExternalLink, Plus } from 'lucide-react';
import { providersAPI } from '../api/providers';
import { useAuth } from '../contexts/AuthContext';

const Providers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const data = await providersAPI.getAll();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderInfo = (providerName) => {
    const info = {
      godaddy: {
        name: 'GoDaddy',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'World\'s largest domain registrar',
        website: 'https://www.godaddy.com',
        apiDocs: 'https://developer.godaddy.com',
      },
      namecheap: {
        name: 'Namecheap',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'Affordable domains and hosting',
        website: 'https://www.namecheap.com',
        apiDocs: 'https://www.namecheap.com/support/api/',
      },
      dynadot: {
        name: 'Dynadot',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Domain registration and management',
        website: 'https://www.dynadot.com',
        apiDocs: 'https://www.dynadot.com/domain/api.html',
      },
    };
    return info[providerName?.toLowerCase()] || {
      name: providerName,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Domain provider',
      website: '#',
      apiDocs: '#',
    };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Providers</h1>
            <p className="text-gray-500 mt-1">Supported domain registrars</p>
          </div>
          {isAdmin() && (
            <Button onClick={() => navigate('/accounts')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const info = getProviderInfo(provider.provider_name);
              return (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={`${info.color} border`}>
                        {info.name}
                      </Badge>
                      <div className="flex gap-2">
                        <a
                          href={info.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                          title="Visit website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{info.name}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">API Documentation:</p>
                        <a
                          href={info.apiDocs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View API Docs
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {isAdmin() && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/accounts')}
                        >
                          Manage Accounts
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📚 How to Use</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>1. Get API Credentials:</strong> Visit each provider's website and generate API keys
            </p>
            <p>
              <strong>2. Add Accounts:</strong> Go to the <button onClick={() => navigate('/accounts')} className="underline font-medium">Accounts page</button> and add your provider accounts with API credentials
            </p>
            <p>
              <strong>3. Sync Domains:</strong> Use the sync button to automatically fetch all domains from your provider accounts
            </p>
            <p>
              <strong>4. Manage Domains:</strong> View and assign domains to teams and mailers
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Providers;
