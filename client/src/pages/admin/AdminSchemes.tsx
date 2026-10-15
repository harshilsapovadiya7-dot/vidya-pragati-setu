import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { schemesApi, Scheme } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Edit2, CheckCircle2, XCircle, Power, Eye } from 'lucide-react';

export const AdminSchemes: React.FC = () => {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const data = await schemesApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes([
          {
            id: 'scheme-1',
            code: 'PMS-2026',
            title: 'Chief Minister Post-Matric Scholarship Scheme',
            shortDescription: 'Financial assistance for tuition & maintenance.',
            description: 'Comprehensive financial aid for higher secondary & college courses.',
            category: 'SCHOLARSHIP',
            benefitAmount: 18500,
            benefitType: 'Annual Direct Bank Transfer',
            academicYear: '2026-2027',
            applicationStartDate: '2026-07-01',
            applicationEndDate: '2026-11-30',
            isPublished: true,
            isActive: true,
          },
          {
            id: 'scheme-2',
            code: 'CYC-GIRL-2026',
            title: 'Free Bicycle Scheme for Rural Girl Students',
            shortDescription: 'Free bicycles provided to female students commuting >2km.',
            description: 'Targeted physical distribution with QR-coded serial numbers.',
            category: 'TRANSPORT',
            benefitAmount: 4200,
            benefitType: 'Hero All-Terrain 26T Bicycle',
            academicYear: '2026-2027',
            applicationStartDate: '2026-07-15',
            applicationEndDate: '2026-10-31',
            isPublished: true,
            isActive: true,
          },
          {
            id: 'scheme-3',
            code: 'PRE-MAT-2026',
            title: 'State Pre-Matric Merit Scholarship (Grades 9-10)',
            shortDescription: 'Cash assistance for secondary class supplies.',
            description: 'Direct cash assistance credited to student bank account.',
            category: 'SCHOLARSHIP',
            benefitAmount: 6000,
            benefitType: 'Aadhaar DBT Disbursal',
            academicYear: '2026-2027',
            applicationStartDate: '2026-08-01',
            applicationEndDate: '2026-12-15',
            isPublished: true,
            isActive: true,
          },
        ]);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleTogglePublish = async (scheme: Scheme) => {
    const updatedStatus = !scheme.isPublished;
    try {
      await schemesApi.publish(scheme.id, updatedStatus);
      toast({
        title: updatedStatus ? 'Scheme Published' : 'Scheme Unpublished',
        description: `Scheme ${scheme.code} is now ${updatedStatus ? 'visible to students' : 'hidden'}.`,
        variant: 'success',
      });
      setSchemes((prev) =>
        prev.map((s) => (s.id === scheme.id ? { ...s, isPublished: updatedStatus } : s))
      );
    } catch {
      setSchemes((prev) =>
        prev.map((s) => (s.id === scheme.id ? { ...s, isPublished: updatedStatus } : s))
      );
      toast({
        title: 'Status Toggled (Demo)',
        description: `Scheme status changed in session.`,
      });
    }
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme?.title || !editingScheme?.code) return;

    try {
      setSaving(true);
      if (isNew) {
        const created = await schemesApi.create(editingScheme);
        setSchemes([created || { ...(editingScheme as Scheme), id: `sch-${Date.now()}` }, ...schemes]);
        toast({ title: 'Scheme Created', variant: 'success' });
      } else {
        await schemesApi.update(editingScheme.id!, editingScheme);
        setSchemes((prev) =>
          prev.map((s) => (s.id === editingScheme.id ? { ...s, ...editingScheme } : s))
        );
        toast({ title: 'Scheme Updated', variant: 'success' });
      }
      setEditingScheme(null);
    } catch {
      toast({ title: 'Saved in Demo Session', variant: 'default' });
      setEditingScheme(null);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Scheme>[] = [
    {
      header: 'Code',
      accessorKey: 'code',
      sortable: true,
      cell: (s) => <span className="font-mono text-xs font-bold text-navy-900">{s.code}</span>,
    },
    {
      header: 'Scheme Title',
      accessorKey: 'title',
      sortable: true,
      cell: (s) => (
        <div className="max-w-xs">
          <p className="font-bold text-navy-950 text-xs sm:text-sm">{s.title}</p>
          <span className="text-[11px] text-muted-foreground">{s.shortDescription}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (s) => <Badge variant="outline">{s.category}</Badge>,
    },
    {
      header: 'Benefit Grant',
      accessorKey: 'benefitAmount',
      sortable: true,
      cell: (s) => (
        <span className="text-xs font-bold text-emerald-700">
          {s.benefitAmount ? formatCurrency(s.benefitAmount) : s.benefitType}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isPublished',
      sortable: true,
      cell: (s) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            s.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {s.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (s) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingScheme(s);
              setIsNew(false);
            }}
            className="h-8 px-2 text-xs"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTogglePublish(s)}
            className={`h-8 px-2 text-xs ${s.isPublished ? 'text-amber-700' : 'text-emerald-700'}`}
          >
            <Power className="h-3.5 w-3.5 mr-1" />
            {s.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="State Welfare Scheme Master Registry"
        description="Configure, publish, and govern all monetary (DBT) and physical entitlement schemes across secondary education."
      >
        <Button
          onClick={() => {
            setEditingScheme({
              code: '',
              title: '',
              category: 'SCHOLARSHIP',
              benefitAmount: 10000,
              academicYear: '2026-2027',
              isPublished: true,
              isActive: true,
            });
            setIsNew(true);
          }}
          className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Scheme</span>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={schemes}
        searchKey="title"
        searchPlaceholder="Search schemes by title or code..."
        isLoading={loading}
      />

      {/* Edit / Create Dialog */}
      <Dialog open={!!editingScheme} onOpenChange={() => setEditingScheme(null)}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveScheme}>
            <DialogHeader>
              <DialogTitle>{isNew ? 'Create New Welfare Scheme' : 'Edit Scheme Parameters'}</DialogTitle>
              <DialogDescription className="text-xs">
                Set beneficiary rules, financial grants, and application schedules.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Scheme Code</Label>
                  <Input
                    value={editingScheme?.code || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={editingScheme?.category || 'SCHOLARSHIP'}
                    onValueChange={(val: any) => setEditingScheme({ ...editingScheme, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHOLARSHIP">DBT Scholarship</SelectItem>
                      <SelectItem value="TRANSPORT">Transport (Bicycle)</SelectItem>
                      <SelectItem value="INCENTIVE">Merit Incentive</SelectItem>
                      <SelectItem value="UNIFORM">Uniform & Textbook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Scheme Title</Label>
                <Input
                  value={editingScheme?.title || ''}
                  onChange={(e) => setEditingScheme({ ...editingScheme, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Short Summary</Label>
                <Input
                  value={editingScheme?.shortDescription || ''}
                  onChange={(e) => setEditingScheme({ ...editingScheme, shortDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Benefit Amount (₹)</Label>
                  <Input
                    type="number"
                    value={editingScheme?.benefitAmount || 0}
                    onChange={(e) => setEditingScheme({ ...editingScheme, benefitAmount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Academic Session</Label>
                  <Input
                    value={editingScheme?.academicYear || '2026-2027'}
                    onChange={(e) => setEditingScheme({ ...editingScheme, academicYear: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingScheme(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-navy-900 hover:bg-navy-800 text-white font-bold">
                {saving ? 'Saving...' : isNew ? 'Create Scheme' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
