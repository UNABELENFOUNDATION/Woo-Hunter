/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Import `Type` to define a response schema for JSON output.
import { GoogleGenAI, Type } from "@google/genai";
import StaticFreeMap from './StaticFreeMap';
import ContactForm from './frontend/ContactForm';
import Login from './frontend/Login';

// Debug: Check API key availability
console.log('🔑 API Key check:', {
    available: !!process.env.GEMINI_API_KEY,
    key: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT SET'
});

// Icon components defined for use in the application.
const IconWrapper = ({ children }: { children?: React.ReactNode }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const DashboardIcon = () => <IconWrapper><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></IconWrapper>;
const ChartIcon = () => <IconWrapper><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></IconWrapper>;
const ToolsIcon = () => <IconWrapper><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></IconWrapper>;
const SettingsIcon = () => <IconWrapper><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper>;
const UserIcon = () => <IconWrapper><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></IconWrapper>;

// Load Maricopa County zip codes within 20 miles of Sky Harbor
const MARICOPA_ZIPS = [
  "85001", "85002", "85003", "85004", "85005", "85006", "85007", "85008", "85009", "85010", "85011", "85012", "85013", "85014", "85015", "85016", "85017", "85018", "85019", "85020", "85021", "85022", "85023", "85024", "85025", "85026", "85027", "85028", "85029", "85030", "85031", "85032", "85033", "85034", "85035", "85036", "85037", "85038", "85039", "85040", "85041", "85042", "85043", "85044", "85045", "85046", "85048", "85050", "85051", "85053", "85054", "85060", "85061", "85062", "85063", "85064", "85065", "85066", "85067", "85068", "85069", "85070", "85071", "85072", "85073", "85074", "85075", "85076", "85078", "85079", "85080", "85082", "85097", "85098", "85201", "85202", "85203", "85204", "85205", "85206", "85210", "85211", "85213", "85214", "85215", "85216", "85224", "85225", "85226", "85233", "85234", "85244", "85246", "85248", "85249", "85250", "85251", "85252", "85253", "85254", "85255", "85256", "85257", "85258", "85259", "85260", "85261", "85267", "85271", "85274", "85275", "85277", "85280", "85281", "85282", "85283", "85284", "85285", "85286", "85287", "85288", "85295", "85296", "85299", "85301", "85302", "85303", "85304", "85305", "85306", "85307", "85308", "85309", "85311", "85312", "85318", "85323", "85329", "85339", "85345", "85351", "85353", "85363", "85372", "85380", "85381", "85382", "85385", "85392"
];
const UploadIcon = () => <IconWrapper><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></IconWrapper>;
const EmailIcon = () => <IconWrapper><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></IconWrapper>;
const ImageIcon = () => <IconWrapper><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></IconWrapper>;
const MenuIcon = () => <IconWrapper><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></IconWrapper>;
const SunIcon = () => <IconWrapper><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></IconWrapper>;
const MoonIcon = () => <IconWrapper><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></IconWrapper>;

// Image processing utilities
const inchesToPixels = (inches: number, dpi: number = 300) => Math.round(inches * dpi);
const pixelsToInches = (pixels: number, dpi: number = 300) => pixels / dpi;

const processImage = (file: File, width: number, height: number, format: string = 'image/jpeg', quality: number = 0.9, maintainAspectRatio: boolean = true): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // If maintaining aspect ratio, calculate the best fit
                let finalWidth = width;
                let finalHeight = height;
                
                if (maintainAspectRatio) {
                    const aspectRatio = img.width / img.height;
                    const targetAspectRatio = width / height;
                    
                    if (aspectRatio > targetAspectRatio) {
                        // Image is wider than target, fit by height
                        finalWidth = height * aspectRatio;
                    } else {
                        // Image is taller than target, fit by width
                        finalHeight = width / aspectRatio;
                    }
                }
                
                canvas.width = finalWidth;
                canvas.height = finalHeight;
                const ctx = canvas.getContext('2d');

                // Use high-quality image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image onto the canvas at the new size
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

                // Convert to blob and then to data URL
                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, format, quality);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

type FlyerKey = 'doorHanger' | 'windows' | 'bath' | 'roof' | 'siding';
type View = 'hunter' | 'analytics' | 'flyers' | 'tools' | 'settings' | 'contact';
type OpportunityStatus = 'New' | 'Contacted' | 'Interested' | 'Sent';
type OpportunityCategory = 'Windows' | 'Bath' | 'Roof' | 'Siding';

type Opportunity = {
    id: number;
    phone: string | null;
    email?: string;
    type: string;
    category: OpportunityCategory;
    source: string;
    details: string;
    location: string;
    address?: string;
    createdAt: string;
    stealth: number;
    status: OpportunityStatus;
};
type StatusFilter = 'All' | OpportunityStatus;
type Theme = 'dark' | 'light';


const FLYER_CONFIG: { key: FlyerKey, label: string, defaultDimensions: { width: number, height: number, unit: 'px' | 'in' } }[] = [
    { key: 'doorHanger', label: 'Door Hanger', defaultDimensions: { width: 4.25, height: 11, unit: 'in' } },
    { key: 'windows', label: 'Window Flyer', defaultDimensions: { width: 8.5, height: 11, unit: 'in' } },
    { key: 'bath', label: 'Bath Flyer', defaultDimensions: { width: 8.5, height: 11, unit: 'in' } },
    { key: 'roof', label: 'Roof Flyer', defaultDimensions: { width: 8.5, height: 11, unit: 'in' } },
    { key: 'siding', label: 'Siding Flyer', defaultDimensions: { width: 8.5, height: 11, unit: 'in' } }
];

// Platform-specific export presets
const EXPORT_PRESETS = {
    square: { width: 1080, height: 1080, label: 'Square (Social Media)' },
    vertical: { width: 1080, height: 1350, label: 'Vertical (Feed Posts)' },
    story: { width: 1080, height: 1920, label: 'Story/Reel (Full Screen)' },
    landscape: { width: 1200, height: 630, label: 'Landscape (Website/Blog)' },
    emailBanner: { width: 600, height: 200, label: 'Email Banner' },
    emailFull: { width: 600, height: 800, label: 'Email Full Image' },
    messaging: { width: 1080, height: 1080, label: 'Messaging (WhatsApp/etc)' }
};

const Overlay = ({ onClick }: { onClick: () => void }) => <div className="overlay" onClick={onClick}></div>;

const App = ({ onLogout }: { onLogout: () => void }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [flyers, setFlyers] = useState<Record<FlyerKey, string[]>>({
        doorHanger: [],
        windows: [],
        bath: [],
        roof: [],
        siding: [],
    });
    const [messageTemplates, setMessageTemplates] = useState<string[]>([
        "Hi! We offer free estimates for home projects, including a thermal camera scan. Interested?",
        "Following up on your interest. Our thermal scan can spot hidden issues others miss. Can I send you more info?"
    ]);
    const [theme, setTheme] = useState<Theme>('dark');
    const [tokenUsage, setTokenUsage] = useState({ briefing: 0, message: 0, email: 0 });
    const [featureToggles, setFeatureToggles] = useState({ briefing: true, message: true, email: true });
    const [selectedFlyerType, setSelectedFlyerType] = useState<FlyerKey | null>(null);
    const [currentFlyerOpportunity, setCurrentFlyerOpportunity] = useState<Opportunity | null>(null);

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(t => t === 'dark' ? 'light' : 'dark');
    };

    const handleAddTemplate = (template: string) => {
        const trimmedTemplate = template.trim();
        if (trimmedTemplate && !messageTemplates.includes(trimmedTemplate)) {
            setMessageTemplates([...messageTemplates, trimmedTemplate]);
            alert('Template saved!');
        } else if (!trimmedTemplate) {
            alert('Template cannot be empty.');
        } else {
            alert('This template already exists.');
        }
    };

    const [currentView, setCurrentView] = useState<View>('hunter');

    // Navigate to flyers view when a flyer type is selected from lead
    useEffect(() => {
        if (selectedFlyerType) {
            setCurrentView('flyers');
            // Reset after navigation
            setSelectedFlyerType(null);
        }
    }, [selectedFlyerType]);

    const renderCurrentView = () => {
        if (currentView === 'hunter') {
            return <HunterView flyers={flyers} messageTemplates={messageTemplates} onAddTemplate={handleAddTemplate} tokenUsage={tokenUsage} setTokenUsage={setTokenUsage} featureToggles={featureToggles} onSelectFlyerType={setSelectedFlyerType} onSelectFlyerOpportunity={setCurrentFlyerOpportunity} />;
        }
        if (currentView === 'analytics') {
            return <AnalyticsView />;
        }
        if (currentView === 'tools') {
            return <ToolsView />;
        }
        if (currentView === 'flyers') {
            return <FlyersView 
                flyers={flyers} 
                setFlyers={setFlyers} 
                selectedFlyerType={selectedFlyerType} 
                currentOpportunity={currentFlyerOpportunity}
                onClearCurrentOpportunity={() => setCurrentFlyerOpportunity(null)}
            />;
        }
        if (currentView === 'settings') {
            return <SettingsView featureToggles={featureToggles} setFeatureToggles={setFeatureToggles} tokenUsage={tokenUsage} setTokenUsage={setTokenUsage} />;
        }
        if (currentView === 'contact') {
            return (
                <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                    <ContactForm />
                </div>
            );
        }
    };
    
    return (
        <div className="app-container">
            <Sidebar 
                currentView={currentView} 
                setView={setCurrentView} 
                isOpen={isSidebarOpen}
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={onLogout}
            />
            <main className="main-content">
                <Header 
                    view={currentView}
                    onMenuToggle={() => setSidebarOpen(true)}
                    featureToggles={featureToggles}
                />
                {renderCurrentView()}
            </main>
            {isSidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}

        </div>
    );
};

const ThemeToggle = ({ theme, toggleTheme }: { theme: Theme, toggleTheme: () => void }) => (
    <div className="theme-toggle-container">
        <SunIcon />
        <label className="theme-toggle">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} aria-label="Toggle theme"/>
            <span className="slider"></span>
        </label>
        <MoonIcon />
    </div>
);

