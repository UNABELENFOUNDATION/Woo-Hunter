import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class APIUsageMonitor:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.usage_file = os.path.join(data_dir, "api_usage.json")
        self.budgets_file = os.path.join(data_dir, "api_budgets.json")
        os.makedirs(data_dir, exist_ok=True)

        # Initialize usage tracking
        self._load_usage_data()
        self._load_budget_limits()

    def _load_usage_data(self):
        """Load API usage data from file"""
        if os.path.exists(self.usage_file):
            try:
                with open(self.usage_file, 'r') as f:
                    self.usage_data = json.load(f)
            except Exception as e:
                logger.error(f"Error loading usage data: {e}")
                self.usage_data = {}
        else:
            self.usage_data = {}

    def _load_budget_limits(self):
        """Load budget limits from file"""
        if os.path.exists(self.budgets_file):
            try:
                with open(self.budgets_file, 'r') as f:
                    self.budget_limits = json.load(f)
            except Exception as e:
                logger.error(f"Error loading budget data: {e}")
                self.budget_limits = {}
        else:
            # Default budget limits
            self.budget_limits = {
                "GEMINI_API": {
                    "daily_limit": 1000,  # requests per day
                    "monthly_limit": 30000,  # requests per month
                    "daily_cost_limit": 5.0,  # $ per day
                    "monthly_cost_limit": 100.0,  # $ per month
                    "cost_per_request": 0.001  # $ per request (estimate)
                },
                "GOOGLE_PLACES_API": {
                    "daily_limit": 1000,
                    "monthly_limit": 30000,
                    "daily_cost_limit": 2.0,
                    "monthly_cost_limit": 50.0,
                    "cost_per_request": 0.002
                },
                "OPENWEATHER_API": {
                    "daily_limit": 1000,
                    "monthly_limit": 100000,
                    "daily_cost_limit": 0.5,
                    "monthly_cost_limit": 10.0,
                    "cost_per_request": 0.0005
                }
            }
            self._save_budget_limits()

    def _save_usage_data(self):
        """Save usage data to file"""
        try:
            with open(self.usage_file, 'w') as f:
                json.dump(self.usage_data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving usage data: {e}")

    def _save_budget_limits(self):
        """Save budget limits to file"""
        try:
            with open(self.budgets_file, 'w') as f:
                json.dump(self.budget_limits, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving budget data: {e}")

    def record_api_call(self, api_name: str, endpoint: str = "", tokens_used: int = 0, cost: float = 0.0):
        """Record an API call"""
        today = datetime.now().strftime("%Y-%m-%d")
        current_time = datetime.now().isoformat()

        if api_name not in self.usage_data:
            self.usage_data[api_name] = {}

        if today not in self.usage_data[api_name]:
            self.usage_data[api_name][today] = {
                "total_calls": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "calls": []
            }

        # Update totals
        self.usage_data[api_name][today]["total_calls"] += 1
        self.usage_data[api_name][today]["total_tokens"] += tokens_used
        self.usage_data[api_name][today]["total_cost"] += cost

        # Add call record
        call_record = {
            "timestamp": current_time,
            "endpoint": endpoint,
            "tokens_used": tokens_used,
            "cost": cost
        }
        self.usage_data[api_name][today]["calls"].append(call_record)

        # Save data
        self._save_usage_data()

        # Check budget limits
        return self._check_budget_limits(api_name, today)

    def _check_budget_limits(self, api_name: str, date: str) -> Dict:
        """Check if budget limits are exceeded"""
        if api_name not in self.budget_limits:
            return {"status": "ok", "warnings": []}

        limits = self.budget_limits[api_name]
        usage = self.usage_data.get(api_name, {}).get(date, {})

        warnings = []
        should_block = False

        # Check daily limits
        if usage.get("total_calls", 0) >= limits.get("daily_limit", float('inf')):
            warnings.append(f"Daily call limit exceeded ({usage['total_calls']}/{limits['daily_limit']})")
            should_block = True

        if usage.get("total_cost", 0) >= limits.get("daily_cost_limit", float('inf')):
            warnings.append(f"Daily cost limit exceeded (${usage['total_cost']:.2f}/${limits['daily_cost_limit']:.2f})")
            should_block = True

        # Check monthly limits (simplified - just check current month)
        monthly_usage = self._get_monthly_usage(api_name)
        if monthly_usage["calls"] >= limits.get("monthly_limit", float('inf')):
            warnings.append(f"Monthly call limit exceeded ({monthly_usage['calls']}/{limits['monthly_limit']})")
            should_block = True

        if monthly_usage["cost"] >= limits.get("monthly_cost_limit", float('inf')):
            warnings.append(f"Monthly cost limit exceeded (${monthly_usage['cost']:.2f}/${limits['monthly_cost_limit']:.2f})")
            should_block = True

        return {
            "status": "blocked" if should_block else "warning" if warnings else "ok",
            "warnings": warnings,
            "usage": {
                "daily_calls": usage.get("total_calls", 0),
                "daily_cost": usage.get("total_cost", 0),
                "monthly_calls": monthly_usage["calls"],
                "monthly_cost": monthly_usage["cost"]
            }
        }

    def _get_monthly_usage(self, api_name: str) -> Dict:
        """Get monthly usage for current month"""
        current_month = datetime.now().strftime("%Y-%m")
        total_calls = 0
        total_cost = 0.0

        if api_name in self.usage_data:
            for date, data in self.usage_data[api_name].items():
                if date.startswith(current_month):
                    total_calls += data.get("total_calls", 0)
                    total_cost += data.get("total_cost", 0.0)

        return {"calls": total_calls, "cost": total_cost}

    def get_usage_report(self, api_name: str = None, days: int = 7) -> Dict:
        """Get usage report for specified period"""
        report = {}
        cutoff_date = datetime.now() - timedelta(days=days)

        if api_name:
            apis_to_check = [api_name]
        else:
            apis_to_check = list(self.usage_data.keys())

        for api in apis_to_check:
            if api not in self.usage_data:
                continue

            report[api] = {}
            total_calls = 0
            total_cost = 0.0

            for date_str, data in self.usage_data[api].items():
                try:
                    date = datetime.strptime(date_str, "%Y-%m-%d")
                    if date >= cutoff_date:
                        report[api][date_str] = data
                        total_calls += data.get("total_calls", 0)
                        total_cost += data.get("total_cost", 0.0)
                except ValueError:
                    continue

            report[api]["summary"] = {
                "total_calls": total_calls,
                "total_cost": total_cost,
                "avg_daily_calls": total_calls / max(days, 1),
                "avg_daily_cost": total_cost / max(days, 1)
            }

        return report

    def update_budget_limits(self, api_name: str, limits: Dict):
        """Update budget limits for an API"""
        if api_name not in self.budget_limits:
            self.budget_limits[api_name] = {}

        self.budget_limits[api_name].update(limits)
        self._save_budget_limits()

    def get_budget_status(self) -> Dict:
        """Get current budget status for all APIs"""
        status = {}
        today = datetime.now().strftime("%Y-%m-%d")

        for api_name, limits in self.budget_limits.items():
            usage = self.usage_data.get(api_name, {}).get(today, {})
            monthly_usage = self._get_monthly_usage(api_name)

            status[api_name] = {
                "limits": limits,
                "today": {
                    "calls": usage.get("total_calls", 0),
                    "cost": usage.get("total_cost", 0.0)
                },
                "month": {
                    "calls": monthly_usage["calls"],
                    "cost": monthly_usage["cost"]
                },
                "budget_check": self._check_budget_limits(api_name, today)
            }

        return status

# Global monitor instance
monitor = APIUsageMonitor()

def record_gemini_usage(tokens_input: int = 0, tokens_output: int = 0, model: str = "gemini-1.5-flash"):
    """Record Gemini API usage"""
    # Estimate cost based on model and tokens
    # Gemini 1.5 Flash pricing (approximate as of 2025)
    cost_per_million_input = 0.075  # $ per million input tokens
    cost_per_million_output = 0.30  # $ per million output tokens

    total_tokens = tokens_input + tokens_output
    cost = (tokens_input * cost_per_million_input + tokens_output * cost_per_million_output) / 1_000_000

    return monitor.record_api_call("GEMINI_API", model, total_tokens, cost)

def record_places_api_usage():
    """Record Google Places API usage"""
    # Estimate $0.002 per request
    return monitor.record_api_call("GOOGLE_PLACES_API", "places_search", 0, 0.002)

def record_weather_api_usage():
    """Record OpenWeather API usage"""
    # Estimate $0.0005 per request
    return monitor.record_api_call("OPENWEATHER_API", "weather_data", 0, 0.0005)

def get_usage_dashboard() -> Dict:
    """Get complete usage dashboard"""
    return {
        "current_status": monitor.get_budget_status(),
        "weekly_report": monitor.get_usage_report(days=7),
        "monthly_report": monitor.get_usage_report(days=30)
    }