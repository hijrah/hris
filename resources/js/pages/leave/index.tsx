import { Form, Head, router, usePage } from '@inertiajs/react';
import { formatDate } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import LeaveController from '@/actions/App/Http/Controllers/LeaveController';
import type { Auth } from '@/types';

type LeaveRequest = {
    id: number;
    user?: { name: string };
    type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
};

type PageProps = {
    auth: Auth;
    leaveRequests: LeaveRequest[];
    leaveBalance: number;
};

const statusColor = (status: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
};

const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };
    return labels[status] ?? status;
};

export default function LeaveIndex() {
    const { auth, leaveRequests, leaveBalance } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Izin & Cuti" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Sisa cuti tahunan: {leaveBalance} hari</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pengajuan izin / cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...LeaveController.store.form()}
                            options={{ preserveScroll: true }}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select name="type" defaultValue="annual">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="annual">Cuti tahunan</SelectItem>
                                                <SelectItem value="sick">Sakit</SelectItem>
                                                <SelectItem value="permission">Izin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-destructive">{errors.type}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tanggal mulai</Label>
                                        <Input type="date" name="start_date" required />
                                        <p className="text-xs text-destructive">{errors.start_date}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tanggal selesai</Label>
                                        <Input type="date" name="end_date" required />
                                        <p className="text-xs text-destructive">{errors.end_date}</p>
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Alasan</Label>
                                        <textarea
                                            name="reason"
                                            required
                                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                        <p className="text-xs text-destructive">{errors.reason}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button type="submit" disabled={processing}>
                                            Kirim pengajuan
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar izin/cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2">Karyawan</th>
                                        <th className="py-2">Jenis</th>
                                        <th className="py-2">Periode</th>
                                        <th className="py-2">Alasan</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map((r) => (
                                        <tr key={r.id} className="border-b">
                                            <td className="py-2">{r.user?.name ?? auth.user.name}</td>
                                            <td className="py-2">{r.type}</td>
                                            <td className="py-2">
                                                {formatDate(r.start_date)} -{' '}
                                                {formatDate(r.end_date)}
                                            </td>
                                            <td className="py-2">{r.reason}</td>
                                            <td className="py-2">
                                                <Badge variant={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                                            </td>
                                            <td className="py-2">
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    LeaveController.approve.url({
                                                                        leaveRequest: r.id,
                                                                    }),
                                                                    {},
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                        >
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.post(
                                                                    LeaveController.reject.url({
                                                                        leaveRequest: r.id,
                                                                    }),
                                                                    {},
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                        >
                                                            Tolak
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LeaveIndex.layout = {
    breadcrumbs: [{ title: 'Izin & Cuti', href: '/leave' }],
};