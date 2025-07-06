
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ServiceForm from './components/ServiceForm';
import { SubmissionList } from './components/SubmissionList';
import { Service, ServiceStatus, User, Settings, AppData } from './types';
import { IconEngine, IconSettings, IconUser, IconLogout } from './components/ui/Icon';
import { SettingsModal } from './components/SettingsModal';
import { SummaryModal } from './components/SummaryModal';
import { PrintPreview } from './components/PrintPreview';
import LoginPage from './components/LoginPage';
import { UserManagementPage } from './components/admin/UserManagementPage';
import SyncStatusIndicator, { SyncStatus } from './components/ui/SyncStatusIndicator';
import * as authService from './services/authService';
import * as cloudDataService from './services/cloudDataService';
import Button from './components/ui/Button';

type AppView = 'FORM' | 'LIST' | 'USER_MANAGEMENT';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [appIsLoading, setAppIsLoading] = useState(true);
  
  const [view, setView] = useState<AppView>('LIST');
  const [submissions, setSubmissions] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings>({ googleSheetsUrl: '', googleDriveUploadUrl: '', customLogoUrl: ''});

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [printingService, setPrintingService] = useState<Service | null>(null);
  const [summarizingService, setSummarizingService] = useState<Service | null>(null);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('OFFLINE');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [logoHasError, setLogoHasError] = useState(false);
  
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data and check for a logged-in user session
  useEffect(() => {
    const loadData = async () => {
        setAppIsLoading(true);
        const storedUserJson = localStorage.getItem('service_app_current_user');
        if (storedUserJson) {
          setCurrentUser(JSON.parse(storedUserJson));
        }

        try {
          const data = await cloudDataService.loadAppData();
          setSubmissions(data.submissions);
          setUsers(data.users);
          setSettings(data.settings);
          if (data.settings.googleSheetsUrl) {
            setSyncStatus('SYNCED');
          }
        } catch (error) {
            console.error("Failed to load initial data", error);
            setSyncStatus('ERROR');
            setSyncError("Could not load data from cloud.");
        } finally {
            setAppIsLoading(false);
            isInitialLoad.current = false;
        }
    };

    loadData();
  }, []);

  const getFullAppData = useCallback((): AppData => {
    return { submissions, users, settings };
  }, [submissions, users, settings]);

  // Debounced save to cloud
  useEffect(() => {
    if (isInitialLoad.current || !settings.googleSheetsUrl) {
      return;
    }
    
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    
    setSyncStatus('UNSAVED');
    setSyncError(null);

    saveTimeoutRef.current = setTimeout(async () => {
        setSyncStatus('SYNCING');
        try {
            await cloudDataService.saveAppData(getFullAppData());
            setSyncStatus('SYNCED');
        } catch (error) {
            setSyncStatus('ERROR');
            setSyncError(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    }, 2000);

    return () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    };
  }, [submissions, users, settings, getFullAppData]);

  const handleLoginAttempt = useCallback((username: string, password?: string) => {
    setLoginError('');
    const validatedUser = authService.validateLogin(username, password, users);
    if (validatedUser) {
        setCurrentUser(validatedUser);
        localStorage.setItem('service_app_current_user', JSON.stringify(validatedUser));
    } else {
        setLoginError('Invalid username or password.');
    }
  }, [users]);
  
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('service_app_current_user');
    setView('LIST');
  };

  const handleNewServiceClick = () => {
    setEditingService(null);
    setView('FORM');
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setView('FORM');
  };

  const handleSubmitOrDraft = (service: Service, status: ServiceStatus) => {
    const existingIndex = submissions.findIndex(s => s.submissionId === service.submissionId);
    const serviceToSave = { ...service, status, timestamp: new Date().toISOString() };
    
    let updatedSubmissions;
    if (existingIndex > -1) {
      updatedSubmissions = [...submissions];
      updatedSubmissions[existingIndex] = serviceToSave;
    } else {
      updatedSubmissions = [...submissions, serviceToSave];
    }
    setSubmissions(updatedSubmissions);
    setView('LIST');
    setEditingService(null);
  };
  
  const handleSaveSettings = (newSettings: Settings) => {
    localStorage.setItem('googleSheetsUrl', newSettings.googleSheetsUrl);
    localStorage.setItem('googleDriveUploadUrl', newSettings.googleDriveUploadUrl);
    localStorage.setItem('customLogoUrl', newSettings.customLogoUrl);
    setSettings(newSettings);
    if (newSettings.googleSheetsUrl && syncStatus === 'OFFLINE') {
      setSyncStatus('SYNCED'); // Assume sync is now possible
    } else if (!newSettings.googleSheetsUrl) {
      setSyncStatus('OFFLINE');
    }
    setLogoHasError(false);
  };
  
  const handleUpdateUsers = (allUsers: User[]) => {
      setUsers(allUsers);
  };

  if (appIsLoading) {
    return <div className="min-h-screen w-full flex items-center justify-center text-slate-500">Loading Application...</div>;
  }
  
  if (!currentUser) {
    return <LoginPage onLoginAttempt={handleLoginAttempt} error={loginError} />;
  }

  if (printingService) {
    return <PrintPreview service={printingService} onClose={() => setPrintingService(null)} />;
  }

  const renderView = () => {
    switch(view) {
      case 'FORM':
        return <ServiceForm 
                 initialService={editingService} 
                 onSubmit={(s) => handleSubmitOrDraft(s, ServiceStatus.Submitted)}
                 onSaveDraft={(s) => handleSubmitOrDraft(s, ServiceStatus.Draft)}
                 onExit={() => setView('LIST')}
                 googleDriveUploadUrl={settings.googleDriveUploadUrl}
               />;
      case 'LIST':
        return <SubmissionList 
                 submissions={submissions}
                 users={users.map(({password, ...rest}) => rest)}
                 onEdit={handleEditService}
                 onPrint={setPrintingService}
                 onSummarize={setSummarizingService}
               />;
      case 'USER_MANAGEMENT':
        return <UserManagementPage
                 users={users.map(({password, ...rest}) => rest)}
                 onUpdateUsers={handleUpdateUsers}
                 fullUserList={users}
               />;
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {isSettingsOpen && (
        <SettingsModal 
          initialSettings={settings}
          onClose={() => setIsSettingsOpen(false)} 
          onSave={handleSaveSettings}
        />
      )}

      {summarizingService && (
          <SummaryModal 
            service={summarizingService}
            onClose={() => setSummarizingService(null)}
          />
      )}
      
      <header className="bg-brand-blue shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {settings.customLogoUrl && !logoHasError ? (
                  <img 
                    src={settings.customLogoUrl} 
                    alt="Custom Logo" 
                    className="h-10 w-10 rounded-full object-cover"
                    onError={() => setLogoHasError(true)}
                  />
              ) : (
                  <IconEngine className="h-10 w-10 text-brand-accent"/>
              )}
              <h1 className="text-xl font-bold tracking-tight uppercase">
                <span className="text-white">A Big </span>
                <span className="text-brand-accent">Engine</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <SyncStatusIndicator status={syncStatus} errorMessage={syncError} />
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Settings"
                >
                    <IconSettings className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Logout"
              >
                  <IconLogout className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <div className="space-x-2">
              <Button onClick={handleNewServiceClick} disabled={view === 'FORM'}>New Service</Button>
              <Button variant="secondary" onClick={() => setView('LIST')} disabled={view === 'LIST'}>View History</Button>
              {currentUser.role === 'admin' && (
                <Button variant="secondary" onClick={() => setView('USER_MANAGEMENT')} disabled={view === 'USER_MANAGEMENT'}>
                  <IconUser className="w-5 h-5 mr-2" />
                  Manage Users
                </Button>
              )}
            </div>
        </div>
        
        {renderView()}
      </main>
    </div>
  );
};

export default App;