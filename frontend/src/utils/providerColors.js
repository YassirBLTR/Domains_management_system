/**
 * Provider color utilities for consistent styling across the application
 */

export const getProviderBadgeColor = (providerName) => {
  const colors = {
    godaddy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    namecheap: 'bg-amber-100 text-amber-700 border-amber-200',
    dynadot: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return colors[providerName?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
};

export const getProviderInfo = (providerName) => {
  const info = {
    godaddy: {
      name: 'GoDaddy',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description: 'World\'s largest domain registrar',
      website: 'https://www.godaddy.com',
      apiDocs: 'https://developer.godaddy.com',
    },
    namecheap: {
      name: 'Namecheap',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      description: 'Affordable domains and hosting',
      website: 'https://www.namecheap.com',
      apiDocs: 'https://www.namecheap.com/support/api/',
    },
    dynadot: {
      name: 'Dynadot',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: 'Domain registration and management',
      website: 'https://www.dynadot.com',
      apiDocs: 'https://www.dynadot.com/domain/api.html',
    },
  };
  return info[providerName?.toLowerCase()] || {
    name: providerName,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    description: 'Domain provider',
    website: '#',
    apiDocs: '#',
  };
};

export const PROVIDER_COLORS = {
  GODADDY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  NAMECHEAP: 'bg-amber-100 text-amber-700 border-amber-200',
  DYNADOT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200',
};
