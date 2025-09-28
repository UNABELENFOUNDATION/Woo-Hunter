/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Import `Type` to define a response schema for JSON output.
import { GoogleGenAI, Type } from "@google/genai";

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
const UploadIcon = () => <IconWrapper><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></IconWrapper>;
const EmailIcon = () => <IconWrapper><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></IconWrapper>;
const ImageIcon = () => <IconWrapper><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></IconWrapper>;
const MenuIcon = () => <IconWrapper><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></IconWrapper>;
const SunIcon = () => <IconWrapper><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></IconWrapper>;
const MoonIcon = () => <IconWrapper><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></IconWrapper>;

type FlyerKey = 'doorHanger' | 'windows' | 'bath' | 'roof' | 'siding';
type View = 'hunter' | 'analytics' | `flyer-${FlyerKey}` | 'tools' | 'settings';
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
    stealth: number;
    status: OpportunityStatus;
};
type StatusFilter = 'All' | OpportunityStatus;
type Theme = 'dark' | 'light';


const FLYER_CONFIG: { key: FlyerKey, label: string }[] = [
    { key: 'doorHanger', label: 'Door Hanger' },
    { key: 'windows', label: 'Window Flyer' },
    { key: 'bath', label: 'Bath Flyer' },
    { key: 'roof', label: 'Roof Flyer' },
    { key: 'siding', label: 'Siding Flyer' }
];

const Overlay = ({ onClick }: { onClick: () => void }) => <div className="overlay" onClick={onClick}></div>;

