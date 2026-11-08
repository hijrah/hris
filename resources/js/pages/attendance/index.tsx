import { Form, Head, router, usePage } from '@inertiajs/react';
import { formatDate, formatDateTime, formatTime } from '@/lib/date';
import { Clock, LogIn, LogOut, MapPin } from 'lucide-react';
import AttendanceController from '@/actions/App/Http/Controllers/AttendanceController';
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

import type { Auth } from '@/types';

type Attendance = {
    id: number;
    user?: { name: string };
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    work_minutes: number;
};

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
    attendances: Attendance[];
    leaveRequests: LeaveRequest[];
    today: Attendance | null;
    metrics: { present: number; late: number; leave: number; work_hours: number };
    office: { lat: number; lng: number; radius: number };
};

const statusColor = (status: string) => {
    if (status === 'present' || status === 'approved') return 'default';
    if (status === 'late' || status === 'rejected') return 'destructive';
    return 'secondary';
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

export default function AttendanceIndex() {
    const { auth, attendances, leaveRequests, today, metrics, office } =
        usePage<PageProps>().props;

    const clockIn = () => {
        if (!navigator.geolocation) {
            router.post(AttendanceController.clockIn.url(), {}, { preserveScroll: true });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                router.post(
                    AttendanceController.clockIn.url(),
                    {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    },
                    { preserveScroll: true },
                );
            },
            () => {
                router.post(AttendanceController.clockIn.url(), {}, { preserveScroll: true });
            },
        );
    };

    const clockOut = () => {
        if (!navigator.geolocation) {
            router.post(AttendanceController.clockOut.url(), {}, { preserveScroll: true });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                router.post(
                    AttendanceController.clockOut.url(),
                    {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    },
                    { preserveScroll: true },
                );
            },
            () => {
                router.post(AttendanceController.clockOut.url(), {}, { preserveScroll: true });
            },
        );
    };

    return (
        <>
            <Head title="Attendance" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-4">
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
                            <CardTitle className="text-sm">Terlambat</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {metrics.late}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Cuti disetujui</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {metrics.leave}
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

                <Card>
                    <CardHeader>
                        <CardTitle>Absensi hari ini</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Status:{' '}
                                <Badge variant={statusColor(today?.status ?? '')}>
                                    {today?.status ? statusLabel(today.status) : 'Belum absen'}
                                </Badge>
                            </p>
                            <p className="text-sm">
                                Absen masuk: {formatDateTime(today?.clock_in)}
                            </p>
                            <p className="text-sm">
                                Absen pulang: {formatDateTime(today?.clock_out)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <MapPin className="inline h-3 w-3" /> Area kantor: {office.radius}m
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={clockIn} disabled={!!today?.clock_in}>
                                <LogIn className="mr-2 h-4 w-4" /> Absen masuk
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clockOut}
                                disabled={!today?.clock_in || !!today?.clock_out}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Absen pulang
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pengajuan izin / cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...AttendanceController.storeLeave.form()}
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
                                        <Button type="submit" disabled={processing}>Kirim pengajuan</Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat absensi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2">Karyawan</th>
                                        <th className="py-2">Tanggal</th>
                                        <th className="py-2">Masuk</th>
                                        <th className="py-2">Pulang</th>
                                        <th className="py-2">Menit kerja</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.map((a) => (
                                        <tr key={a.id} className="border-b">
                                            <td className="py-2">{a.user?.name ?? auth.user.name}</td>
                                            <td className="py-2">{formatDate(a.date)}</td>
                                            <td className="py-2">{formatTime(a.clock_in)}</td>
                                            <td className="py-2">{formatTime(a.clock_out)}</td>
                                            <td className="py-2">{a.work_minutes}</td>
                                            <td className="py-2">
                                                <Badge variant={statusColor(a.status)}>{statusLabel(a.status)}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pengajuan izin/cuti</CardTitle>
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
                                                                    AttendanceController.approveLeave.url({
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
                                                                    AttendanceController.rejectLeave.url({
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

AttendanceIndex.layout = {
    breadcrumbs: [
        { title: 'Attendance', href: '/attendance' },
    ],
};