import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Database, 
  Shield, 
  Server, 
  HardDrive, 
  Cpu,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and maintenance</p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Debug Mode</h3>
                  <p className="text-sm text-gray-500">Enable detailed error logging</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto Backup</h3>
                  <p className="text-sm text-gray-500">Automatically backup database daily</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Session Timeout</h3>
                  <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-md w-32">
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="480">8 hours</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Password Policy</h3>
                  <p className="text-sm text-gray-500">Enforce strong passwords</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">IP Whitelist</h3>
                  <p className="text-sm text-gray-500">Restrict admin access by IP</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Rate Limiting</h3>
                  <p className="text-sm text-gray-500">Limit API requests per user</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Database Status</h3>
                  <p className="text-sm text-gray-500">Current database health</p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Last Backup</h3>
                  <p className="text-sm text-gray-500">Most recent database backup</p>
                </div>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Storage Used</h3>
                  <p className="text-sm text-gray-500">Database storage usage</p>
                </div>
                <p className="text-sm text-gray-600">2.3 GB / 10 GB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Restore Backup
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Optimize Database
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              System Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">CPU Usage</h3>
                  <p className="text-sm text-gray-500">Current CPU utilization</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">45%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/5 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Memory Usage</h3>
                  <p className="text-sm text-gray-500">Current memory utilization</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">68%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-4/5 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Disk Usage</h3>
                  <p className="text-sm text-gray-500">Storage utilization</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">32%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/3 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Data Management</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">System Maintenance</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Server className="h-4 w-4 mr-2" />
                  Restart Services
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update System
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Emergency Actions</h3>
              <div className="space-y-2">
                <Button variant="destructive" size="sm" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Shutdown
                </Button>
                <Button variant="destructive" size="sm" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Reset Database
                </Button>
                <Button variant="destructive" size="sm" className="w-full">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
