import sys
sys.path.append('backend')
from marketing_automation import MarketingAutomation

ma = MarketingAutomation()
leads = ma.generate_real_lead_messages()
print('Generated', len(leads), 'leads')
print('Sample leads:')
for i, lead in enumerate(leads[:5]):
    print(str(i+1) + '. ' + lead['customer_name'] + ': ' + lead['message'][:60] + '...')