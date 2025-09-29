import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface Campaign {
  type: string;
  trigger: string;
  message: string;
  target_zips: string[];
  urgency: string;
  competitor?: string;
  demographics?: any;
}

interface CampaignResult {
  total_campaigns: number;
  weather_campaigns: number;
  permit_campaigns: number;
  competitor_campaigns: number;
  campaigns: Campaign[];
}

interface ROIData {
  total_leads: number;
  total_revenue: number;
  campaign_count: number;
}

export default function MarketingDashboard() {
  const [campaignData, setCampaignData] = useState<CampaignResult | null>(null);
  const [roiData, setRoiData] = useState<Record<string, ROIData>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const runCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/marketing/run-campaigns`);
      const data = await response.json();
      setCampaignData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      alert(`Generated ${data.total_campaigns} campaign and ${data.lead_summary?.total_leads || 0} fresh leads for high-value Phoenix areas!`);
    } catch (error) {
      alert('Failed to run campaigns');
    }
    setLoading(false);
  };

  const loadReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/marketing/campaign-report`);
      const data = await response.json();
      setRoiData(data.roi_tracking);
    } catch (error) {
      console.error('Failed to load report:', error);
    }
  };

  useEffect(() => {
    loadReport();

    // Check if we should run daily campaigns (midnight/morning or 24+ hours since last run)
    const lastRun = localStorage.getItem('lastCampaignRun');
    const now = new Date();
    const shouldRun = !lastRun ||
                      (now.getTime() - new Date(lastRun).getTime()) > (24 * 60 * 60 * 1000) || // 24 hours
                      (now.getHours() >= 0 && now.getHours() <= 6); // Midnight to 6 AM

    if (shouldRun) {
      runCampaigns();
      localStorage.setItem('lastCampaignRun', now.toISOString());
    }
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44aa44';
      default: return '#666666';
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>
        🚀 Marketing Automation Dashboard
      </h1>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px' }}>
        Generate 10-20 fresh leads per day for the most influential Phoenix areas
        {lastUpdate && <span style={{ display: 'block', fontSize: '12px', color: '#3498db', marginTop: '5px' }}>
          � Last updated: {lastUpdate} (Daily opportunity generation for Phoenix window market)
        </span>}
      </p>

      <button
        style={{
          backgroundColor: loading ? '#bdc3c7' : '#3498db',
          color: 'white',
          padding: '15px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '20px'
        }}
        onClick={runCampaigns}
        disabled={loading}
      >
        {loading ? '🔄 Generating Daily Leads...' : '🎯 Generate Daily Leads'}
      </button>

      {campaignData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Campaign Results</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', flex: 1, padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '0 2px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{campaignData.total_campaigns}</div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Total Campaigns</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '0 2px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{campaignData.weather_campaigns}</div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Weather-Based</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '0 2px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{campaignData.permit_campaigns}</div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Permit-Based</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '0 2px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{campaignData.competitor_campaigns}</div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Competitor-Based</div>
            </div>
          </div>

          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📢 Active Campaigns</h3>
          {campaignData.campaigns.map((campaign, index) => (
            <div key={index} style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px',
              borderLeft: '4px solid #3498db'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{campaign.type.toUpperCase()}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  backgroundColor: getUrgencyColor(campaign.urgency)
                }}>
                  {campaign.urgency}
                </span>
              </div>
              <p style={{ color: '#e74c3c', marginBottom: '5px', fontSize: '14px' }}>🎯 {campaign.trigger}</p>
              <p style={{ color: '#34495e', marginBottom: '5px', fontSize: '14px', lineHeight: '1.4' }}>{campaign.message}</p>
              <p style={{ color: '#7f8c8d', marginBottom: '3px', fontSize: '12px' }}>🎯 Targeting high-value Phoenix areas</p>
              {campaign.competitor && (
                <p style={{ color: '#e67e22', fontSize: '12px', fontStyle: 'italic' }}>🏢 Targeting competitor: {campaign.competitor}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {campaignData?.real_leads && campaignData.real_leads.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>📞 Incoming Customer Leads</h2>

          {campaignData.lead_summary && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div><strong>{campaignData.lead_summary.total_leads}</strong> Total Leads</div>
              <div><strong style={{color: '#e74c3c'}}>{campaignData.lead_summary.high_priority}</strong> High Priority</div>
              <div><strong>${campaignData.lead_summary.total_value.toLocaleString()}</strong> Total Value</div>
              <div><strong>${campaignData.lead_summary.avg_value.toLocaleString()}</strong> Avg Value</div>
            </div>
          )}

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {campaignData.real_leads.map((lead: any, index: number) => (
              <div key={lead.id} style={{
                backgroundColor: lead.urgency === 'high' ? '#fff5f5' : lead.urgency === 'medium' ? '#fffbf0' : '#f8f9fa',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                borderLeft: `4px solid ${lead.urgency === 'high' ? '#e74c3c' : lead.urgency === 'medium' ? '#f39c12' : '#27ae60'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {lead.customer_name} • {lead.source === 'phone_call' ? '📞' : lead.source === 'text_message' ? '💬' : '📧'} {lead.source.replace('_', ' ')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: lead.urgency === 'high' ? '#e74c3c' : lead.urgency === 'medium' ? '#f39c12' : '#27ae60'
                    }}>
                      {lead.urgency.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      ${lead.estimated_value.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#34495e', marginBottom: '5px', fontSize: '14px', lineHeight: '1.4' }}>
                  "{lead.message}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                    📍 ZIP: {lead.zip_code} • {lead.type.replace('_', ' ')}
                  </span>
                  {lead.follow_up_needed && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', fontWeight: 'bold' }}>
                      🚨 Follow Up Needed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {campaignData?.live_metrics && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>📈 Live Phoenix Window Market Data</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d68910' }}>{campaignData.live_metrics.lead_velocity}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Lead Flow</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724' }}>{campaignData.live_metrics.conversion_rate}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Quote Rate</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#cce5ff', borderRadius: '6px', border: '1px solid #99d6ff' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#004085' }}>{campaignData.live_metrics.avg_deal_size}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Avg Project</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8d7da', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#721c24' }}>{campaignData.live_metrics.competitor_activity}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Local Competition</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d68910' }}>{campaignData.live_metrics.market_temperature}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Demand Heat</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#d1ecf1', borderRadius: '6px', border: '1px solid #bee5eb' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0c5460' }}>{campaignData.live_metrics.permit_volume}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Building Permits</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#e2e3e5', borderRadius: '6px', border: '1px solid #d6d8db' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#383d41' }}>{campaignData.live_metrics.response_time}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Response SLA</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#495057' }}>{campaignData.live_metrics.cost_per_lead}</div>
              <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Cost/Lead</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '10px' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{campaignData.live_metrics.market_trend}</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '10px' }}>Phoenix Window Market</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c' }}>{campaignData.live_metrics.volatility_index}</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '10px' }}>Market Volatility</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>{campaignData.live_metrics.roi_multiplier}</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '10px' }}>ROI Multiplier</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#95a5a6', textAlign: 'center', marginTop: '8px', lineHeight: '1.3' }}>
            💡 <strong>Market Intelligence:</strong> Lead velocity shows hourly inquiries, conversion rate tracks quote-to-sale success,
            deal size reflects average project value, competitor activity monitors local competition, market temperature combines weather + construction demand
          </div>
        </div>
      )}

      {Object.keys(roiData).length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>💰 Campaign ROI Tracking</h2>
          {Object.entries(roiData).map(([type, data]: [string, ROIData]) => (
            <div key={type} style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>{type.replace('_', ' ').toUpperCase()}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#27ae60', fontSize: '12px', flex: 1, textAlign: 'center' }}>📞 {data.total_leads} leads</span>
                <span style={{ color: '#27ae60', fontSize: '12px', flex: 1, textAlign: 'center' }}>💵 ${data.total_revenue.toLocaleString()}</span>
                <span style={{ color: '#27ae60', fontSize: '12px', flex: 1, textAlign: 'center' }}>📈 {data.campaign_count} campaigns</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>ℹ️ How It Works</h2>
        <p style={{ color: '#34495e', marginBottom: '8px', lineHeight: '1.4' }}>
          • <strong>Weather Campaigns:</strong> Triggered by temperature extremes (&gt;100°F heat waves, &lt;60°F cold fronts)
        </p>
        <p style={{ color: '#34495e', marginBottom: '8px', lineHeight: '1.4' }}>
          • <strong>Permit Campaigns:</strong> Target high-income ZIP codes with recent construction activity
        </p>
        <p style={{ color: '#34495e', marginBottom: '8px', lineHeight: '1.4' }}>
          • <strong>Competitor Campaigns:</strong> Position against competitors with low ratings or few reviews
        </p>
        <p style={{ color: '#34495e', marginBottom: '8px', lineHeight: '1.4' }}>
          • <strong>100% FREE:</strong> Uses OpenWeather, Census Bureau, and OpenStreetMap APIs
        </p>
      </div>
    </div>
  );
}