const Sidebar = ({ currentView, setView, isOpen, theme, toggleTheme, onLogout }: { 
    currentView: View, 
    setView: (view: View) => void, 
    isOpen: boolean,
    theme: Theme,
    toggleTheme: () => void,
    onLogout: () => void
}) => (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h2 style={{ color: '#007bff', fontSize: '1.5rem', fontWeight: 'bold' }}>Woo Hunter</h2>
        </div>
        <nav className="sidebar-nav">
            <a href="#" className={`nav-item ${currentView === 'hunter' ? 'active' : ''}`} onClick={() => setView('hunter')}><DashboardIcon /><span>Hunter View</span></a>
            <a href="#" className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}><ChartIcon /><span>Analytics</span></a>
            
            <a href="#" className={`nav-item ${currentView === 'flyers' ? 'active' : ''}`} onClick={() => setView('flyers')}><ImageIcon /><span>Flyers</span></a>

            <div className="sidebar-section-header">
                <ToolsIcon />
                <span>Tools & Settings</span>
            </div>
            <a href="#" className={`nav-item ${currentView === 'tools' ? 'active' : ''}`} onClick={() => setView('tools')}><ToolsIcon /><span>Tool Status</span></a>
            <a href="#" className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><SettingsIcon /><span>Settings</span></a>
        </nav>
        <div className="sidebar-footer">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="user-profile">
                <span>John Doe</span>
                <button 
                    className="logout-btn" 
                    onClick={onLogout}
                    style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    </aside>
);

const getHeaderTitle = (view: View) => {
    if (view === 'hunter') return 'Woo Hunter Dashboard';
    if (view === 'analytics') return 'Performance Analytics';
    if (view === 'tools') return 'AI Tool Status';
    if (view === 'settings') return 'Settings';
    if (view === 'flyers') return 'Manage Flyers';
    return 'Dashboard';
};


const Header = ({ view, onMenuToggle, featureToggles }: { view: View, onMenuToggle: () => void, featureToggles: { briefing: boolean; message: boolean; email: boolean } }) => (
    <header className="header">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Open sidebar">
            <MenuIcon />
        </button>
        <h2>{getHeaderTitle(view)}</h2>
        <div className="header-actions">
            {/* Briefing now handled by sidebar */}
        </div>
    </header>
);

const initialOpportunityData: Opportunity[] = [
    { id: 1, phone: '555-123-4567', email: 'permits@example.com', category: 'Bath', type: 'Building Permit', source: 'Maricopa County Bot', details: 'Bathroom remodel permit at 123 E Main St, Mesa. Home built 1998.', location: 'Mesa, AZ', address: '123 E Main St, Mesa, AZ 85201', createdAt: '2025-09-25T10:30:00', stealth: 95, status: 'New' },
    { id: 2, phone: '555-234-5678', email: 'newhome@example.com', category: 'Windows', type: 'New Homeowner', source: 'Zillow Scraper', details: '456 W Elm St, Phoenix. Sold 2 days ago. Built 1985.', location: 'Phoenix, AZ', address: '456 W Elm St, Phoenix, AZ 85001', createdAt: '2025-09-26T14:15:00', stealth: 90, status: 'New' },
    { id: 3, phone: '555-345-6789', category: 'Windows', type: 'Social Media', source: 'FB Scanner', details: 'User in "Phoenix Moms" group posted: "Our windows are so drafty!"', location: 'Phoenix, AZ', address: 'Unknown - Social Media Lead', createdAt: '2025-09-24T09:45:00', stealth: 75, status: 'Contacted' },
    { id: 4, phone: '555-456-7890', email: 'quote_request@example.com', category: 'Windows', type: 'Competitor Mention', source: 'Competitor Watch', details: 'User requested a quote from Pella on a public forum.', location: 'Scottsdale, AZ', address: 'Unknown - Online Forum Lead', createdAt: '2025-09-23T16:20:00', stealth: 40, status: 'Interested' },
    { id: 5, phone: null, category: 'Roof', type: 'Building Permit', source: 'Pima County Bot', details: 'Roofing permit at 789 S Oak Ave, Tucson. Home built 2001.', location: 'Tucson, AZ', address: '789 S Oak Ave, Tucson, AZ 85701', createdAt: '2025-09-27T11:00:00', stealth: 95, status: 'New' },
    { id: 6, phone: '555-678-9012', email: 'stormyweather@example.com', category: 'Siding', type: 'Storm Damage', source: 'Weather API', details: 'Hail reported in 85254. Home built 1995.', location: 'Scottsdale, AZ', address: '85254 ZIP Code Area, Scottsdale, AZ', createdAt: '2025-09-26T08:30:00', stealth: 88, status: 'New'},
    { id: 7, phone: '555-789-0123', category: 'Bath', type: 'Aging in Place', source: 'Demographic Analysis', details: 'Homeowner >65yrs, long-term resident. Good for walk-in tub.', location: 'Tempe, AZ', address: 'Unknown - Demographic Lead', createdAt: '2025-09-25T13:45:00', stealth: 70, status: 'New'},
];

