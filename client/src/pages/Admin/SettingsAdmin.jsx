import { useState, useEffect } from 'react';
import { Save, Store, Mail, Globe, Shield, Bell, DollarSign, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const SettingsAdmin = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceSaved, setMaintenanceSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'BuildMart Hardware Store',
    siteDescription: 'Quality hardware and tools for professionals',
    contactEmail: 'ugwanezav@gmail.com',
    contactPhone: '+250 788 123 456',
    address: 'Kigali, Rwanda',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: '18',
    shippingFee: '5000',
    freeShippingThreshold: '50000',
    emailFrom: 'noreply@hardwarestore.com',
    maintenanceMode: false,
  });

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await axiosClient.get('/settings');
        if (response.data.success) {
          const apiSettings = response.data.data.settings;
          const formattedSettings = {
            siteName: apiSettings.siteName,
            siteDescription: apiSettings.siteDescription,
            contactEmail: apiSettings.contactEmail,
            contactPhone: apiSettings.contactPhone,
            address: apiSettings.address,
            currency: apiSettings.currency,
            currencySymbol: apiSettings.currencySymbol,
            taxRate: apiSettings.taxRate.toString(),
            shippingFee: apiSettings.shippingFee.toString(),
            freeShippingThreshold: apiSettings.freeShippingThreshold.toString(),
            emailFrom: apiSettings.emailFrom,
            maintenanceMode: apiSettings.maintenanceMode,
          };
          
          setSettings(formattedSettings);
          
          // ⚡ Save maintenance mode to localStorage on load
          localStorage.setItem('adminSettings', JSON.stringify({ 
            maintenanceMode: apiSettings.maintenanceMode 
          }));
          console.log('💾 Initial settings loaded to localStorage');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSaved(false);
  };

  // Real-time save for maintenance mode
  const handleMaintenanceModeChange = async (e) => {
    const { checked } = e.target;
    
    // Update state immediately
    setSettings(prev => ({ ...prev, maintenanceMode: checked }));
    setMaintenanceSaving(true);
    setMaintenanceSaved(false);
    
    try {
      // Save to database via API
      await axiosClient.put('/settings', {
        ...settings,
        maintenanceMode: checked,
        taxRate: parseFloat(settings.taxRate),
        shippingFee: parseFloat(settings.shippingFee),
        freeShippingThreshold: parseFloat(settings.freeShippingThreshold),
      });
      
      // ⚡ CRITICAL: Save to localStorage for real-time detection
      const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      const updatedSettings = { ...currentSettings, maintenanceMode: checked };
      localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
      console.log('💾 Saved to localStorage:', updatedSettings);
      
      // Show success indicator
      setMaintenanceSaving(false);
      setMaintenanceSaved(true);
      
      // Clear success after 3 seconds (increased from 2)
      setTimeout(() => {
        setMaintenanceSaved(false);
      }, 3000);
      
      toast.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`, {
        position: 'top-right',
        autoClose: 2000,
      });
      console.log('✅ Maintenance mode updated:', checked ? 'ON' : 'OFF');
    } catch (error) {
      setMaintenanceSaving(false);
      console.error('Failed to update maintenance mode:', error);
      toast.error('Failed to update maintenance mode');
      // Revert state on error
      setSettings(prev => ({ ...prev, maintenanceMode: !checked }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Convert string values to numbers for API
      const settingsToSave = {
        ...settings,
        taxRate: parseFloat(settings.taxRate),
        shippingFee: parseFloat(settings.shippingFee),
        freeShippingThreshold: parseFloat(settings.freeShippingThreshold),
      };
      
      const response = await axiosClient.put('/settings', settingsToSave);
      
      if (response.data.success) {
        setSaved(true);
        toast.success('Settings saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Store },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payment', name: 'Payment', icon: DollarSign },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your store configuration</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn btn-primary flex items-center gap-2">
          {loading ? 'Saving...' : saved ? <><CheckCircle size={20} /> Saved!</> : <><Save size={20} /> Save</>}
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="card space-y-6">
        {activeTab === 'general' && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Store size={24} />General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Site Name</label>
                <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Contact Email</label>
                <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Contact Phone</label>
                <input type="tel" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Address</label>
                <input type="text" name="address" value={settings.address} onChange={handleChange} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows="3" className="input" />
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                maintenanceSaved 
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent'
              }`}>
                <div className="flex items-start gap-3 flex-1">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode" 
                    checked={settings.maintenanceMode} 
                    onChange={handleMaintenanceModeChange}
                    disabled={maintenanceSaving}
                    className="mt-1 w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">Maintenance Mode</span>
                      {maintenanceSaving && (
                        <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5 animate-pulse">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      )}
                      {maintenanceSaved && (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 font-semibold animate-in fade-in zoom-in duration-300">
                          <CheckCircle size={16} className="animate-bounce" /> Saved!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Put your store in maintenance mode</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'email' && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Mail size={24} />Email Settings</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Configure SMTP settings in server .env file for email functionality</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From Email</label>
              <input type="email" name="emailFrom" value={settings.emailFrom} onChange={handleChange} className="input" />
            </div>
          </>
        )}

        {activeTab === 'payment' && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><DollarSign size={24} />Payment Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Currency</label>
                <select name="currency" value={settings.currency} onChange={handleChange} className="input">
                  <option value="USD">US Dollar (USD)</option>
                  <option value="RWF">Rwandan Franc (RWF)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Currency Symbol</label>
                <input type="text" name="currencySymbol" value={settings.currencySymbol} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tax Rate (%)</label>
                <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} className="input" min="0" max="100" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'shipping' && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Truck size={24} />Shipping Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Shipping Fee (FRw)</label>
                <input type="number" name="shippingFee" value={settings.shippingFee} onChange={handleChange} className="input" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Free Shipping Above (FRw)</label>
                <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} className="input" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Shield size={24} />Security Settings</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">Security settings like session timeout and max login attempts are configured in the server</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsAdmin;
