import { Head, usePage } from '@inertiajs/react';
import { formatDate } from '@/lib/date';
import { Clock, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import attendance from '@/routes/attendance';
import kasbonRoute from '@/routes/kasbon';
import type { Auth } from '@/types';

type Attendance = {
    id: number;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    work_minutes: number;
};

type KasbonRequest = {
    id: number;
    amount: string;
    status: string;
};

const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
        present: 'Hadir',
        late: 'Terlambat',
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };
    return labels[status] ?? status;
};

type PageProps = {
    auth: Auth;
    today: Attendance | null;
    metrics: { present: number; late: number; work_hours: number };
    pendingLeaves: number;
    pendingKasbon: number;
    kasbon: { limit: number; used: number; remaining: number };
    recentAttendances: Attendance[];
    recentKasbon: KasbonRequest[];
};

export default function Dashboard() {
    const { auth, today, metrics, pendingLeaves, pendingKasbon, kasbon, recentAttendances, recentKasbon } =
        usePage<PageProps>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Status hari ini</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {today?.status ? (today.status === 'present' ? 'Hadir' : today.status === 'late' ? 'Terlambat' : today.status) : 'Belum absen'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Hadir bulan ini</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {metrics.present}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Terlambat bulan ini</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {metrics.late}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Jam kerja</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {metrics.work_hours}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" /> Absensi
                            </CardTitle>
                            <Button asChild size="sm" variant="outline">
                                <a href={attendance.index.url()}>Buka</a>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Menunggu persetujuan izin/cuti: {pendingLeaves}
                            </p>
                            {recentAttendances.map((a) => (
                                <div key={a.id} className="flex justify-between text-sm">
                                    <span>{formatDate(a.date)}</span>
                                    <Badge>{statusLabel(a.status)}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" /> Kasbon
                            </CardTitle>
                            <Button asChild size="sm" variant="outline">
                                <a href={kasbonRoute.index.url()}>Buka</a>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm">
                                Limit: Rp {kasbon.limit.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm">
                                Terpakai: Rp {kasbon.used.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm">
                                Sisa: Rp {kasbon.remaining.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Menunggu persetujuan kasbon: {pendingKasbon}
                            </p>
                            {recentKasbon.map((k) => (
                                <div key={k.id} className="flex justify-between text-sm">
                                    <span>Rp {Number(k.amount).toLocaleString('id-ID')}</span>
                                    <Badge>{statusLabel(k.status)}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};