const App = () => {
    const [isBriefingModalOpen, setBriefingModalOpen] = useState(false);
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

    const renderCurrentView = () => {
        if (currentView === 'hunter') {
            return <HunterView flyers={flyers} messageTemplates={messageTemplates} onAddTemplate={handleAddTemplate} />;
        }
        if (currentView === 'analytics') {
            return <AnalyticsView />;
        }
        if (currentView.startsWith('flyer-')) {
            const flyerKey = currentView.split('-')[1] as FlyerKey;
            return <FlyerManagerView flyerKey={flyerKey} flyers={flyers} setFlyers={setFlyers} />;
        }
        // Placeholder for other views
        return <div>View not implemented yet.</div>;
    };
    
    return (
        <div className="app-container">
            <Sidebar 
                currentView={currentView} 
                setView={setCurrentView} 
                isOpen={isSidebarOpen}
                theme={theme}
                toggleTheme={toggleTheme} 
            />
            <main className="main-content">
                <Header 
                    view={currentView}
                    onGenerateBriefing={() => setBriefingModalOpen(true)} 
                    onMenuToggle={() => setSidebarOpen(true)}
                />
                {renderCurrentView()}
            </main>
            {isSidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}
            {isBriefingModalOpen && <DailyBriefingModal onClose={() => setBriefingModalOpen(false)} />}
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

const Sidebar = ({ currentView, setView, isOpen, theme, toggleTheme }: { 
    currentView: View, 
    setView: (view: View) => void, 
    isOpen: boolean,
    theme: Theme,
    toggleTheme: () => void
}) => (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.219L19.531 8.5V15.5L12 19.781L4.469 15.5V8.5L12 4.219Z" fill="currentColor"/></svg>
            <h1>Woo Hunter</h1>
        </div>
        <nav className="sidebar-nav">
            <a href="#" className={`nav-item ${currentView === 'hunter' ? 'active' : ''}`} onClick={() => setView('hunter')}><DashboardIcon /><span>Hunter View</span></a>
            <a href="#" className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}><ChartIcon /><span>Analytics</span></a>
            
            <div className="sidebar-section-header">
                <ImageIcon />
                <span>Flyers</span>
            </div>
            {FLYER_CONFIG.map(({ key, label }) => (
                 <a href="#" key={key} className={`nav-item ${currentView === `flyer-${key}` ? 'active' : ''}`} onClick={() => setView(`flyer-${key}` as View)}>
                    <span>{label}</span>
                </a>
            ))}

            <div className="sidebar-section-header">
                <ToolsIcon />
                <span>Tools & Settings</span>
            </div>
            <a href="#" className="nav-item"><ToolsIcon /><span>Tool Status</span></a>
            <a href="#" className="nav-item"><SettingsIcon /><span>Settings</span></a>
        </nav>
        <div className="sidebar-footer">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="user-profile">
                <UserIcon />
                <span>John Doe</span>
            </div>
        </div>
    </aside>
);

const getHeaderTitle = (view: View) => {
    if (view === 'hunter') return 'Woo Hunter Dashboard';
    if (view === 'analytics') return 'Performance Analytics';
    if (view.startsWith('flyer-')) {
        const flyerKey = view.split('-')[1] as FlyerKey;
        const flyer = FLYER_CONFIG.find(f => f.key === flyerKey);
        return `Manage ${flyer?.label || 'Flyer'}`;
    }
    return 'Dashboard';
};


const Header = ({ view, onGenerateBriefing, onMenuToggle }: { view: View, onGenerateBriefing: () => void, onMenuToggle: () => void }) => (
    <header className="header">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Open sidebar">
            <MenuIcon />
        </button>
        <h2>{getHeaderTitle(view)}</h2>
        <div className="header-actions">
            {view === 'hunter' && <button className="btn btn-primary" onClick={onGenerateBriefing}>Generate Daily Briefing</button>}
        </div>
    </header>
);

const initialOpportunityData: Opportunity[] = [
    { id: 1, phone: '555-123-4567', email: 'permits@example.com', category: 'Bath', type: 'Building Permit', source: 'Maricopa County Bot', details: 'Bathroom remodel permit at 123 E Main St, Mesa. Home built 1998.', stealth: 95, status: 'New' },
    { id: 2, phone: '555-234-5678', email: 'newhome@example.com', category: 'Windows', type: 'New Homeowner', source: 'Zillow Scraper', details: '456 W Elm St, Phoenix. Sold 2 days ago. Built 1985.', stealth: 90, status: 'New' },
    { id: 3, phone: '555-345-6789', category: 'Windows', type: 'Social Media', source: 'FB Scanner', details: 'User in "Phoenix Moms" group posted: "Our windows are so drafty!"', stealth: 75, status: 'Contacted' },
    { id: 4, phone: '555-456-7890', email: 'quote_request@example.com', category: 'Windows', type: 'Competitor Mention', source: 'Competitor Watch', details: 'User requested a quote from Pella on a public forum.', stealth: 40, status: 'Interested' },
    { id: 5, phone: null, category: 'Roof', type: 'Building Permit', source: 'Pima County Bot', details: 'Roofing permit at 789 S Oak Ave, Tucson. Home built 2001.', stealth: 95, status: 'New' },
    { id: 6, phone: '555-678-9012', email: 'stormyweather@example.com', category: 'Siding', type: 'Storm Damage', source: 'Weather API', details: 'Hail reported in 85254. Home built 1995.', stealth: 88, status: 'New'},
    { id: 7, phone: '555-789-0123', category: 'Bath', type: 'Aging in Place', source: 'Demographic Analysis', details: 'Homeowner >65yrs, long-term resident. Good for walk-in tub.', stealth: 70, status: 'New'},
];

const HunterView = ({ flyers, messageTemplates, onAddTemplate }: { 
    flyers: Record<FlyerKey, string[]>;
    messageTemplates: string[];
    onAddTemplate: (template: string) => void;
}) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunityData);
    const [messageOpportunity, setMessageOpportunity] = useState<Opportunity | null>(null);
    const [emailOpportunity, setEmailOpportunity] = useState<Opportunity | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

    const handleUpdateStatus = (id: number, status: OpportunityStatus) => {
        setOpportunities(opportunities.map(opp => opp.id === id ? { ...opp, status } : opp));
    };

    const handleEnrichmentSuccess = (id: number, phone: string) => {
        setOpportunities(opportunities.map(opp => opp.id === id ? { ...opp, phone } : opp));
    };
    
    const filteredOpportunities = opportunities.filter(opp => {
        if (activeFilter === 'All') return opp.status !== 'Sent';
        return opp.status === activeFilter;
    });

    return (
        <div className="main-grid">
            <OpportunityFeed 
                opportunities={filteredOpportunities}
                onMessage={(opp) => setMessageOpportunity(opp)}
                onEmail={(opp) => setEmailOpportunity(opp)}
                onUpdateStatus={handleUpdateStatus}
                onEnrichmentSuccess={handleEnrichmentSuccess}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                flyers={flyers}
            />
            <div className="grid-item tool-status-container">
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
            {messageOpportunity && (
                <MessageModal 
                    opportunity={messageOpportunity} 
                    onClose={() => setMessageOpportunity(null)} 
                    templates={messageTemplates}
                    onAddTemplate={onAddTemplate}
                />
            )}
            {emailOpportunity && (
                 <EmailModal 
                    opportunity={emailOpportunity} 
                    onClose={() => setEmailOpportunity(null)}
                />
            )}
        </div>
    );
};

