import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Download, Calendar, Filter } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$45,678</p>
                <p className="text-xs text-green-600">+12.5% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-green-600">+8.2% from last month</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">$37.02</p>
                <p className="text-xs text-red-600">-2.1% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                <p className="text-xs text-green-600">+0.2 from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Revenue chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-medium">Organic Bananas</p>
                    <p className="text-sm text-gray-500">Fruits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">156 orders</p>
                  <p className="text-sm text-green-600">+23%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-medium">Fresh Milk</p>
                    <p className="text-sm text-gray-500">Dairy</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">134 orders</p>
                  <p className="text-sm text-green-600">+18%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-medium">Whole Wheat Bread</p>
                    <p className="text-sm text-gray-500">Bakery</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">98 orders</p>
                  <p className="text-sm text-red-600">-5%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Sales Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Revenue trends and forecasts</li>
                <li>• Sales performance by category</li>
                <li>• Peak hours and days analysis</li>
                <li>• Seasonal trends</li>
                <li>• Customer lifetime value</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Operational Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Delivery time analytics</li>
                <li>• Inventory turnover rates</li>
                <li>• Driver performance metrics</li>
                <li>• Order fulfillment rates</li>
                <li>• Customer satisfaction scores</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Business Intelligence</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Custom report generation</li>
                <li>• Data export capabilities</li>
                <li>• Real-time dashboards</li>
                <li>• Automated alerts</li>
                <li>• Predictive analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This section will provide comprehensive business intelligence, custom reports, and predictive analytics.
            </p>
            <Badge variant="outline">In Development</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