const BriefingContent = ({ tokenUsage, setTokenUsage, searchCriteria, setSearchCriteria, filteredCount, opportunities, activeFilter }: {
    tokenUsage: { briefing: number; message: number; email: number };
    setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>;
    searchCriteria: {
        dateRange: { start: string; end: string };
        timeRange: { start: string; end: string };
        areas: string[];
        frequency: 'all' | 'daily' | 'weekly' | 'monthly';
        minValue: string;
        maxValue: string;
        keywords: string;
        categories: OpportunityCategory[];
    };
    setSearchCriteria: React.Dispatch<React.SetStateAction<{
        dateRange: { start: string; end: string };
        timeRange: { start: string; end: string };
        areas: string[];
        frequency: 'all' | 'daily' | 'weekly' | 'monthly';
        minValue: string;
        maxValue: string;
        keywords: string;
        categories: OpportunityCategory[];
    }>>;
    filteredCount: number;
    opportunities: Opportunity[];
    activeFilter: StatusFilter;
}) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
    const [competitors, setCompetitors] = useState<any[]>([]);

    const generateBriefing = async () => {
        setIsLoading(true);
        try {
            // First, fetch real market data from backend
            const marketResponse = await fetch('/api/briefing-data');
            const marketData = await marketResponse.json();

            // Fetch competitors for the map
            const competitorsResponse = await fetch('/api/competitors?zip_code=85254&limit=5');
            const competitorsData = await competitorsResponse.json();
            setCompetitors(competitorsData);

            if (!process.env.VITE_GEMINI_API_KEY) {
                throw new Error('Gemini API key is not configured. Please check your .env.local file.');
            }

            const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY as string });
            
            const prompt = `You are a marketing strategy AI for a single-owner window company in Arizona. The company's unique selling proposition is a FLIR thermal camera scan offered with every free estimate to find hidden issues. Based on this real market data, write a concise, actionable 2-3 sentence daily briefing to help the owner beat large competitors:
            - Data: ${marketData.new_leads} new homeowner leads in Scottsdale (ZIP 85254).
            - Data: ${marketData.permit_increase} increase in local bathroom remodel permits in 85254.
            - Data: Local competitors include: ${marketData.competitors.join(', ')}.
            - Data: Current weather conditions: ${marketData.weather_impact}.
            - Data: Demographics - Population: ${marketData.demographics.population}, Median Income: $${marketData.demographics.median_income}.
            - Action: Formulate a strategy that leverages the FLIR camera advantage by explicitly showcasing how your FLIR thermal scan scientifically identifies and proves hidden energy loss in windows, outperforming competitors' claims and offering homeowners uniquely precise and verifiable solutions.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            
            setBriefing(response.text);
            setLastGenerated(new Date());
            setTokenUsage(prev => ({ ...prev, briefing: response.usageMetadata?.totalTokenCount || 0 }));
        } catch (error) {
            console.error("Error generating briefing:", error);
            setBriefing("Could not generate briefing at this time. Please check your API key and network connection.");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const handleGenerateBriefing = () => {
            generateBriefing();
        };
        
        window.addEventListener('generateBriefing', handleGenerateBriefing);
        return () => window.removeEventListener('generateBriefing', handleGenerateBriefing);
    }, []);

    // Auto-generate during peak hours (9 AM - 5 PM) at least 2 times
    React.useEffect(() => {
        const checkAndAutoGenerate = () => {
            const now = new Date();
            const hour = now.getHours();
            const isPeakHours = hour >= 9 && hour <= 17; // 9 AM to 5 PM
            
            if (isPeakHours && !briefing) {
                // Generate briefing during peak hours if none exists
                generateBriefing();
            }
        };

        // Check immediately
        checkAndAutoGenerate();
        
        // Set up interval to check every hour during peak hours
        const interval = setInterval(checkAndAutoGenerate, 60 * 60 * 1000); // Check every hour
        
        return () => clearInterval(interval);
    }, [briefing]);

    return (
        <div className="briefing-content">
            {/* Search Criteria Hub */}
            <div className="search-criteria-hub">
                <div className="hub-header">
                    <h4>🎯 Content Calendar Hub</h4>
                    <span className="hub-subtitle">Control your opportunity feed</span>
                </div>
                
                <div className="criteria-grid">
                    {/* Date & Time Filters */}
                    <div className="criteria-section">
                        <h5>📅 Date & Time</h5>
                        <div className="criteria-row">
                            <div className="criteria-field">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    value={searchCriteria.dateRange.start}
                                    onChange={(e) => setSearchCriteria(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="criteria-field">
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    value={searchCriteria.dateRange.end}
                                    onChange={(e) => setSearchCriteria(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="criteria-row">
                            <div className="criteria-field">
                                <label>Start Time</label>
                                <input 
                                    type="time" 
                                    value={searchCriteria.timeRange.start}
                                    onChange={(e) => setSearchCriteria(prev => ({
                                        ...prev,
                                        timeRange: { ...prev.timeRange, start: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="criteria-field">
                                <label>End Time</label>
                                <input 
                                    type="time" 
                                    value={searchCriteria.timeRange.end}
                                    onChange={(e) => setSearchCriteria(prev => ({
                                        ...prev,
                                        timeRange: { ...prev.timeRange, end: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Areas & Keywords */}
                    <div className="criteria-section">
                        <h5>📍 Areas & Search</h5>
                        <div className="criteria-field">
                            <label>Areas (ZIP Codes)</label>
                            
                            {/* Manual ZIP Code Input */}
                            <div className="zip-input-section">
                                <input 
                                    type="text" 
                                    placeholder="Enter specific ZIP codes (comma-separated)"
                                    className="zip-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            const zips = input.value.split(',').map(z => z.trim()).filter(z => z.length === 5 && /^\d{5}$/.test(z));
                                            if (zips.length > 0) {
                                                setSearchCriteria(prev => ({
                                                    ...prev,
                                                    areas: [...new Set([...prev.areas, ...zips])]
                                                }));
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                                <small className="input-help">Press Enter to add ZIP codes</small>
                            </div>
                            
                            {/* Circle Selection */}
                            <div className="zip-input-section">
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Center ZIP"
                                        className="zip-input"
                                        style={{ flex: '1', maxWidth: '120px' }}
                                        id="circle-center-zip"
                                    />
                                    <select 
                                        className="zip-input"
                                        style={{ flex: '1', maxWidth: '100px' }}
                                        id="circle-radius"
                                        defaultValue="5"
                                    >
                                        <option value="5">5 miles</option>
                                        <option value="10">10 miles</option>
                                        <option value="15">15 miles</option>
                                        <option value="25">25 miles</option>
                                    </select>
                                    <button 
                                        type="button"
                                        className="btn btn-small"
                                        onClick={async () => {
                                            const centerZip = (document.getElementById('circle-center-zip') as HTMLInputElement)?.value;
                                            const radius = (document.getElementById('circle-radius') as HTMLSelectElement)?.value;
                                            
                                            if (centerZip && centerZip.length === 5 && /^\d{5}$/.test(centerZip)) {
                                                try {
                                                    // Call backend endpoint to get zip codes within radius
                                                    const response = await fetch(`http://localhost:8002/zip-codes/circle?center=${centerZip}&radius=${radius}`);
                                                    if (response.ok) {
                                                        const nearbyZips = await response.json();
                                                        setSearchCriteria(prev => ({
                                                            ...prev,
                                                            areas: [...new Set([...prev.areas, ...nearbyZips])]
                                                        }));
                                                    }
                                                } catch (error) {
                                                    console.error('Error fetching nearby zip codes:', error);
                                                    // Fallback: add the center zip at least
                                                    setSearchCriteria(prev => ({
                                                        ...prev,
                                                        areas: [...new Set([...prev.areas, centerZip])]
                                                    }));
                                                }
                                            }
                                        }}
                                    >
                                        Add Circle
                                    </button>
                                </div>
                                <small className="input-help">Select ZIP codes within a radius of a center location</small>
                            </div>
                            
                            {/* Quick Selection Options */}
                            <div className="zip-quick-select">
                                <button 
                                    type="button"
                                    className="btn btn-small"
                                    onClick={() => setSearchCriteria(prev => ({ ...prev, areas: MARICOPA_ZIPS }))}
                                >
                                    Select All (149)
                                </button>
                                <button 
                                    type="button"
                                    className="btn btn-small"
                                    onClick={() => setSearchCriteria(prev => ({ ...prev, areas: MARICOPA_ZIPS.slice(0, 30) }))}
                                >
                                    Select First 30
                                </button>
                                <button 
                                    type="button"
                                    className="btn btn-small"
                                    onClick={() => setSearchCriteria(prev => ({ ...prev, areas: [] }))}
                                >
                                    Clear All
                                </button>
                            </div>
                            
                            {/* Grouped Checkboxes */}
                            <div className="zip-checkboxes">
                                {Array.from({ length: Math.ceil(MARICOPA_ZIPS.length / 3) }, (_, groupIndex) => {
                                    const startIdx = groupIndex * 3;
                                    const groupZips = MARICOPA_ZIPS.slice(startIdx, startIdx + 3);
                                    return (
                                        <div key={groupIndex} className="zip-group">
                                            {groupZips.map(zip => (
                                                <label key={zip} className="checkbox-label zip-label">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={searchCriteria.areas.includes(zip)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSearchCriteria(prev => ({
                                                                    ...prev,
                                                                    areas: [...prev.areas, zip]
                                                                }));
                                                            } else {
                                                                setSearchCriteria(prev => ({
                                                                    ...prev,
                                                                    areas: prev.areas.filter(a => a !== zip)
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    {zip}
                                                </label>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="criteria-field">
                            <label>Keywords</label>
                            <input 
                                type="text" 
                                placeholder="window, bath, roof..."
                                value={searchCriteria.keywords}
                                onChange={(e) => setSearchCriteria(prev => ({
                                    ...prev,
                                    keywords: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                    
                    {/* Categories & Frequency */}
                    <div className="criteria-section">
                        <h5>🏷️ Categories & Frequency</h5>
                        <div className="criteria-field">
                            <label>Categories</label>
                            <div className="category-checkboxes">
                                {(['Windows', 'Bath', 'Roof', 'Siding'] as OpportunityCategory[]).map(category => (
                                    <label key={category} className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={searchCriteria.categories.includes(category)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSearchCriteria(prev => ({
                                                        ...prev,
                                                        categories: [...prev.categories, category]
                                                    }));
                                                } else {
                                                    setSearchCriteria(prev => ({
                                                        ...prev,
                                                        categories: prev.categories.filter(c => c !== category)
                                                    }));
                                                }
                                            }}
                                        />
                                        {category}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="criteria-field">
                            <label>Frequency</label>
                            <select 
                                value={searchCriteria.frequency}
                                onChange={(e) => setSearchCriteria(prev => ({
                                    ...prev,
                                    frequency: e.target.value as 'all' | 'daily' | 'weekly' | 'monthly'
                                }))}
                            >
                                <option value="all">All Time</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Results Summary */}
                    <div className="criteria-section">
                        <h5>📊 Results</h5>
                        <div className="results-summary">
                            <div className="result-stat">
                                <span className="stat-number">{filteredCount}</span>
                                <span className="stat-label">Opportunities</span>
                            </div>
                            <div className="result-breakdown">
                                {(['Windows', 'Bath', 'Roof', 'Siding'] as OpportunityCategory[]).map(category => {
                                    const count = opportunities.filter(opp => opp.category === category && 
                                        (activeFilter === 'All' ? opp.status !== 'Sent' : opp.status === activeFilter)
                                    ).length;
                                    return count > 0 ? (
                                        <div key={category} className="category-count">
                                            {category}: {count}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <button 
                            className="btn btn-secondary clear-filters"
                            onClick={() => setSearchCriteria({
                                dateRange: { start: '', end: '' },
                                timeRange: { start: '', end: '' },
                                areas: [],
                                frequency: 'all',
                                minValue: '',
                                maxValue: '',
                                keywords: '',
                                categories: []
                            })}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Strategic Briefing Section */}
            <div className="briefing-section">
                <div className="briefing-divider">
                    <h4>📋 Daily Strategic Briefing</h4>
                </div>
                
                {isLoading ? (
                    <div className="briefing-loading">
                        <div className="spinner"></div>
                        <p>Generating strategic briefing...</p>
                    </div>
                ) : briefing ? (
                    <div className="briefing-text">
                        <p>{briefing}</p>
                        {lastGenerated && (
                            <div className="briefing-timestamp">
                                Generated: {lastGenerated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="briefing-placeholder">
                        <p>📋 Click "Refresh" to generate your daily strategic briefing</p>
                        <p className="briefing-hint">Get AI-powered insights to beat larger competitors</p>
                    </div>
                )}

                {/* Free Map Display */}
                {briefing && (
                    <div className="briefing-map-section">
                        <div className="map-header">
                            <h5>🗺️ Service Area Map (Free)</h5>
                            <span className="map-note">Your location + {competitors.length} competitors • No API costs</span>
                        </div>
                        <StaticFreeMap
                            businessLat={33.494}
                            businessLng={-111.926}
                            businessName="Your Window Company"
                            competitors={competitors}
                            width={400}
                            height={250}
                        />
                    </div>
                )}
                
                <div className="briefing-footer">
                    <div className="token-usage-mini">
                        <span>Tokens used: {tokenUsage.briefing}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HunterView = ({ flyers, messageTemplates, onAddTemplate, tokenUsage, setTokenUsage, featureToggles, onSelectFlyerType, onSelectFlyerOpportunity }: { 
    flyers: Record<FlyerKey, string[]>;
    messageTemplates: string[];
    onAddTemplate: (template: string) => void;
    tokenUsage: { briefing: number; message: number; email: number };
    setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>;
    featureToggles: { briefing: boolean; message: boolean; email: boolean };
    onSelectFlyerType: (flyerType: FlyerKey) => void;
    onSelectFlyerOpportunity: (opportunity: Opportunity) => void;
}) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunityData);
    const [messageOpportunity, setMessageOpportunity] = useState<Opportunity | null>(null);
    const [emailOpportunity, setEmailOpportunity] = useState<Opportunity | null>(null);
    const [flyerOpportunity, setFlyerOpportunity] = useState<Opportunity | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
    
    // Helper function to get current date and time in correct format
    const getCurrentDateTime = () => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 5); // HH:MM
        return { date: dateStr, time: timeStr };
    };
    
    const [searchCriteria, setSearchCriteria] = useState(() => {
        const current = getCurrentDateTime();
        return {
            dateRange: { start: current.date, end: current.date },
            timeRange: { start: '00:00', end: '23:59' }, // Show all times today
            areas: [] as string[],
            frequency: 'all' as 'all' | 'daily' | 'weekly' | 'monthly',
            minValue: '',
            maxValue: '',
            keywords: 'window replacement, bathroom remodel, roof repair, siding installation',
            categories: [] as OpportunityCategory[]
        };
    });

    // Update time every minute to keep it current (but keep full day range)
    useEffect(() => {
        const interval = setInterval(() => {
            // Time range stays as full day (00:00 to 23:59) for filtering
            // Only update if user hasn't manually changed it
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = (id: number, status: OpportunityStatus) => {
        setOpportunities(opportunities.map(opp => opp.id === id ? { ...opp, status } : opp));
    };

    const handleEnrichmentSuccess = (id: number, phone: string) => {
        setOpportunities(opportunities.map(opp => opp.id === id ? { ...opp, phone } : opp));
    };
    
    const filteredOpportunities = opportunities.filter(opp => {
        // Status filter
        if (activeFilter === 'All' && opp.status === 'Sent') return false;
        if (activeFilter !== 'All' && opp.status !== activeFilter) return false;
        
        // Date range filter
        if (searchCriteria.dateRange.start) {
            const oppDate = new Date(opp.createdAt);
            const startDate = new Date(searchCriteria.dateRange.start);
            if (oppDate < startDate) return false;
        }
        if (searchCriteria.dateRange.end) {
            const oppDate = new Date(opp.createdAt);
            const endDate = new Date(searchCriteria.dateRange.end);
            if (oppDate > endDate) return false;
        }
        
        // Time range filter
        if (searchCriteria.timeRange.start || searchCriteria.timeRange.end) {
            const oppTime = new Date(opp.createdAt).toTimeString().slice(0, 5); // HH:MM format
            if (searchCriteria.timeRange.start && oppTime < searchCriteria.timeRange.start) return false;
            if (searchCriteria.timeRange.end && oppTime > searchCriteria.timeRange.end) return false;
        }
        
        // Areas filter
        if (searchCriteria.areas.length > 0) {
            const oppArea = opp.location.toLowerCase();
            const hasMatchingArea = searchCriteria.areas.some(area => 
                oppArea.includes(area.toLowerCase())
            );
            if (!hasMatchingArea) return false;
        }
        
        // Keywords filter
        if (searchCriteria.keywords) {
            const keywords = searchCriteria.keywords.toLowerCase().split(' ');
            const oppText = `${opp.details} ${opp.location} ${opp.address || ''}`.toLowerCase();
            const hasAllKeywords = keywords.every(keyword => oppText.includes(keyword));
            if (!hasAllKeywords) return false;
        }
        
        // Categories filter
        if (searchCriteria.categories.length > 0) {
            if (!searchCriteria.categories.includes(opp.category)) return false;
        }
        
        return true;
    });

    return (
        <div className="main-grid">
            <div className="main-content">
                <OpportunityFeed 
                    opportunities={filteredOpportunities}
                    onMessage={(opp) => setMessageOpportunity(opp)}
                    onEmail={(opp) => setEmailOpportunity(opp)}
                    onFlyer={(opp) => setFlyerOpportunity(opp)}
                    onUpdateStatus={handleUpdateStatus}
                    onEnrichmentSuccess={handleEnrichmentSuccess}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    flyers={flyers}
                    featureToggles={featureToggles}
                    onSelectFlyerType={onSelectFlyerType}
                    onSelectFlyerOpportunity={onSelectFlyerOpportunity}
                />
            </div>
            
            {/* Briefing Sidebar */}
            <div className="briefing-sidebar">
                <div className="briefing-header">
                    <h4>📋 Daily Strategic Briefing</h4>
                    <button 
                        className="btn btn-sm" 
                        onClick={() => {
                            // Trigger briefing generation
                            const event = new CustomEvent('generateBriefing');
                            window.dispatchEvent(event);
                        }}
                    >
                        Generate
                    </button>
                </div>
                <BriefingContent 
                    tokenUsage={tokenUsage} 
                    setTokenUsage={setTokenUsage}
                    searchCriteria={searchCriteria}
                    setSearchCriteria={setSearchCriteria}
                    filteredCount={filteredOpportunities.length}
                    opportunities={opportunities}
                    activeFilter={activeFilter}
                />
            </div>
            {messageOpportunity && (
                <MessageModal 
                    opportunity={messageOpportunity} 
                    onClose={() => setMessageOpportunity(null)} 
                    templates={messageTemplates}
                    onAddTemplate={onAddTemplate}
                    setTokenUsage={setTokenUsage}
                />
            )}
            {emailOpportunity && (
                 <EmailModal 
                    opportunity={emailOpportunity} 
                    onClose={() => setEmailOpportunity(null)}
                    setTokenUsage={setTokenUsage}
                />
            )}
            {flyerOpportunity && (
                <FlyerSelectionModal
                    opportunity={flyerOpportunity}
                    flyers={flyers[(() => {
                        const categoryToFlyerType: Record<OpportunityCategory, FlyerKey> = {
                            'Windows': 'windows',
                            'Bath': 'bath',
                            'Roof': 'roof',
                            'Siding': 'siding'
                        };
                        return categoryToFlyerType[flyerOpportunity.category];
                    })()] || []}
                    flyerType={(() => {
                        const categoryToFlyerType: Record<OpportunityCategory, FlyerKey> = {
                            'Windows': 'windows',
                            'Bath': 'bath',
                            'Roof': 'roof',
                            'Siding': 'siding'
                        };
                        return categoryToFlyerType[flyerOpportunity.category];
                    })()}
                    onClose={() => setFlyerOpportunity(null)}
                    onSendFlyer={(flyerDataUrl) => {
                        // Here you would integrate with your email/messaging service
                        // For now, we'll simulate sending
                        handleUpdateStatus(flyerOpportunity.id, 'Contacted');
                        
                        // Create a downloadable link for the flyer
                        const link = document.createElement('a');
                        link.href = flyerDataUrl;
                        link.download = `${flyerOpportunity.category.toLowerCase()}-flyer-${flyerOpportunity.id}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        alert(`Flyer sent successfully! Downloaded for ${flyerOpportunity.details}`);
                        setFlyerOpportunity(null);
                    }}
                />
            )}
        </div>
    );
};

const AnalyticsView = () => {
    const [analyticsData, setAnalyticsData] = useState({
        total_leads: 0,
        today_leads: 0,
        week_leads: 0,
        conversion_rate: 0,
        appointments_set: 0,
        cost_per_acquisition: 152.80
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:8001/leads/analytics');
                const result = await response.json();
                if (result.ok) {
                    setAnalyticsData(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                // Keep default values if fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        // Refresh analytics every 30 seconds
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-title">Loading Analytics...</div>
                    <div className="kpi-value">...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="kpi-grid">
            <KpiCard 
                title="New Opportunities" 
                value={analyticsData.total_leads.toString()} 
                trend={`+${analyticsData.today_leads} today`} 
                positive={analyticsData.today_leads > 0} 
            />
            <KpiCard 
                title="Conversion Rate" 
                value={`${analyticsData.conversion_rate}%`} 
                trend="+0.4%" 
                positive 
            />
            <KpiCard 
                title="Appointments Set" 
                value={analyticsData.appointments_set.toString()} 
            />
            <KpiCard 
                title="Cost Per Acquisition" 
                value={`$${analyticsData.cost_per_acquisition.toFixed(2)}`} 
                trend="-3.5%" 
                positive 
            />
        </div>
    );
};

const ToolsView = () => (
    <div className="tools-grid">
        <div className="grid-item">
            <h3>AI Tool Status</h3>
            <ul className="tool-status-list">
                <ToolStatusItem name="Maricopa Permit Bot" status="active" />
                <ToolStatusItem name="Zillow Scraper" status="active" />
                <ToolStatusItem name="Voice Call Analyzer" status="idle" />
                <ToolStatusItem name="Competitor Watch Bot" status="active" />
                <ToolStatusItem name="Social Media Scanner" status="error" />
                <ToolStatusItem name="New Homeowner Bot" status="active" />
            </ul>
        </div>
    </div>
);

const SettingsView = ({ featureToggles, setFeatureToggles, tokenUsage, setTokenUsage }: {
    featureToggles: { briefing: boolean; message: boolean; email: boolean };
    setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>;
    tokenUsage: { briefing: number; message: number; email: number };
    setFeatureToggles: React.Dispatch<React.SetStateAction<{ briefing: boolean; message: boolean; email: boolean }>>;
}) => {
    const [apiUsageData, setApiUsageData] = useState<Record<string, any> | null>(null);
    const [apiUsageLoading, setApiUsageLoading] = useState(true);
    const [apiUsageError, setApiUsageError] = useState<string | null>(null);

    useEffect(() => {
        fetchApiUsageData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchApiUsageData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchApiUsageData = async () => {
        try {
            setApiUsageLoading(true);
            const response = await fetch('http://localhost:8001/api/usage/status');
            if (!response.ok) {
                throw new Error('Failed to fetch API usage data');
            }
            const data = await response.json();
            setApiUsageData(data);
            setApiUsageError(null);
        } catch (err) {
            setApiUsageError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setApiUsageLoading(false);
        }
    };

    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'blocked': return 'text-red-600 bg-red-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-green-600 bg-green-100';
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h3>Settings</h3>
                <p>Manage your AI features and monitor token usage</p>
            </div>

            <div className="settings-grid">
                {/* Token Usage Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <h4>
                            <span>📊</span>
                            Token Usage & Controls
                        </h4>
                    </div>

                    {/* 2x2 Token Usage Grid */}
                    <div className="token-usage-grid">
                        <div className="token-metric-card">
                            <div className="token-metric-header">
                                <span className="token-metric-icon">📋</span>
                                <span className="token-metric-label">Briefing</span>
                            </div>
                            <div className="token-metric-value">{tokenUsage.briefing}</div>
                            <div className="token-metric-trend positive">+12%</div>
                        </div>

                        <div className="token-metric-card">
                            <div className="token-metric-header">
                                <span className="token-metric-icon">💬</span>
                                <span className="token-metric-label">Messages</span>
                            </div>
                            <div className="token-metric-value">{tokenUsage.message}</div>
                            <div className="token-metric-trend positive">+8%</div>
                        </div>

                        <div className="token-metric-card">
                            <div className="token-metric-header">
                                <span className="token-metric-icon">📧</span>
                                <span className="token-metric-label">Emails</span>
                            </div>
                            <div className="token-metric-value">{tokenUsage.email}</div>
                            <div className="token-metric-trend negative">-3%</div>
                        </div>

                        <div className="token-metric-card">
                            <div className="token-metric-header">
                                <span className="token-metric-icon">📊</span>
                                <span className="token-metric-label">Total</span>
                            </div>
                            <div className="token-metric-value">{tokenUsage.briefing + tokenUsage.message + tokenUsage.email}</div>
                            <div className="token-metric-trend positive">+7%</div>
                        </div>
                    </div>

                    {/* Area Selection Controls */}
                    <div className="area-selection-controls">
                        <h4>Run Areas</h4>
                        <div className="area-selection-grid">
                            <div className="area-control">
                                <label className="area-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={featureToggles.briefing}
                                        onChange={(e) => setFeatureToggles(prev => ({...prev, briefing: e.target.checked}))}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="area-label">Briefing Generation</span>
                                </label>
                            </div>

                            <div className="area-control">
                                <label className="area-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={featureToggles.message}
                                        onChange={(e) => setFeatureToggles(prev => ({...prev, message: e.target.checked}))}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="area-label">Message Templates</span>
                                </label>
                            </div>

                            <div className="area-control">
                                <label className="area-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={featureToggles.email}
                                        onChange={(e) => setFeatureToggles(prev => ({...prev, email: e.target.checked}))}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="area-label">Email Generation</span>
                                </label>
                            </div>

                            <div className="area-control">
                                <label className="area-checkbox">
                                    <input
                                        type="checkbox"
                                        defaultChecked={true}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="area-label">Lead Analysis</span>
                                </label>
                            </div>
                        </div>

                        <div className="control-actions">
                            <button className="run-selected-btn">
                                Run Selected Areas
                            </button>
                            <button className="reset-tokens-btn" onClick={() => setTokenUsage({ briefing: 0, message: 0, email: 0 })}>
                                Reset Counters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live API Usage Section */}
                <div className="settings-card full-width">
                    <div className="card-header">
                        <h4>
                            <span>🔴</span>
                            Live API Usage & Budget Monitoring
                        </h4>
                        <button 
                            className="refresh-btn"
                            onClick={fetchApiUsageData}
                            disabled={apiUsageLoading}
                        >
                            {apiUsageLoading ? '🔄' : '↻'} Refresh
                        </button>
                    </div>

                    {apiUsageLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading live API usage data...</p>
                        </div>
                    ) : apiUsageError ? (
                        <div className="error-state">
                            <p className="error-message">⚠️ {apiUsageError}</p>
                            <p className="error-hint">Make sure your backend server is running on port 8001</p>
                        </div>
                    ) : apiUsageData ? (
                        <div className="api-usage-grid">
                            {Object.entries(apiUsageData).map(([apiName, status]: [string, any]) => (
                                <div key={apiName} className="api-usage-card">
                                    <div className="api-header">
                                        <h5>{apiName.replace('_', ' ').toUpperCase()}</h5>
                                        <div className={`status-badge ${status.budget_check.status}`}>
                                            {status.budget_check.status.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {status.budget_check.warnings.length > 0 && (
                                        <div className="warnings-section">
                                            <h6>⚠️ Warnings:</h6>
                                            <ul>
                                                {status.budget_check.warnings.map((warning: string, idx: number) => (
                                                    <li key={idx}>{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="usage-metrics">
                                        <div className="metric-group">
                                            <h6>Today's Usage</h6>
                                            <div className="metric-row">
                                                <span>Calls: <strong>{status.today.calls}</strong></span>
                                                <span>Cost: <strong>{formatCurrency(status.today.cost)}</strong></span>
                                            </div>
                                            <div className="metric-limits">
                                                Limits: {status.limits.daily_limit} calls / {formatCurrency(status.limits.daily_cost_limit)}
                                            </div>
                                        </div>

                                        <div className="metric-group">
                                            <h6>This Month</h6>
                                            <div className="metric-row">
                                                <span>Calls: <strong>{status.month.calls}</strong></span>
                                                <span>Cost: <strong>{formatCurrency(status.month.cost)}</strong></span>
                                            </div>
                                            <div className="metric-limits">
                                                Limits: {status.limits.monthly_limit} calls / {formatCurrency(status.limits.monthly_cost_limit)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <div className="api-usage-footer">
                        <div className="quick-links">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="quick-link">
                                Check Gemini Usage →
                            </a>
                            <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="quick-link">
                                Check Maps Usage →
                            </a>
                        </div>
                        <p className="usage-note">
                            💡 Data refreshes automatically every 30 seconds. Budget limits prevent overspending.
                        </p>
                    </div>
                </div>

                {/* Performance Analytics Section */}
                <div className="settings-card full-width">
                    <div className="card-header">
                        <h4>
                            <span>📈</span>
                            Performance Analytics
                        </h4>
                    </div>

                    <div className="analytics-grid">
                        <div className="metric-card">
                            <div className="metric-header">
                                <h5>Response Time</h5>
                                <div className="metric-trend positive">+5%</div>
                            </div>
                            <div className="metric-value">1.2s</div>
                            <div className="metric-label">Average AI response time</div>
                            <div className="metric-chart">
                                <div className="chart-bar" style={{height: '60%'}}></div>
                                <div className="chart-bar" style={{height: '80%'}}></div>
                                <div className="chart-bar" style={{height: '70%'}}></div>
                                <div className="chart-bar" style={{height: '90%'}}></div>
                                <div className="chart-bar" style={{height: '75%'}}></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <h5>Success Rate</h5>
                                <div className="metric-trend positive">+2%</div>
                            </div>
                            <div className="metric-value">94.5%</div>
                            <div className="metric-label">AI generation success rate</div>
                            <div className="metric-gauge">
                                <div className="gauge-fill" style={{width: '94.5%'}}></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <h5>Cost Efficiency</h5>
                                <div className="metric-trend positive">+15%</div>
                            </div>
                            <div className="metric-value">$0.023</div>
                            <div className="metric-label">Cost per token</div>
                            <div className="metric-breakdown">
                                <div className="breakdown-item">
                                    <span>Briefing</span>
                                    <span>$0.018</span>
                                </div>
                                <div className="breakdown-item">
                                    <span>Messages</span>
                                    <span>$0.025</span>
                                </div>
                                <div className="breakdown-item">
                                    <span>Emails</span>
                                    <span>$0.028</span>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <h5>Usage Patterns</h5>
                                <div className="metric-trend neutral">0%</div>
                            </div>
                            <div className="metric-value">Peak Hours</div>
                            <div className="metric-label">9 AM - 11 AM, 2 PM - 4 PM</div>
                            <div className="metric-chart">
                                <div className="chart-bar" style={{height: '30%'}}></div>
                                <div className="chart-bar" style={{height: '45%'}}></div>
                                <div className="chart-bar" style={{height: '90%'}}></div>
                                <div className="chart-bar" style={{height: '95%'}}></div>
                                <div className="chart-bar" style={{height: '85%'}}></div>
                                <div className="chart-bar" style={{height: '70%'}}></div>
                                <div className="chart-bar" style={{height: '50%'}}></div>
                                <div className="chart-bar" style={{height: '35%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <h4>
                            <span>💾</span>
                            Data Management
                        </h4>
                    </div>

                    <div className="preference-group">
                        <div className="preference-item">
                            <label>Data Retention Period</label>
                            <select className="preference-select" defaultValue="90">
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="180">180 days</option>
                                <option value="365">1 year</option>
                                <option value="unlimited">Unlimited</option>
                            </select>
                        </div>

                        <div className="preference-item">
                            <label>Auto-backup Frequency</label>
                            <select className="preference-select" defaultValue="daily">
                                <option value="hourly">Every hour</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="preference-item">
                            <label>Data Export Format</label>
                            <select className="preference-select" defaultValue="json">
                                <option value="json">JSON</option>
                                <option value="csv">CSV</option>
                                <option value="xlsx">Excel</option>
                                <option value="pdf">PDF Report</option>
                            </select>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="action-btn primary">Export All Data</button>
                        <button className="action-btn">Import Data</button>
                        <button className="action-btn danger">Clear All Data</button>
                    </div>
                </div>

                {/* Notification Settings Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <h4>
                            <span>🔔</span>
                            Notifications
                        </h4>
                    </div>

                    <div className="toggle-group">
                        <div className="feature-toggle">
                            <div className="toggle-content">
                                <div className="feature-header">
                                    <h5>Email Notifications</h5>
                                    <span className="feature-status">Enabled</span>
                                </div>
                                <p>Receive email updates about lead activities and system alerts</p>
                                <div className="feature-meta">
                                    <span className="feature-category">Communication</span>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="feature-toggle">
                            <div className="toggle-content">
                                <div className="feature-header">
                                    <h5>Push Notifications</h5>
                                    <span className="feature-status">Disabled</span>
                                </div>
                                <p>Get instant notifications on your device for important updates</p>
                                <div className="feature-meta">
                                    <span className="feature-category">Mobile</span>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="feature-toggle">
                            <div className="toggle-content">
                                <div className="feature-header">
                                    <h5>Weekly Reports</h5>
                                    <span className="feature-status">Enabled</span>
                                </div>
                                <p>Receive weekly performance summaries and analytics</p>
                                <div className="feature-meta">
                                    <span className="feature-category">Analytics</span>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="feature-toggle">
                            <div className="toggle-content">
                                <div className="feature-header">
                                    <h5>System Alerts</h5>
                                    <span className="feature-status">Enabled</span>
                                </div>
                                <p>Critical system notifications and error alerts</p>
                                <div className="feature-meta">
                                    <span className="feature-category">System</span>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Advanced Configuration Section */}
                <div className="settings-card full-width">
                    <div className="card-header">
                        <h4>
                            <span>⚙️</span>
                            Advanced Configuration
                        </h4>
                    </div>

                    <div className="settings-grid">
                        <div className="preference-group">
                            <h5>AI Model Settings</h5>
                            <div className="preference-item">
                                <label>Primary AI Model</label>
                                <select className="preference-select" defaultValue="gpt-4">
                                    <option value="gpt-4">GPT-4 (Recommended)</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    <option value="claude-3">Claude 3</option>
                                    <option value="gemini-pro">Gemini Pro</option>
                                </select>
                            </div>

                            <div className="preference-item">
                                <label>Temperature</label>
                                <input type="range" min="0" max="2" step="0.1" defaultValue="0.7" className="preference-range" />
                                <span className="range-value">0.7</span>
                            </div>

                            <div className="preference-item">
                                <label>Max Tokens per Request</label>
                                <select className="preference-select" defaultValue="2000">
                                    <option value="500">500 tokens</option>
                                    <option value="1000">1000 tokens</option>
                                    <option value="2000">2000 tokens</option>
                                    <option value="4000">4000 tokens</option>
                                    <option value="8000">8000 tokens</option>
                                </select>
                            </div>
                        </div>

                        <div className="preference-group">
                            <h5>System Preferences</h5>
                            <div className="preference-item">
                                <label>Theme</label>
                                <select className="preference-select" defaultValue="dark">
                                    <option value="dark">Dark Mode</option>
                                    <option value="light">Light Mode</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>

                            <div className="preference-item">
                                <label>Language</label>
                                <select className="preference-select" defaultValue="en">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>

                            <div className="preference-item">
                                <label>Timezone</label>
                                <select className="preference-select" defaultValue="pst">
                                    <option value="pst">Pacific Time</option>
                                    <option value="mst">Mountain Time</option>
                                    <option value="cst">Central Time</option>
                                    <option value="est">Eastern Time</option>
                                    <option value="utc">UTC</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Information Section */}
                <div className="settings-card full-width">
                    <div className="card-header">
                        <h4>
                            <span>ℹ️</span>
                            System Information
                        </h4>
                    </div>

                    <div className="settings-grid">
                        <div className="system-info-group">
                            <h5>Application</h5>
                            <div className="info-item">
                                <span>Version:</span>
                                <span>2.1.0</span>
                            </div>
                            <div className="info-item">
                                <span>Build:</span>
                                <span>2025.09.28</span>
                            </div>
                            <div className="info-item">
                                <span>Environment:</span>
                                <span>Production</span>
                            </div>
                        </div>

                        <div className="system-info-group">
                            <h5>Performance</h5>
                            <div className="info-item">
                                <span>Memory Usage:</span>
                                <span>127 MB</span>
                            </div>
                            <div className="info-item">
                                <span>CPU Usage:</span>
                                <span>12%</span>
                            </div>
                            <div className="info-item">
                                <span>Network:</span>
                                <span>Stable</span>
                            </div>
                        </div>

                        <div className="system-info-group">
                            <h5>API Status</h5>
                            <div className="info-item">
                                <span>OpenAI API:</span>
                                <span className="status-indicator active">Connected</span>
                            </div>
                            <div className="info-item">
                                <span>Firebase:</span>
                                <span className="status-indicator active">Connected</span>
                            </div>
                            <div className="info-item">
                                <span>Database:</span>
                                <span className="status-indicator active">Connected</span>
                            </div>
                        </div>

                        <div className="system-info-group">
                            <h5>Storage</h5>
                            <div className="info-item">
                                <span>Used Space:</span>
                                <span>2.4 GB</span>
                            </div>
                            <div className="info-item">
                                <span>Available:</span>
                                <span>15.6 GB</span>
                            </div>
                            <div className="info-item">
                                <span>Files:</span>
                                <span>1,247</span>
                            </div>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="action-btn">Check for Updates</button>
                        <button className="action-btn">System Diagnostics</button>
                        <button className="action-btn">Generate Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const KpiCard = ({ title, value, trend, positive }: {title: string, value: string, trend?: string, positive?: boolean}) => (
    <div className="kpi-card">
        <h4>{title}</h4>
        <div className="kpi-value">{value}</div>
        {trend && <div className={`kpi-trend ${positive ? 'positive' : 'negative'}`}>{trend}</div>}
    </div>
);

const ToolStatusItem = ({ name, status }: {name: string, status: 'active' | 'idle' | 'error'}) => (
    <li className="tool-status-item">
        <span>{name}</span>
        <div className={`status-indicator ${status}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
    </li>
);

const OpportunityFeed = ({ opportunities, onMessage, onEmail, onFlyer, onUpdateStatus, onEnrichmentSuccess, activeFilter, setActiveFilter, flyers, featureToggles, onSelectFlyerType, onSelectFlyerOpportunity }: { 
    opportunities: Opportunity[],
    onMessage: (opportunity: Opportunity) => void,
    onEmail: (opportunity: Opportunity) => void,
    onFlyer: (opportunity: Opportunity) => void,
    onUpdateStatus: (id: number, status: OpportunityStatus) => void,
    onEnrichmentSuccess: (id: number, phone: string) => void,
    activeFilter: StatusFilter,
    setActiveFilter: (filter: StatusFilter) => void,
    flyers: Record<FlyerKey, string[]>,
    featureToggles: { briefing: boolean; message: boolean; email: boolean },
    onSelectFlyerType: (flyerType: FlyerKey) => void;
    onSelectFlyerOpportunity: (opportunity: Opportunity) => void;
}) => {
    const categories: OpportunityCategory[] = ['Windows', 'Bath', 'Roof', 'Siding'];

    return (
        <div className="grid-item opportunity-feed-container">
            <div className="feed-header">
                <h3>Opportunity Feed</h3>
                <div className="filter-controls">
                    {(['All', 'New', 'Interested'] as StatusFilter[]).map(filter => (
                        <button 
                            key={filter} 
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
            <div className="opportunity-feed">
                {categories.map(category => {
                    const categoryOpportunities = opportunities.filter(opp => opp.category === category);
                    if (categoryOpportunities.length === 0) return null;
                    return (
                        <div key={category} className="feed-category-group">
                            <h4 className="category-header">{category}</h4>
                            <ul className="opportunity-list">
                                {categoryOpportunities.map((item) => <OpportunityCard key={item.id} opportunity={item} onMessage={() => onMessage(item)} onEmail={() => onEmail(item)} onFlyer={() => onFlyer(item)} onUpdateStatus={onUpdateStatus} onEnrichmentSuccess={onEnrichmentSuccess} flyers={flyers} featureToggles={featureToggles} onSelectFlyerType={onSelectFlyerType} onSelectFlyerOpportunity={onSelectFlyerOpportunity} />)}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OpportunityCard: React.FC<{
    opportunity: Opportunity, 
    onMessage: () => void,
    onEmail: () => void,
    onFlyer: () => void,
    onUpdateStatus: (id: number, status: OpportunityStatus) => void,
    onEnrichmentSuccess: (id: number, phone: string) => void,
    flyers: Record<FlyerKey, string[]>,
    featureToggles: { briefing: boolean; message: boolean; email: boolean },
    onSelectFlyerType: (flyerType: FlyerKey) => void;
    onSelectFlyerOpportunity: (opportunity: Opportunity) => void;
}> = ({ opportunity, onMessage, onEmail, onFlyer, onUpdateStatus, onEnrichmentSuccess, flyers, featureToggles, onSelectFlyerType, onSelectFlyerOpportunity }) => {
    const [isEnriching, setIsEnriching] = useState(false);
    const [flyerMenuOpen, setFlyerMenuOpen] = useState(false);
    const [flyerModalOpen, setFlyerModalOpen] = useState(false);
    const [selectedFlyerForSending, setSelectedFlyerForSending] = useState<string | null>(null);
    const flyerMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (flyerMenuRef.current && !flyerMenuRef.current.contains(event.target as Node)) {
                setFlyerMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const getStealthColor = (score: number) => {
        if (score > 80) return 'high';
        if (score > 50) return 'medium';
        return 'low';
    };

    const handleCall = () => {
        if (!opportunity.phone) return;
        onUpdateStatus(opportunity.id, 'Contacted');
        window.location.href = `tel:${opportunity.phone}`;
    };

    const handleSendToSalesRabbit = () => {
        onUpdateStatus(opportunity.id, 'Sent');
        alert(`Lead for ${opportunity.details} sent to Sales Rabbit.`);
    }

    const handleSendFlyer = () => {
        // Map opportunity category to flyer type
        const categoryToFlyerType: Record<OpportunityCategory, FlyerKey> = {
            'Windows': 'windows',
            'Bath': 'bath',
            'Roof': 'roof',
            'Siding': 'siding'
        };

        const flyerType = categoryToFlyerType[opportunity.category];
        if (!flyerType) {
            alert('No flyer type available for this category');
            return;
        }

        // Set the current opportunity for flyer sending
        onSelectFlyerOpportunity(opportunity);
        // Always navigate to flyers view to let user choose and send
        onSelectFlyerType(flyerType);
    };

    const handleFindContactInfo = () => {
        setIsEnriching(true);
        // Simulate an API call to a data enrichment service
        setTimeout(() => {
            // Simulate a 75% success rate
            if (Math.random() > 0.25) {
                const areaCode = ['555', '602', '480', '623'][Math.floor(Math.random() * 4)];
                const nextPart = String(Math.floor(Math.random() * 900) + 100);
                const lastPart = String(Math.floor(Math.random() * 9000) + 1000);
                const fakePhone = `${areaCode}-${nextPart}-${lastPart}`;
                onEnrichmentSuccess(opportunity.id, fakePhone);
            } else {
                alert('Data enrichment failed: Could not find a phone number for this lead.');
                setIsEnriching(false);
            }
        }, 1500);
    };
    
    return (
        <li className={`opportunity-card ${opportunity.status === 'Sent' ? 'archived' : ''}`}>
            <div className="card-header">
                <span className="opportunity-type">{opportunity.type}</span>
                <div className="status-container">
                    <span className={`status-tag status-${opportunity.status.toLowerCase()}`}>{opportunity.status}</span>
                    <div className={`stealth-score ${getStealthColor(opportunity.stealth)}`}>
                        Stealth: {opportunity.stealth}%
                    </div>
                </div>
            </div>
            <p className="opportunity-details">{opportunity.details}</p>
            {opportunity.address && (
                <div className="opportunity-address">
                    <span className="address-icon">📍</span>
                    <span className="address-text">{opportunity.address}</span>
                </div>
            )}
             {opportunity.phone === null && <p className="no-phone-notice">Phone number needed for this lead.</p>}
            <div className="card-actions">
                {opportunity.status === 'New' && <button className="action-btn-sm" onClick={() => onUpdateStatus(opportunity.id, 'Contacted')}>Mark as Contacted</button>}
                {opportunity.status === 'Contacted' && <button className="action-btn-sm" onClick={() => onUpdateStatus(opportunity.id, 'Interested')}>Mark as Interested</button>}
            </div>
            <div className="card-footer">
                <span className="opportunity-source">Source: {opportunity.source}</span>
                <div className="opportunity-actions">
                    <button className="action-btn flyer-btn" onClick={handleSendFlyer} disabled={!Object.values(flyers).some(f => Array.isArray(f) && f.length > 0)}>
                        Send Flyer
                    </button>
                     
                    {opportunity.phone ? (
                        <>
                            <button className="action-btn call-btn" onClick={handleCall}>Call</button>
                            {featureToggles.message && <button className="action-btn msg-btn" onClick={onMessage}>Message</button>}
                        </>
                    ) : (
                        <button className="action-btn enrich-btn" onClick={handleFindContactInfo} disabled={isEnriching}>
                            {isEnriching ? 'Searching...' : 'Find Contact Info'}
                        </button>
                    )}
                    {featureToggles.email && <button className="action-btn email-btn" onClick={onEmail} disabled={!opportunity.email}>Email</button>}

                    <button 
                        className={`action-btn send-btn ${opportunity.status === 'Interested' ? 'primary' : ''}`} 
                        onClick={handleSendToSalesRabbit}
                        disabled={opportunity.status !== 'Interested'}
                    >
                        Send to Sales Rabbit
                    </button>
                </div>
            </div>
        </li>
    );
};

const FlyerSelectionModal = ({ 
    opportunity, 
    flyers, 
    flyerType, 
    onClose, 
    onSendFlyer 
}: { 
    opportunity: Opportunity;
    flyers: string[];
    flyerType: FlyerKey;
    onClose: () => void;
    onSendFlyer: (flyerDataUrl: string) => void;
}) => {
    const flyerConfig = FLYER_CONFIG.find(f => f.key === flyerType);
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content flyer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Select {flyerConfig?.label} for {opportunity.details}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="flyer-selection-grid">
                        {flyers.map((flyer, index) => (
                            <div key={index} className="flyer-option" onClick={() => onSendFlyer(flyer)}>
                                <img src={flyer} alt={`${flyerConfig?.label} ${index + 1}`} />
                                <div className="flyer-option-label">Design {index + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const DailyBriefingModal = ({ onClose, setTokenUsage }: {onClose: () => void; setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>}) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateBriefing = async () => {
            try {
                if (!process.env.VITE_GEMINI_API_KEY) {
                    throw new Error('Gemini API key is not configured. Please check your .env.local file.');
                }

                const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY as string });
                
                const prompt = `You are a marketing strategy AI for a single-owner window company in Arizona. The company's unique selling proposition is a FLIR thermal camera scan offered with every free estimate to find hidden issues. Based on this data, write a concise, actionable 2-3 sentence daily briefing to help the owner beat large competitors:
                - Data: 5 new homeowner leads in Scottsdale (ZIP 85254).
                - Data: 15% increase in local bathroom remodel permits in 85254.
                - Data: Competitor 'Pella' has increased ad spend on 'energy-efficient windows'.
                - Action: Formulate a strategy that leverages the FLIR camera advantage by explicitly showcasing how your FLIR thermal scan scientifically identifies and proves hidden energy loss in windows, outperforming Pella's claims and offering homeowners uniquely precise and verifiable solutions.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });
                
                setBriefing(response.text);
                setTokenUsage(prev => ({ ...prev, briefing: response.usageMetadata?.totalTokenCount || 0 }));
            } catch (error) {
                console.error("Error generating briefing:", error);
                setBriefing("Could not generate briefing at this time. Please check your API key and network connection.");
            } finally {
                setIsLoading(false);
            }
        };

        generateBriefing();
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Your Daily Strategic Briefing</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <p>{briefing}</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>Begin</button>
                </div>
            </div>
        </div>
    );
};

const MessageModal = ({ opportunity, onClose, templates, onAddTemplate, setTokenUsage }: { 
    opportunity: Opportunity, 
    onClose: () => void,
    templates: string[],
    onAddTemplate: (template: string) => void,
    setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>
}) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateMessage = async () => {
            try {
                if (!process.env.VITE_GEMINI_API_KEY) {
                    throw new Error('Gemini API key is not configured. Please check your .env.local file.');
                }

                const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY as string });
                const prompt = `You are a friendly sales assistant for a home improvement company in Arizona. A lead was found via our "${opportunity.source}" tool with these details: "${opportunity.details}".
                Craft a short, compelling, and friendly text message for this lead.
                The message MUST:
                1. Mention their potential project context (e.g., "remodeling", "new home").
                2. Offer a free, no-obligation estimate.
                3. Highlight our unique differentiator: we include a free FLIR thermal camera scan with every estimate to spot hidden water damage or energy loss.
                Keep it concise and end with a question to encourage a reply.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                
                setMessage(response.text);
                setTokenUsage(prev => ({ ...prev, message: response.usageMetadata?.totalTokenCount || 0 }));
            } catch (error) {
                console.error("Error generating message:", error);
                setMessage("Hi! We saw you might be interested in a home project. We offer free estimates, including a thermal camera scan to check for issues. Would you be interested in learning more?");
            } finally {
                setIsLoading(false);
            }
        };
        generateMessage();
    }, [opportunity]);

    const handleCopyAndOpen = () => {
        navigator.clipboard.writeText(message);
        window.open('https://voice.google.com/', '_blank');
    };

    const handleSaveTemplate = () => {
        onAddTemplate(message);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content message-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Craft Message</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6}></textarea>
                            <div className="template-section">
                                <h5>Quick Templates</h5>
                                {templates.length > 0 ? (
                                    <div className="template-buttons">
                                        {templates.map((template, index) => (
                                            <button key={index} className="template-btn" onClick={() => setMessage(template)}>
                                                Template #{index + 1}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-templates-notice">No templates saved yet. Type a message and save it!</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn" onClick={handleSaveTemplate}>Save Current as Template</button>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCopyAndOpen}>Copy & Open Google Voice</button>
                </div>
            </div>
        </div>
    );
};

const EmailModal = ({ opportunity, onClose, setTokenUsage }: {
    opportunity: Opportunity,
    onClose: () => void,
    setTokenUsage: React.Dispatch<React.SetStateAction<{ briefing: number; message: number; email: number }>>
}) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateEmail = async () => {
            try {
                if (!process.env.VITE_GEMINI_API_KEY) {
                    throw new Error('Gemini API key is not configured. Please check your .env.local file.');
                }

                const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY as string });
                const prompt = `You are a professional sales assistant for a home improvement company in Arizona. A lead was found via our "${opportunity.source}" tool with these details: "${opportunity.details}".
                Craft a professional email for this lead.
                The email MUST:
                1. Have a compelling, non-spammy subject line.
                2. Briefly reference their potential project context.
                3. Offer a free, no-obligation estimate.
                4. Highlight our unique differentiator: a free FLIR thermal camera scan with every estimate to spot hidden issues.
                5. End with a clear call to action and a professional closing.
                
                Format the output as a JSON object with two keys: "subject" and "body".`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    // Fix: Added responseSchema to ensure the model returns a structured JSON object.
                    config: { 
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                subject: { type: Type.STRING },
                                body: { type: Type.STRING },
                            },
                            required: ['subject', 'body'],
                        },
                    },
                });

                // Fix: Added a try-catch block to safely parse the JSON response from the model.
                try {
                    // The response.text is a JSON string, so we parse it.
                    const generatedEmail = JSON.parse(response.text);
                    setSubject(generatedEmail.subject);
                    setBody(generatedEmail.body);
                    setTokenUsage(prev => ({ ...prev, email: response.usageMetadata?.totalTokenCount || 0 }));
                } catch (parseError) {
                    console.error("Error parsing generated email JSON:", parseError);
                    throw new Error("Failed to parse AI response.");
                }
            } catch (error) {
                console.error("Error generating email:", error);
                setSubject("Free Estimate for Your Home Project");
                setBody(`Hi,\n\nWe noticed you might be interested in a project for your home. We offer free, no-obligation estimates and include a complimentary FLIR thermal camera scan to identify any hidden energy loss or moisture issues.\n\nWould you be available for a quick chat next week?\n\nBest regards,\nThe Woo Hunter Team`);
            } finally {
                setIsLoading(false);
            }
        };
        generateEmail();
    }, [opportunity]);

    const handleOpenInClient = () => {
        if (!opportunity.email) return;
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        window.location.href = `mailto:${opportunity.email}?subject=${encodedSubject}&body=${encodedBody}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content email-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Compose Email</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <>
                            <input
                                type="text"
                                className="subject-input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Subject"
                            />
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={10}
                                placeholder="Email body..."
                            ></textarea>
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleOpenInClient}>Open in Email Client</button>
                </div>
            </div>
        </div>
    );
};

const FlyerManagerView = ({ flyerKey, flyers, setFlyers }: {
    flyerKey: FlyerKey;
    flyers: Record<FlyerKey, string[]>;
    setFlyers: (flyers: Record<FlyerKey, string[]>) => void;
}) => {
    const flyer = FLYER_CONFIG.find(f => f.key === flyerKey);

    const handleFileUpload = (newFileDataUrls: string[]) => {
        setFlyers({
            ...flyers,
            [flyerKey]: [...(flyers[flyerKey] || []), ...newFileDataUrls],
        });
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFlyers({
            ...flyers,
            [flyerKey]: flyers[flyerKey].filter((_, index) => index !== indexToRemove),
        });
    };
    
    return (
        <div className="flyer-manager-view">
            <FileUpload 
                label={flyer?.label || 'Flyer'} 
                uploadedFiles={flyers[flyerKey]} 
                onFileUpload={handleFileUpload} 
                onRemoveFile={handleRemoveFile}
            />
        </div>
    );
};

const FlyersView = ({ flyers, setFlyers, selectedFlyerType, currentOpportunity, onClearCurrentOpportunity }: {
    flyers: Record<FlyerKey, string[]>;
    setFlyers: (flyers: Record<FlyerKey, string[]>) => void;
    selectedFlyerType?: FlyerKey | null;
    currentOpportunity?: Opportunity | null;
    onClearCurrentOpportunity: () => void;
}) => {
    const [selectedFlyerKey, setSelectedFlyerKey] = useState<FlyerKey>(selectedFlyerType || 'doorHanger');
    const [workspaceImage, setWorkspaceImage] = useState<string | null>(null);
    const [workspaceFile, setWorkspaceFile] = useState<File | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
    const [width, setWidth] = useState(1080);
    const [height, setHeight] = useState(1080);
    const [unit, setUnit] = useState<'px' | 'in'>('px');
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.9);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>('square');
    const [selectedFlyerForApproval, setSelectedFlyerForApproval] = useState<string | null>(null);
    const [showSendToLead, setShowSendToLead] = useState(false);

    const selectedFlyer = FLYER_CONFIG.find(f => f.key === selectedFlyerKey);

    // Update dimensions when flyer type changes
    useEffect(() => {
        if (selectedFlyer) {
            const defaultDims = selectedFlyer.defaultDimensions;
            if (defaultDims.unit === 'in') {
                setWidth(inchesToPixels(defaultDims.width));
                setHeight(inchesToPixels(defaultDims.height));
                setUnit('in');
            } else {
                setWidth(defaultDims.width);
                setHeight(defaultDims.height);
                setUnit('px');
            }
        }
    }, [selectedFlyerKey]);

    const handleWorkspaceUpload = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setWorkspaceFile(file);
            
            // Read file for preview and capture original dimensions
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalDimensions({ width: img.width, height: img.height });
                    setWorkspaceImage(e.target?.result as string);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWorkspaceDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleWorkspaceDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragging to false if we're actually leaving the drop zone
        // and not just moving over a child element
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleWorkspaceDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleWorkspaceUpload(files);
        }
    };

    const handleApplyPreset = (presetKey: string) => {
        const preset = EXPORT_PRESETS[presetKey as keyof typeof EXPORT_PRESETS];
        if (preset) {
            setWidth(preset.width);
            setHeight(preset.height);
            setUnit('px');
            setSelectedPreset(presetKey);
        }
    };

    const handleResize = async () => {
        if (!workspaceFile) return;

        setIsProcessing(true);
        try {
            const processedImage = await processImage(workspaceFile, width, height, format, quality, true);
            setWorkspaceImage(processedImage);
            setWorkspaceFile(null); // Clear the file since we now have processed data
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveToLibrary = (flyerKey?: FlyerKey) => {
        if (!workspaceImage) return;
        const targetKey = flyerKey || selectedFlyerKey;

        setFlyers({
            ...flyers,
            [targetKey]: [...(flyers[targetKey] || []), workspaceImage],
        });
        setWorkspaceImage(null);
        setWorkspaceFile(null);
        const flyerType = FLYER_CONFIG.find(f => f.key === targetKey);
        alert(`Image saved to ${flyerType?.label} library!`);
    };

    const convertWidth = (value: number) => unit === 'in' ? inchesToPixels(value) : value;
    const convertHeight = (value: number) => unit === 'in' ? inchesToPixels(value) : value;

    const handleFileUpload = (newFileDataUrls: string[], flyerKey?: FlyerKey) => {
        const targetKey = flyerKey || selectedFlyerKey;
        setFlyers({
            ...flyers,
            [targetKey]: [...(flyers[targetKey] || []), ...newFileDataUrls],
        });
    };

    const handleRemoveFile = (indexToRemove: number, flyerKey?: FlyerKey) => {
        const targetKey = flyerKey || selectedFlyerKey;
        setFlyers({
            ...flyers,
            [targetKey]: flyers[targetKey].filter((_, index) => index !== indexToRemove),
        });
    };

    return (
        <div className="flyers-view">
            {/* Compact Send to Lead Section */}
            {currentOpportunity && (
                <div className="send-to-lead-compact">
                    <div className="send-to-lead-header" onClick={() => setShowSendToLead(!showSendToLead)}>
                        <span className="lead-summary">
                            📤 Send flyer to {currentOpportunity.details} ({flyers[selectedFlyerKey]?.length || 0} available)
                        </span>
                        <button className="expand-btn">
                            {showSendToLead ? '▼' : '▶'}
                        </button>
                    </div>
                    
                    {showSendToLead && (
                        <div className="send-to-lead-expanded">
                            <div className="lead-info-compact">
                                <p><strong>Category:</strong> {currentOpportunity.category} | <strong>Type:</strong> {currentOpportunity.type}</p>
                            </div>
                            
                            <div className="flyer-selection-section">
                                <h4>Select a {selectedFlyer?.label} to Send:</h4>
                                {flyers[selectedFlyerKey] && flyers[selectedFlyerKey].length > 0 ? (
                                    <div className="flyer-selection-grid">
                                        {flyers[selectedFlyerKey].map((flyer, index) => (
                                            <div 
                                                key={index} 
                                                className={`flyer-selection-item ${selectedFlyerForApproval === flyer ? 'selected' : ''}`}
                                                onClick={() => setSelectedFlyerForApproval(flyer)}
                                            >
                                                <img src={flyer} alt={`${selectedFlyer?.label} ${index + 1}`} />
                                                <div className="flyer-selection-label">Design {index + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-flyers-message">
                                        <p>No {selectedFlyer?.label.toLowerCase()} flyers available.</p>
                                        <p>Create some flyers first using the workspace below.</p>
                                    </div>
                                )}
                                
                                {selectedFlyerForApproval && (
                                    <div className="flyer-approval-section">
                                        <h4>Preview & Approve</h4>
                                        <div className="flyer-preview">
                                            <img src={selectedFlyerForApproval} alt="Selected flyer" />
                                        </div>
                                        <div className="approval-actions">
                                            <button 
                                                className="btn btn-secondary" 
                                                onClick={() => setSelectedFlyerForApproval(null)}
                                            >
                                                Choose Different
                                            </button>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    alert(`Flyer sent successfully to ${currentOpportunity.details}!`);
                                                    onClearCurrentOpportunity();
                                                    setSelectedFlyerForApproval(null);
                                                }}
                                            >
                                                Approve & Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Flyer Type Selection */}
            <div className="flyer-type-buttons">
                {FLYER_CONFIG.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`flyer-type-btn ${selectedFlyerKey === key ? 'active' : ''}`}
                        onClick={() => setSelectedFlyerKey(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Consolidated Flyer Controls */}
            <div className="flyer-controls-section">
                <h3>{selectedFlyer?.label} Controls</h3>
                
                {/* Export Presets */}
                <div className="export-presets">
                    <h4>Quick Export Sizes</h4>
                    <div className="preset-buttons">
                        {Object.entries(EXPORT_PRESETS).map(([key, preset]) => (
                            <button
                                key={key}
                                className={`preset-btn ${selectedPreset === key ? 'active' : ''}`}
                                onClick={() => handleApplyPreset(key)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="workspace-controls">
                    <div className="control-group">
                        <label>Width:</label>
                        <input
                            type="number"
                            value={unit === 'in' ? pixelsToInches(width) : width}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setWidth(unit === 'in' ? inchesToPixels(value) : value);
                            }}
                        />
                        <select value={unit} onChange={(e) => setUnit(e.target.value as 'px' | 'in')}>
                            <option value="px">px</option>
                            <option value="in">in</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Height:</label>
                        <input
                            type="number"
                            value={unit === 'in' ? pixelsToInches(height) : height}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setHeight(unit === 'in' ? inchesToPixels(value) : value);
                            }}
                        />
                        <select value={unit} onChange={(e) => setUnit(e.target.value as 'px' | 'in')}>
                            <option value="px">px</option>
                            <option value="in">in</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Format:</label>
                        <select value={format} onChange={(e) => setFormat(e.target.value)}>
                            <option value="image/jpeg">JPEG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WebP</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Quality:</label>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={quality}
                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                        />
                        <span>{Math.round(quality * 100)}%</span>
                    </div>
                    <button className="btn btn-primary" onClick={handleResize} disabled={!workspaceImage || isProcessing}>
                        {isProcessing ? 'Processing...' : 'Resize Image'}
                    </button>
                    <button className="btn" onClick={handleSaveToLibrary} disabled={!workspaceImage}>
                        Save to {selectedFlyer?.label}
                    </button>
                </div>

                <div className="workspace-upload">
                    {!workspaceImage ? (
                        <div 
                            className={`workspace-drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleWorkspaceDragOver}
                            onDragLeave={handleWorkspaceDragLeave}
                            onDrop={handleWorkspaceDrop}
                            onClick={() => document.getElementById('workspace-file-input')?.click()}
                        >
                            <UploadIcon />
                            <span>Upload image for {selectedFlyer?.label.toLowerCase()} processing</span>
                        </div>
                    ) : (
                        <div className="workspace-preview">
                            <img src={workspaceImage} alt={`${selectedFlyer?.label} preview`} />
                            <div className="preview-info">
                                <div>Current: {width} x {height} px</div>
                                {originalDimensions && (
                                    <div>Original: {originalDimensions.width} x {originalDimensions.height} px</div>
                                )}
                            </div>
                        </div>
                    )}
                    <input
                        id="workspace-file-input"
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleWorkspaceUpload(e.target.files)}
                    />
                </div>
            </div>

            {/* Unified Flyer Library */}
            <div className="flyer-library">
                <h3>Flyer Library</h3>
                <div className="library-tabs">
                    {FLYER_CONFIG.map(({ key, label }) => (
                        <button
                            key={key}
                            className={`library-tab ${selectedFlyerKey === key ? 'active' : ''}`}
                            onClick={() => setSelectedFlyerKey(key)}
                        >
                            {label} ({flyers[key]?.length || 0})
                        </button>
                    ))}
                </div>
                <FileUpload
                    label={selectedFlyer?.label || 'Flyer'}
                    uploadedFiles={flyers[selectedFlyerKey]}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                    currentOpportunity={currentOpportunity}
                    onSendFlyer={currentOpportunity ? (flyerDataUrl) => {
                        alert(`Flyer sent successfully to ${currentOpportunity.details}!`);
                        onClearCurrentOpportunity();
                    } : undefined}
                />
            </div>
        </div>
    );
};

const FileUpload = ({ label, uploadedFiles, onFileUpload, onRemoveFile, currentOpportunity, onSendFlyer }: { 
    label: string, 
    uploadedFiles: string[], 
    onFileUpload: (files: string[]) => void,
    onRemoveFile: (index: number) => void,
    currentOpportunity?: Opportunity | null,
    onSendFlyer?: (flyerDataUrl: string) => void
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filePromises = Array.from(files).map(file => {
            return new Promise<string>((resolve, reject) => {
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target?.result as string);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                } else {
                    resolve(''); 
                }
            });
        });

        Promise.all(filePromises).then(dataUrls => {
            const validUrls = dataUrls.filter(url => url);
            if (validUrls.length > 0) {
                onFileUpload(validUrls);
            }
            if (validUrls.length < files.length) {
                alert('Some files were not valid images and were ignored.');
            }
        }).catch(error => {
            console.error("Error reading files:", error);
            alert('An error occurred while uploading the files.');
        });
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragging to false if we're actually leaving the drop zone
        // and not just moving over a child element
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };

    const triggerFileInput = () => document.getElementById(`file-input-${label}`)?.click();

    const hasFiles = uploadedFiles && uploadedFiles.length > 0;

    return (
        <div className="file-upload-container">
            <div 
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${hasFiles ? 'has-files' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                {hasFiles ? (
                    <div className="uploaded-files-grid">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="uploaded-file-item">
                                <img src={file} alt={`${label} ${index + 1}`} className="uploaded-file-preview" />
                                <div className="file-item-controls">
                                    <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); onRemoveFile(index); }}>&times;</button>
                                    {currentOpportunity && onSendFlyer && (
                                        <button 
                                            className="send-file-btn" 
                                            onClick={(e) => { e.stopPropagation(); onSendFlyer(file); }}
                                            title={`Send to ${currentOpportunity.details}`}
                                        >
                                            Send
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="add-more-prompt">
                            <UploadIcon />
                            <span>Drop more files or click to add</span>
                        </div>
                    </div>
                ) : (
                    <div className="drop-zone-prompt">
                        <UploadIcon />
                        <span>Drag & drop {label.toLowerCase()} or click to upload</span>
                    </div>
                )}
            </div>
            <input 
                type="file" 
                id={`file-input-${label}`}
                style={{ display: 'none' }} 
                accept="image/*"
                multiple
                onChange={handleFileChange} 
            />
        </div>
    );
};


const MainApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('wooLoggedIn');
        if (loggedIn === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (password: string) => {
        localStorage.setItem('wooLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('wooLoggedIn');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return <App onLogout={handleLogout} />;
};


const root = createRoot(document.getElementById('root')!);
root.render(<MainApp />);