const AnalyticsView = () => (
     <div className="kpi-grid">
        <KpiCard title="New Opportunities" value="18" trend="+5 today" positive />
        <KpiCard title="Conversion Rate" value="5.2%" trend="+0.4%" positive/>
        <KpiCard title="Appointments Set" value="4" />
        <KpiCard title="Cost Per Acquisition" value="$152.80" trend="-3.5%" positive />
    </div>
);


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

const OpportunityFeed = ({ opportunities, onMessage, onEmail, onUpdateStatus, onEnrichmentSuccess, activeFilter, setActiveFilter, flyers }: { 
    opportunities: Opportunity[],
    onMessage: (opportunity: Opportunity) => void,
    onEmail: (opportunity: Opportunity) => void,
    onUpdateStatus: (id: number, status: OpportunityStatus) => void,
    onEnrichmentSuccess: (id: number, phone: string) => void,
    activeFilter: StatusFilter,
    setActiveFilter: (filter: StatusFilter) => void,
    flyers: Record<FlyerKey, string[]>
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
                                {categoryOpportunities.map((item) => <OpportunityCard key={item.id} opportunity={item} onMessage={() => onMessage(item)} onEmail={() => onEmail(item)} onUpdateStatus={onUpdateStatus} onEnrichmentSuccess={onEnrichmentSuccess} flyers={flyers} />)}
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
    onUpdateStatus: (id: number, status: OpportunityStatus) => void,
    onEnrichmentSuccess: (id: number, phone: string) => void,
    flyers: Record<FlyerKey, string[]>
}> = ({ opportunity, onMessage, onEmail, onUpdateStatus, onEnrichmentSuccess, flyers }) => {
    const [isEnriching, setIsEnriching] = useState(false);
    const [flyerMenuOpen, setFlyerMenuOpen] = useState(false);
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

    const handleSendFlyer = (type: FlyerKey) => {
        const designs = flyers[type];
        // Ensure designs is an array and has content before proceeding.
        if (!Array.isArray(designs) || designs.length === 0) {
            alert(`Please upload a design for "${type}" in 'Manage Flyers' first.`);
            return;
        }
        alert(`Your ${type} flyer has been sent to the address associated with: ${opportunity.details}`);
        setFlyerMenuOpen(false);
    }

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
             {opportunity.phone === null && <p className="no-phone-notice">Phone number needed for this lead.</p>}
            <div className="card-actions">
                {opportunity.status === 'New' && <button className="action-btn-sm" onClick={() => onUpdateStatus(opportunity.id, 'Contacted')}>Mark as Contacted</button>}
                {opportunity.status === 'Contacted' && <button className="action-btn-sm" onClick={() => onUpdateStatus(opportunity.id, 'Interested')}>Mark as Interested</button>}
            </div>
            <div className="card-footer">
                <span className="opportunity-source">Source: {opportunity.source}</span>
                <div className="opportunity-actions">
                    <div className="flyer-action-container" ref={flyerMenuRef}>
                         <button className="action-btn flyer-btn" onClick={() => setFlyerMenuOpen(!flyerMenuOpen)} disabled={!Object.values(flyers).some(f => f && f.length > 0)}>
                             Send Flyer
                         </button>
                         {flyerMenuOpen && (
                             <div className="flyer-dropdown">
                                {FLYER_CONFIG.map(opt => (
                                    <button 
                                        key={opt.key} 
                                        className="flyer-dropdown-item" 
                                        onClick={() => handleSendFlyer(opt.key)}
                                        // Fix: Add Array.isArray check as a type guard before accessing .length.
                                        disabled={!Array.isArray(flyers[opt.key]) || flyers[opt.key].length === 0}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                             </div>
                         )}
                    </div>
                     
                    {opportunity.phone ? (
                        <>
                            <button className="action-btn call-btn" onClick={handleCall}>Call</button>
                            <button className="action-btn msg-btn" onClick={onMessage}>Message</button>
                        </>
                    ) : (
                        <button className="action-btn enrich-btn" onClick={handleFindContactInfo} disabled={isEnriching}>
                            {isEnriching ? 'Searching...' : 'Find Contact Info'}
                        </button>
                    )}
                    <button className="action-btn email-btn" onClick={onEmail} disabled={!opportunity.email}>Email</button>

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

const DailyBriefingModal = ({ onClose }: {onClose: () => void}) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateBriefing = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                const prompt = `You are a marketing strategy AI for a single-owner window, shower, and bath company in Arizona. The company's unique selling proposition is a FLIR thermal camera scan offered with every free estimate to find hidden issues. Based on this data, write a concise, actionable 2-3 sentence daily briefing to help the owner beat large competitors:
                - Data: 5 new homeowner leads in Scottsdale (ZIP 85254).
                - Data: 15% increase in bathroom remodel permits in 85254.
                - Data: Competitor 'Pella' has increased ad spend on 'energy-efficient windows'.
                - Action: Formulate a strategy that leverages the FLIR camera advantage.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });
                
                setBriefing(response.text);
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

const MessageModal = ({ opportunity, onClose, templates, onAddTemplate }: { 
    opportunity: Opportunity, 
    onClose: () => void,
    templates: string[],
    onAddTemplate: (template: string) => void
}) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateMessage = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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

const EmailModal = ({ opportunity, onClose }: {
    opportunity: Opportunity,
    onClose: () => void,
}) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const generateEmail = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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

const FileUpload = ({ label, uploadedFiles, onFileUpload, onRemoveFile }: { 
    label: string, 
    uploadedFiles: string[], 
    onFileUpload: (files: string[]) => void,
    onRemoveFile: (index: number) => void
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
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };

    const triggerFileInput = () => document.getElementById(`file-input-${label}`)?.click();

    const hasFiles = uploadedFiles && uploadedFiles.length > 0;

    return (
        <div className="file-upload-container">
            {!hasFiles ? (
                <div className="empty-flyer-prompt">
                    <div className="empty-flyer-icon">
                        <ImageIcon />
                    </div>
                    <h3>No {label} Designs Uploaded</h3>
                    <p>Get started by uploading your first flyer design. You can upload multiple images at once.</p>
                    <button className="btn btn-primary" onClick={triggerFileInput}>
                        <UploadIcon />
                        Upload Flyer
                    </button>
                </div>
            ) : (
                <>
                    <div 
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <div className="drop-zone-prompt">
                            <UploadIcon />
                            <span>Drag & drop more files or click to upload</span>
                        </div>
                    </div>
                    <div className="flyer-gallery">
                        <h4>Your {label} Collection</h4>
                        <div className="gallery-grid">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="gallery-item">
                                    <img src={file} alt={`${label} preview ${index + 1}`} className="flyer-preview" />
                                    <button className="remove-flyer-btn" onClick={(e) => { e.stopPropagation(); onRemoveFile(index); }}>&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
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


const root = createRoot(document.getElementById('root')!);
root.render(<App />);