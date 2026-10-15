import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, ShieldCheck, Database, Bell, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [npciGatewayMode, setNpciGatewayMode] = useState('SANDBOX');
  const [autoDeduplication, setAutoDeduplication] = useState(true);
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'System Settings Saved',
        description: 'Global configuration synced with State Data Center nodes.',
        variant: 'success',
      });
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="System & Governance Settings"
        description="Configure state infrastructure parameters, NPCI DBT gateway connectivity, and automated deduplication pipelines."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core State Configuration */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Database className="h-5 w-5 text-navy-900" />
              <span>Academic Session & Operational Scope</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Controls open application windows and student enrollment cohorts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Active Academic Year</Label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">NPCI / DBT Payment Bridge Mode</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={npciGatewayMode}
                  onChange={(e) => setNpciGatewayMode(e.target.value)}
                >
                  <option value="SANDBOX">SANDBOX (Simulation & Testing Mode)</option>
                  <option value="LIVE">LIVE (State Treasury Direct Connect)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dedup"
                  checked={autoDeduplication}
                  onChange={(e) => setAutoDeduplication(e.target.checked)}
                  className="h-4 w-4 rounded text-navy-900"
                />
                <Label htmlFor="dedup" className="cursor-pointer font-semibold text-slate-800">
                  Enforce Automated Aadhaar + Samagra Multi-Claim Deduplication Filter
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms"
                  checked={smsGatewayActive}
                  onChange={(e) => setSmsGatewayActive(e.target.checked)}
                  className="h-4 w-4 rounded text-navy-900"
                />
                <Label htmlFor="sms" className="cursor-pointer font-semibold text-slate-800">
                  Broadcast Real-Time SMS Updates to Student Registered Mobile Numbers
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t flex justify-end p-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-6 text-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
